# 时间管理助手

一个功能强大的时间管理应用，提供桌面版和Web版，帮助用户更好地管理时间和任务。

## 项目结构

```
时间管理助手/
├── docs/                          # 项目文档
├── time-assistant/               # Web应用
│   ├── src/                      # 源代码
│   ├── public/                   # 静态资源
│   └── package.json              # 依赖配置
└── time-assistant-desktop/       # 桌面应用
    ├── src/                      # 前端源代码
    ├── src-tauri/                # Tauri后端代码
    └── package.json              # 依赖配置
```

## 功能特性

### Web应用 (time-assistant)
- 现代化的用户界面
- 响应式设计
- 时间追踪功能
- 任务管理

### 桌面应用 (time-assistant-desktop)
- 基于Tauri的跨平台桌面应用
- 系统托盘集成
- 本地数据存储
- 紧凑模式支持
- 超紧凑模式

## 技术栈

- **前端**: React, TypeScript, Tailwind CSS
- **桌面框架**: Tauri
- **构建工具**: Vite
- **包管理**: npm/pnpm

## 快速开始

### Web应用
```bash
cd time-assistant
npm install
npm run dev
```

### 桌面应用
```bash
cd time-assistant-desktop
npm install
npm run tauri dev
```

## 构建和部署

详细的构建和部署说明请参考各子项目的文档。

## 许可证

MIT License