# Tauri时间助手开发文档

## 架构概览

### 前端 (React + TypeScript)
```
src/
├── components/          # React组件
│   ├── PlanCard.tsx    # 计划卡片组件
│   ├── AddPlanDialog.tsx  # 添加计划对话框
│   ├── ReflectionDialog.tsx  # 反思记录对话框
│   └── SettingsPanel.tsx  # 设置面板
├── hooks/              # 自定义Hooks
│   ├── usePlans.ts     # 计划管理Hook
│   ├── useTimer.ts     # 计时器Hook
│   └── useTheme.ts     # 主题切换Hook
├── types/              # TypeScript类型定义
│   └── index.ts        # 所有类型定义
├── utils/              # 工具函数
│   ├── api.ts          # API调用封装
│   └── format.ts       # 格式化函数
├── App.tsx             # 主应用组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

### 后端 (Rust)
```
src-tauri/
├── src/
│   ├── main.rs         # 主程序入口
│   ├── database.rs     # 数据库操作
│   └── commands.rs     # Tauri命令定义
├── Cargo.toml          # Rust依赖配置
├── tauri.conf.json     # Tauri配置
└── build.rs            # 构建脚本
```

## 核心功能实现

### 1. 系统级置顶

#### Rust后端
```rust
#[tauri::command]
pub async fn toggle_always_on_top(
    window: tauri::Window, 
    always_on_top: bool
) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())
}
```

#### 前端调用
```typescript
import { windowApi } from '../utils/api';

await windowApi.toggleAlwaysOnTop(true);
```

### 2. 数据持久化 (SQLite)

#### 数据库结构
```sql
-- 计划表
CREATE TABLE plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    category TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    total_time INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 反思表
CREATE TABLE reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
```

#### Rust操作
```rust
pub fn add_plan(&self, plan: &Plan) -> Result<i64> {
    let conn = self.conn.lock().unwrap();
    conn.execute(
        "INSERT INTO plans (title, description, ...) VALUES (?1, ?2, ...)",
        params![plan.title, plan.description, ...]
    )?;
    Ok(conn.last_insert_rowid())
}
```

### 3. 系统托盘

#### 托盘菜单配置
```rust
let tray_menu = SystemTrayMenu::new()
    .add_item(CustomMenuItem::new("show", "显示窗口"))
    .add_item(CustomMenuItem::new("toggle_top", "切换置顶"))
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(CustomMenuItem::new("quit", "退出"));
```

#### 事件处理
```rust
.on_system_tray_event(|app, event| match event {
    SystemTrayEvent::LeftClick { .. } => {
        let window = app.get_window("main").unwrap();
        if window.is_visible().unwrap() {
            window.hide().unwrap();
        } else {
            window.show().unwrap();
        }
    }
    // 处理其他事件...
})
```

### 4. 时间跟踪

#### 自定义Hook
```typescript
export function useTimer(planId: number, initialTime: number = 0) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return { time, isRunning, start, stop, reset };
}
```

### 5. 主题切换

#### 实现方式
```typescript
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, toggleTheme };
}
```

## API接口

### 计划管理
- `add_plan(plan)` - 添加新计划
- `get_all_plans()` - 获取所有计划
- `update_plan(plan)` - 更新计划
- `delete_plan(id)` - 删除计划

### 反思记录
- `add_reflection(reflection)` - 添加反思
- `get_reflections_for_plan(planId)` - 获取计划的所有反思
- `delete_reflection(id)` - 删除反思

### 窗口控制
- `toggle_always_on_top(alwaysOnTop)` - 切换置顶状态
- `set_window_position(x, y)` - 设置窗口位置
- `set_window_size(width, height)` - 设置窗口大小

### 数据管理
- `export_data()` - 导出所有数据为JSON

## 开发指南

### 添加新的Tauri命令

1. 在 `src-tauri/src/commands.rs` 中定义命令：
```rust
#[tauri::command]
pub async fn your_command(param: String) -> Result<String, String> {
    // 实现逻辑
    Ok("success".to_string())
}
```

2. 在 `src-tauri/src/main.rs` 中注册：
```rust
.invoke_handler(tauri::generate_handler![
    // 其他命令...
    commands::your_command,
])
```

3. 在前端调用：
```typescript
import { invoke } from '@tauri-apps/api/tauri';

const result = await invoke('your_command', { param: 'value' });
```

### 添加新的数据库表

1. 在 `src-tauri/src/database.rs` 中定义结构：
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct YourTable {
    pub id: Option<i64>,
    pub field: String,
}
```

2. 在 `Database::new()` 中创建表：
```rust
conn.execute(
    "CREATE TABLE IF NOT EXISTS your_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        field TEXT NOT NULL
    )",
    [],
)?;
```

3. 添加CRUD方法并暴露为Tauri命令

### 样式自定义

使用Tailwind CSS进行样式定制，主题色在 `tailwind.config.js` 中配置：

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... 其他颜色
        900: '#1e3a8a',
      },
    },
  },
}
```

## 性能优化

### 1. 数据库优化
- 使用索引提高查询速度
- 定期清理无用数据
- 批量操作代替多次单独操作

### 2. 前端优化
- 使用React.memo避免不必要的重渲染
- 懒加载大型组件
- 虚拟滚动处理大量列表

### 3. 打包优化
- 启用LTO (Link Time Optimization)
- 使用strip移除调试符号
- 优化图片和资源大小

## 调试技巧

### 前端调试
在开发模式下按 `F12` 打开Chrome DevTools

### Rust调试
使用 `println!` 或 `dbg!` 宏输出调试信息：
```rust
println!("Debug: {:?}", variable);
dbg!(&variable);
```

### 数据库调试
使用SQLite浏览器工具查看数据库：
- DB Browser for SQLite
- SQLiteStudio

## 常见问题

### Q: 编译失败，提示找不到依赖
A: 运行 `cargo clean` 然后重新编译

### Q: 窗口置顶不生效
A: 检查操作系统权限设置，某些系统需要授权

### Q: 数据丢失
A: 定期备份数据库文件，位置见 `DEPLOYMENT.md`

### Q: 内存占用过高
A: 检查是否有内存泄漏，使用性能分析工具

## 未来功能规划

- [ ] 数据云同步
- [ ] 多语言支持
- [ ] 番茄钟工作法集成
- [ ] 统计报表和数据可视化
- [ ] 插件系统
- [ ] 移动端同步
- [ ] AI辅助计划建议

## 参考资源

- Tauri文档: https://tauri.app/
- Rust文档: https://doc.rust-lang.org/
- React文档: https://react.dev/
- TypeScript文档: https://www.typescriptlang.org/
- Tailwind CSS: https://tailwindcss.com/
