#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod database;

use database::Database;
use std::sync::Arc;
use tauri::{
    CustomMenuItem, GlobalShortcutManager, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, 
    SystemTrayMenuItem,
};

fn main() {
    // 获取数据库路径
    let app_dir = dirs::data_local_dir()
        .unwrap()
        .join("time-assistant");
    
    std::fs::create_dir_all(&app_dir).unwrap();
    let db_path = app_dir.join("data.db");

    // 初始化数据库
    let db = Arc::new(Database::new(db_path).expect("Failed to initialize database"));

    // 创建系统托盘菜单
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show".to_string(), "显示窗口"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "退出"));

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .manage(db)
        .system_tray(system_tray)
        .setup(|app| {
            // 注册全局快捷键
            let mut shortcuts = app.global_shortcut_manager();
            
            // Ctrl+Shift+T 显示/隐藏窗口
            let window = app.get_window("main").unwrap();
            let window_clone = window.clone();
            shortcuts
                .register("CmdOrCtrl+Shift+T", move || {
                    if window_clone.is_visible().unwrap() {
                        window_clone.hide().unwrap();
                    } else {
                        window_clone.show().unwrap();
                        window_clone.set_focus().unwrap();
                    }
                })
                .unwrap_or_else(|e| eprintln!("Failed to register shortcut: {}", e));

            Ok(())
        })
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::add_plan,
            commands::get_all_plans,
            commands::update_plan,
            commands::delete_plan,
            commands::add_reflection,
            commands::get_reflections_for_plan,
            commands::delete_reflection,
            commands::export_data,
            commands::toggle_always_on_top,
            commands::set_window_position,
            commands::set_window_size,
            commands::send_notification,
            commands::is_autostart_enabled,
            commands::enable_autostart,
            commands::disable_autostart,
        ])
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
