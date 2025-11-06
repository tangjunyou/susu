# 自动编译脚本指南

## 一键自动安装和编译脚本

### Windows用户
创建 `build-windows.bat` 文件：

```batch
@echo off
echo 正在安装时间助手桌面版...

echo 1. 检查Rust安装...
rustc --version
if %errorlevel% neq 0 (
    echo 正在安装Rust...
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    call %USERPROFILE%\.cargo\env
)

echo 2. 检查Node.js安装...
node --version
if %errorlevel% neq 0 (
    echo 正在安装Node.js...
    请访问 https://nodejs.org 下载并安装
    pause
    exit /b 1
)

echo 3. 安装pnpm...
npm install -g pnpm

echo 4. 安装项目依赖...
pnpm install

echo 5. 编译并运行应用...
pnpm tauri dev

pause
```

### macOS/Linux用户
创建 `build-unix.sh` 文件：

```bash
#!/bin/bash
set -e

echo "正在安装时间助手桌面版..."

# 1. 检查并安装Rust
if ! command -v rustc &> /dev/null; then
    echo "正在安装Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
fi

# 2. 检查并安装Node.js
if ! command -v node &> /dev/null; then
    echo "正在安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. 安装pnpm
if ! command -v pnpm &> /dev/null; then
    echo "正在安装pnpm..."
    npm install -g pnpm
fi

# 4. 安装系统依赖（Ubuntu/Debian）
if command -v apt &> /dev/null; then
    echo "正在安装系统依赖..."
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
fi

# 5. 安装项目依赖
echo "正在安装项目依赖..."
pnpm install

# 6. 编译并运行
echo "正在编译并运行应用..."
pnpm tauri dev

echo "安装完成！"
```

## 使用方法

1. **Windows用户**：
   - 双击运行 `build-windows.bat`
   - 等待自动安装和编译

2. **macOS/Linux用户**：
   ```bash
   chmod +x build-unix.sh
   ./build-unix.sh
   ```

## 故障排除

### 常见问题1：权限错误
```bash
# Linux/macOS
sudo chown -R $USER:$USER ~/.cargo
sudo chown -R $USER:$USER ~/.pnpm

# Windows（以管理员身份运行）
icacls "%USERPROFILE%\.cargo" /grant %USERNAME%:F /T
```

### 常见问题2：Rust版本过低
```bash
rustup update
rustup default stable
```

### 常见问题3：Node.js版本过低
```bash
# 使用nvm管理Node.js版本
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

### 常见问题4：编译错误
```bash
# 清理缓存重新编译
pnpm tauri clean
pnpm install
pnpm tauri dev
```

## 验证安装成功

编译成功后，您应该看到：
1. Tauri开发服务器启动
2. 桌面应用窗口弹出
3. 可以添加计划并测试置顶功能

如果遇到任何问题，请查看项目中的 `TROUBLESHOOTING.md` 文件。