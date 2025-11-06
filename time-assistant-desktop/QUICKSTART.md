# 快速开始指南

## 第一步：安装环境

### 安装Rust
```bash
# Windows: 访问 https://rustup.rs/ 下载安装器
# macOS/Linux:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 安装Node.js
访问 https://nodejs.org/ 下载安装 LTS 版本

### 安装pnpm（推荐）
```bash
npm install -g pnpm
```

## 第二步：安装依赖

```bash
cd time-assistant-desktop
pnpm install
```

## 第三步：运行开发版本

```bash
pnpm tauri dev
```

首次运行会编译Rust代码，可能需要几分钟时间。

## 第四步：构建生产版本

```bash
pnpm tauri build
```

构建完成后，可执行文件位于：
- Windows: `src-tauri/target/release/time-assistant.exe`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/appimage/`

## 常见问题

### 编译失败？
1. 确认Rust已正确安装: `rustc --version`
2. 确认Node.js已安装: `node --version`
3. 清理缓存重试: `cargo clean && pnpm install`

### Windows编译错误？
确保安装了 Visual Studio C++ 构建工具

### Linux编译错误？
安装系统依赖（Ubuntu/Debian）:
```bash
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### macOS编译错误？
安装Xcode命令行工具:
```bash
xcode-select --install
```

## 更多帮助

- 详细开发文档: `DEVELOPMENT.md`
- 部署说明: `DEPLOYMENT.md`
- 用户指南: `USER_GUIDE.md`
- 项目总结: `PROJECT_SUMMARY.md`

## 项目功能

✅ 系统级窗口置顶  
✅ 计划管理（添加/编辑/删除/完成）  
✅ 优先级和分类  
✅ 时间跟踪计时器  
✅ 反思记录系统  
✅ SQLite本地存储  
✅ 系统托盘集成  
✅ 浅色/深色主题  
✅ 数据导出  

## 技术栈

- Rust + Tauri（后端）
- React + TypeScript（前端）
- SQLite（数据库）
- Tailwind CSS（样式）

---

祝使用愉快！
