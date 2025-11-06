# 故障排除完整指南

## 编译失败问题

### 问题1：Rust安装失败
**症状**：`rustc: command not found`

**解决方案**：
```bash
# 手动下载安装
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 验证安装
rustc --version
cargo --version
```

### 问题2：Node.js版本过低
**症状**：`Node.js version is too old`

**解决方案**：
```bash
# 使用nvm管理版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### 问题3：系统依赖缺失
**症状**：`error while loading shared libraries`

**Ubuntu/Debian**：
```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

**CentOS/RHEL**：
```bash
sudo yum groupinstall "Development Tools"
sudo yum install webkit2gtk4.0-devel \
    openssl-devel \
    curl \
    wget \
    file \
    libappindicator-gtk3 \
    librsvg2-devel
```

**macOS**：
```bash
xcode-select --install
brew install webkit2gtk
```

## 运行问题

### 问题4：应用无法启动
**症状**：编译成功但应用不显示

**检查步骤**：
1. 检查是否有错误输出
2. 确认窗口是否被其他窗口遮挡
3. 尝试调整窗口大小
4. 检查系统托盘图标

**解决方案**：
```bash
# 重新编译
pnpm tauri clean
pnpm tauri dev

# 检查日志
pnpm tauri dev --verbose
```

### 问题5：置顶功能不工作
**症状**：应用可以启动但无法置顶

**可能原因**：
1. 操作系统权限限制
2. 窗口管理器不支持
3. 代码中的置顶逻辑有问题

**解决方案**：
1. **Windows**：以管理员身份运行
2. **macOS**：在系统偏好设置中允许应用控制窗口
3. **Linux**：确保使用的是支持置顶的桌面环境

## 性能问题

### 问题6：内存占用过高
**症状**：应用占用内存过多

**优化方案**：
1. 检查是否有内存泄漏
2. 优化数据库查询
3. 减少不必要的定时器

### 问题7：界面卡顿
**症状**：界面响应缓慢

**解决方案**：
1. 减少动画效果
2. 优化React组件渲染
3. 使用Web Workers处理复杂计算

## 跨平台问题

### 问题8：macOS编译失败
**症状**：macOS上编译错误

**解决方案**：
```bash
# 安装Xcode命令行工具
xcode-select --install

# 安装Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装必要依赖
brew install webkit2gtk
```

### 问题9：Linux编译失败
**症状**：Linux上编译错误

**解决方案**：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.0-devel \
    openssl-devel \
    curl \
    wget \
    file \
    libappindicator-gtk3 \
    librsvg2-devel

# Arch Linux
sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg
```

## 数据问题

### 问题10：数据库错误
**症状**：无法保存或读取数据

**解决方案**：
1. 检查数据库文件权限
2. 确认SQLite版本兼容性
3. 清理损坏的数据库文件

```bash
# 清理数据库
rm -f ~/.local/share/time-assistant-desktop/data.db
pnpm tauri dev
```

### 问题11：数据丢失
**症状**：重启后数据消失

**解决方案**：
1. 检查数据存储路径
2. 确认权限设置
3. 启用数据备份功能

## 调试技巧

### 启用详细日志
```bash
# 启用Rust详细日志
RUST_LOG=debug pnpm tauri dev

# 启用Tauri详细日志
pnpm tauri dev --verbose
```

### 检查系统信息
```bash
# 检查操作系统
uname -a  # Linux/macOS
systeminfo  # Windows

# 检查Rust版本
rustc --version --verbose

# 检查Node.js版本
node --version
npm --version
pnpm --version
```

### 社区支持
如果以上方案都无法解决问题，可以：
1. 查看Tauri官方文档：https://tauri.app/
2. 访问Tauri Discord社区
3. 在GitHub上提交Issue
4. 搜索Stack Overflow相关问题

## 应急方案

如果所有方案都失败，可以：
1. 使用Docker容器运行
2. 尝试在线开发环境
3. 使用预编译的二进制文件
4. 降级到Electron版本