# Time Assistant Desktop - 时间助手桌面版

一个功能强大的桌面时间管理助手，支持系统级置顶显示、计划管理、反思记录和时间跟踪。

## ⚠️ 重要提示

**本项目当前状态：** 源代码已完成，但**尚未编译测试**。

这是一个需要在本地Rust环境中编译的项目。在使用前请务必：
1. 阅读 `BUILD_FIRST.md` - 编译前必读
2. 阅读 `TESTING_CHECKLIST.md` - 测试验证清单
3. 完成环境配置和编译
4. 执行完整的功能测试

**预计时间投入：** 1-2小时（环境准备 + 编译 + 测试）

## 功能特性

### 核心功能（已实现代码）
- **系统级置顶**: 始终显示在其他应用窗口之上
- **计划管理**: 添加、编辑、删除计划，支持优先级和分类
- **反思记录**: 为每个计划记录执行反思
- **时间跟踪**: 实时计时器和累计时间统计
- **数据持久化**: SQLite本地数据库存储
- **系统托盘**: 最小化到托盘，快速访问
- **开机自启**: 系统启动时自动运行（需测试）
- **全局快捷键**: Ctrl+Shift+T 显示/隐藏窗口（需测试）
- **系统通知**: 任务提醒功能（已集成API）
- **主题切换**: 浅色/深色主题
- **数据导出**: JSON格式备份

### 待验证功能
以下功能代码已实现，但需要在实际环境中测试：
- 开机自启在不同系统的兼容性
- 全局快捷键冲突处理
- 系统通知权限申请
- 图标在各系统的显示效果

### 技术栈
- **后端**: Rust + Tauri + SQLite
- **前端**: React + TypeScript + Tailwind CSS
- **打包**: 跨平台可执行文件（Windows、macOS、Linux）

## 环境要求

### 开发环境
- Node.js >= 18.0.0
- Rust >= 1.70.0
- pnpm 或 npm

### 系统要求
- **Windows**: Windows 10/11 (64-bit)
- **macOS**: macOS 10.15+
- **Linux**: Ubuntu 20.04+ / Debian 10+ / Fedora 35+

## 安装步骤

### 1. 安装Rust
```bash
# Windows
# 下载并运行: https://rustup.rs/

# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. 安装Node.js依赖
```bash
cd time-assistant-desktop
pnpm install
# 或
npm install
```

### 3. 安装Tauri CLI
```bash
cargo install tauri-cli
# 或使用npm
npm install -g @tauri-apps/cli
```

## 开发运行

### 启动开发服务器
```bash
pnpm tauri dev
# 或
npm run tauri dev
```

### 构建生产版本
```bash
pnpm tauri build
# 或
npm run tauri build
```

构建后的可执行文件位于 `src-tauri/target/release/`

## 项目结构

```
time-assistant-desktop/
├── src/                    # 前端源代码
│   ├── components/        # React组件
│   ├── hooks/            # 自定义Hooks
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx           # 主应用组件
│   └── main.tsx          # 入口文件
├── src-tauri/             # Tauri后端
│   ├── src/              # Rust源代码
│   │   ├── main.rs       # 主程序
│   │   ├── database.rs   # 数据库操作
│   │   └── commands.rs   # Tauri命令
│   ├── Cargo.toml        # Rust依赖配置
│   └── tauri.conf.json   # Tauri配置
├── public/                # 静态资源
├── package.json          # Node.js配置
└── README.md             # 项目说明

```

## 使用说明

### 基本操作
1. **添加计划**: 点击"添加计划"按钮，填写标题、描述、优先级和分类
2. **开始计时**: 点击计划卡片上的计时按钮开始跟踪时间
3. **添加反思**: 完成计划后，点击"添加反思"记录执行情况
4. **置顶设置**: 通过设置菜单切换窗口置顶状态
5. **主题切换**: 支持浅色/深色主题切换

### 快捷键
- `Ctrl/Cmd + N`: 新建计划
- `Ctrl/Cmd + T`: 切换置顶状态
- `Ctrl/Cmd + ,`: 打开设置
- `Esc`: 关闭当前对话框

### 系统托盘
- 最小化到托盘: 关闭窗口后应用继续在后台运行
- 右键菜单: 快速访问常用功能
- 双击图标: 显示/隐藏主窗口

## 数据管理

### 数据存储位置
- **Windows**: `%APPDATA%/time-assistant/data.db`
- **macOS**: `~/Library/Application Support/time-assistant/data.db`
- **Linux**: `~/.local/share/time-assistant/data.db`

### 数据备份
应用支持数据导出和导入功能：
1. 打开设置 -> 数据管理
2. 点击"导出数据"保存备份文件
3. 使用"导入数据"恢复备份

## 常见问题

### Q: 应用无法置顶？
A: 检查操作系统权限设置，某些安全软件可能阻止窗口置顶功能。

### Q: 如何设置开机自启？
A: 在应用设置中启用"开机自动启动"选项。

### Q: 数据丢失怎么办？
A: 定期使用导出功能备份数据，数据库文件也可以手动复制备份。

## 开发说明

### 添加新功能
1. 前端组件放在 `src/components/`
2. Rust命令放在 `src-tauri/src/commands.rs`
3. 在 `tauri.conf.json` 中注册新命令

### 调试技巧
- 使用 `console.log()` 在前端调试
- 使用 `println!()` 在Rust端调试
- 开发模式下按 `F12` 打开开发者工具

## 贡献指南
欢迎提交Issue和Pull Request！

## 许可证
MIT License

## 作者
MiniMax Agent

## 更新日志
### v1.0.0 (2025-10-29)
- 初始版本发布
- 实现核心功能：计划管理、反思记录、时间跟踪
- 支持系统级置顶
- SQLite数据持久化
- 系统托盘和开机自启
