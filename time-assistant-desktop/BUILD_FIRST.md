# 编译前必读

## ⚠️ 重要说明

本项目代码已完成编写，但**尚未在Rust环境中编译和测试**。在正式使用前，您需要：

### 1. 环境准备（必需）

#### 安装Rust
```bash
# Windows: 访问 https://rustup.rs/
# macOS/Linux:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

#### 安装Node.js (>= 18.0.0)
访问 https://nodejs.org/ 下载LTS版本

#### 安装系统依赖

**Windows:**
- Visual Studio C++ 构建工具
- WebView2 Runtime（Windows 10/11通常已预装）

**macOS:**
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget \
  libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### 2. 图标文件补充（macOS构建需要）

当前缺少 `icon.icns` 文件（macOS专用）。有两个选择：

**选项A：暂时跳过（仅测试）**
- 当前配置已移除.icns引用
- macOS构建会使用PNG作为后备
- 功能不受影响，仅影响最终图标显示

**选项B：生成完整图标（推荐）**

在macOS系统上：
```bash
cd src-tauri/icons
mkdir icon.iconset

# 生成各尺寸图标（需要ImageMagick或sips）
convert icon.svg -resize 16x16 icon.iconset/icon_16x16.png
convert icon.svg -resize 32x32 icon.iconset/icon_16x16@2x.png
# ...其他尺寸（见ICON_STATUS.md）

# 转换为.icns
iconutil -c icns icon.iconset
```

或使用Tauri CLI自动生成：
```bash
cd src-tauri/icons
pnpm tauri icon icon.svg
```

### 3. 首次编译

```bash
cd time-assistant-desktop
pnpm install
pnpm tauri dev
```

**预期：**
- 首次编译需要5-15分钟（下载和编译Rust依赖）
- 可能会有警告，但不应该有错误
- 如果遇到编译错误，请检查：
  - Rust版本 >= 1.70.0
  - 系统依赖已正确安装
  - 网络连接正常（需要下载crates）

### 4. 测试清单

编译成功后，请测试以下功能：

**核心功能：**
- [ ] 应用启动和窗口显示
- [ ] 系统级窗口置顶开关
- [ ] 添加、编辑、删除计划
- [ ] 时间跟踪计时器
- [ ] 添加反思记录
- [ ] 数据持久化（重启后数据保留）

**系统集成：**
- [ ] 系统托盘图标显示
- [ ] 托盘菜单功能
- [ ] 最小化到托盘
- [ ] 开机自启设置
- [ ] 主题切换
- [ ] 数据导出

**新增功能（本次补充）：**
- [ ] 开机自启开关
- [ ] 全局快捷键 Ctrl+Shift+T（显示/隐藏）
- [ ] 系统通知（计划完成时）

### 5. 已知限制

由于沙盒环境限制，以下内容需要验证：

1. **Rust代码语法正确性** - 未经rustc验证
2. **类型匹配** - TypeScript到Rust的类型转换
3. **数据库初始化** - SQLite文件创建和表结构
4. **系统API调用** - 置顶、托盘、自启动等原生功能
5. **全局快捷键** - 不同系统的兼容性

### 6. 调试建议

如遇到问题：

**Rust编译错误：**
```bash
cargo clean
cargo build
```

**前端错误：**
- 检查浏览器控制台（开发模式F12）
- 查看Tauri控制台输出

**数据库错误：**
- 检查数据库文件位置
- 查看Rust日志输出

### 7. 生产构建

测试通过后，构建发布版本：

```bash
pnpm tauri build
```

输出位置：
- Windows: `src-tauri/target/release/bundle/msi/`
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/appimage/`

### 8. 代码签名（可选）

**macOS:**
```bash
export APPLE_CERTIFICATE="Developer ID Application: Your Name"
pnpm tauri build
```

**Windows:**
需要在 `tauri.conf.json` 中配置证书指纹

---

## 项目状态总结

✅ **已完成：**
- 完整源代码（Rust + TypeScript）
- 数据库设计
- UI组件
- 配置文件
- 详细文档
- 基础图标（PNG, ICO）

⚠️ **待验证：**
- 代码编译通过
- 功能实际运行
- 系统兼容性
- 性能表现

❌ **未完成：**
- macOS .icns图标（可选）
- 编译测试
- 代码签名（发布时需要）

---

**建议：** 将本项目视为"90%完成的源代码项目"，需要在本地Rust环境中完成最后的编译、测试和打包步骤。

**预计时间：** 
- 环境准备：30-60分钟
- 首次编译：10-20分钟
- 功能测试：30-60分钟
- 修复问题：视具体情况而定

如有问题，请参考：
- `DEVELOPMENT.md` - 开发文档
- `DEPLOYMENT.md` - 部署指南
- `USER_GUIDE.md` - 使用手册
