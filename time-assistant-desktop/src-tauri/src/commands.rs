use crate::database::{Database, Plan, Reflection};
use std::sync::Arc;
use tauri::{Manager, State};

#[tauri::command]
pub async fn add_plan(db: State<'_, Arc<Database>>, plan: Plan) -> Result<i64, String> {
    db.add_plan(&plan).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_plans(db: State<'_, Arc<Database>>) -> Result<Vec<Plan>, String> {
    db.get_all_plans().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_plan(db: State<'_, Arc<Database>>, plan: Plan) -> Result<(), String> {
    db.update_plan(&plan).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_plan(db: State<'_, Arc<Database>>, id: i64) -> Result<(), String> {
    db.delete_plan(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_reflection(
    db: State<'_, Arc<Database>>,
    reflection: Reflection,
) -> Result<i64, String> {
    db.add_reflection(&reflection).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_reflections_for_plan(
    db: State<'_, Arc<Database>>,
    plan_id: i64,
) -> Result<Vec<Reflection>, String> {
    db.get_reflections_for_plan(plan_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_reflection(db: State<'_, Arc<Database>>, id: i64) -> Result<(), String> {
    db.delete_reflection(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_data(db: State<'_, Arc<Database>>) -> Result<String, String> {
    db.export_data().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn toggle_always_on_top(
    app: tauri::AppHandle,
    always_on_top: bool,
) -> Result<(), String> {
    let window = app
        .get_window("main")
        .ok_or("无法获取主窗口")?;
    
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| format!("设置窗口置顶失败: {}", e))
}

#[tauri::command]
pub async fn set_window_position(
    window: tauri::Window,
    x: i32,
    y: i32,
) -> Result<(), String> {
    window
        .set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn set_window_size(
    window: tauri::Window,
    width: u32,
    height: u32,
) -> Result<(), String> {
    window
        .set_size(tauri::Size::Physical(tauri::PhysicalSize { width, height }))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn send_notification(
    app: tauri::AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    use tauri::api::notification::Notification;
    
    Notification::new(&app.config().tauri.bundle.identifier)
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn is_autostart_enabled(app: tauri::AppHandle) -> Result<bool, String> {
    use auto_launch::AutoLaunchBuilder;
    
    // Keep config alive to prevent temporary value from being dropped
    let config = app.config();
    let app_name = config.package.product_name.as_deref().unwrap_or("Time Assistant");
    let app_path = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .to_str()
        .ok_or("Invalid path")?
        .to_string();
    
    let auto = AutoLaunchBuilder::new()
        .set_app_name(app_name)
        .set_app_path(&app_path)
        .build()
        .map_err(|e| format!("Failed to build AutoLaunch: {}", e))?;
    
    auto.is_enabled()
        .map_err(|e| format!("Failed to check autostart status: {}", e))
}

#[tauri::command]
pub async fn enable_autostart(app: tauri::AppHandle) -> Result<(), String> {
    use auto_launch::AutoLaunchBuilder;
    
    // Keep config alive to prevent temporary value from being dropped
    let config = app.config();
    let app_name = config.package.product_name.as_deref().unwrap_or("Time Assistant");
    let app_path = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .to_str()
        .ok_or("Invalid path")?
        .to_string();
    
    let auto = AutoLaunchBuilder::new()
        .set_app_name(app_name)
        .set_app_path(&app_path)
        .build()
        .map_err(|e| format!("Failed to build AutoLaunch: {}", e))?;
    
    auto.enable()
        .map_err(|e| format!("Failed to enable autostart: {}", e))
}

#[tauri::command]
pub async fn disable_autostart(app: tauri::AppHandle) -> Result<(), String> {
    use auto_launch::AutoLaunchBuilder;
    
    // Keep config alive to prevent temporary value from being dropped
    let config = app.config();
    let app_name = config.package.product_name.as_deref().unwrap_or("Time Assistant");
    let app_path = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .to_str()
        .ok_or("Invalid path")?
        .to_string();
    
    let auto = AutoLaunchBuilder::new()
        .set_app_name(app_name)
        .set_app_path(&app_path)
        .build()
        .map_err(|e| format!("Failed to build AutoLaunch: {}", e))?;
    
    auto.disable()
        .map_err(|e| format!("Failed to disable autostart: {}", e))
}
