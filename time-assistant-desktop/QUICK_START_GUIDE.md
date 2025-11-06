# 快速开始指南（5分钟版）

## 🚀 极简启动方案

### 方案1：一键自动安装（推荐）

**Windows用户：**
1. 下载并双击运行 `build-windows.bat`
2. 等待自动安装（大约5-10分钟）
3. 应用自动启动

**macOS/Linux用户：**
```bash
chmod +x build-unix.sh
./build-unix.sh
```

### 方案2：手动快速安装

如果自动脚本失败，按以下步骤：

```bash
# 1. 安装Rust（如果未安装）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. 安装Node.js和pnpm
npm install -g pnpm

# 3. 进入项目目录
cd time-assistant-desktop

# 4. 安装依赖并运行
pnpm install
pnpm tauri dev
```

## ✅ 验证成功

看到以下输出表示成功：
```
App running at http://localhost:1420
Press Ctrl+C to stop the dev server
```

## 🎯 首次使用

1. **添加计划**：点击"添加计划"按钮
2. **测试置顶**：切换到其他应用，确认时间助手仍在最前
3. **开始计时**：点击计划旁的播放按钮
4. **添加反思**：完成任务后点击"反思"按钮

## 🔧 常用快捷键

- `Ctrl+Shift+T`：快速打开/隐藏应用
- `F11`：全屏切换
- `Ctrl+Q`：退出应用

## 📱 主要功能

- ✅ 计划管理（添加、编辑、删除）
- ✅ 优先级设置（高/中/低）
- ✅ 时间跟踪（开始/停止计时）
- ✅ 反思记录
- ✅ 跨软件置顶
- ✅ 系统托盘
- ✅ 开机自启

## 🆘 遇到问题？

1. **编译失败**：查看 `TROUBLESHOOTING.md`
2. **置顶不工作**：以管理员身份运行（Windows）
3. **数据丢失**：检查 `~/.local/share/time-assistant-desktop/`
4. **界面异常**：重启应用

## 💡 优化建议

- 首次运行后，建议设置开机自启
- 定期导出数据备份
- 根据需要调整置顶位置
- 使用分类功能组织计划

---

**预计总时间：5-15分钟（取决于网络速度）**

如果一切顺利，您现在应该有一个完全可用的跨软件置顶时间助手了！