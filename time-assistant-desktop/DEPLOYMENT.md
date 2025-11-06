# 部署说明

本项目为Tauri桌面应用，需要在本地环境编译打包。

## 环境准备

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

### 3. 安装系统依赖

#### Windows
- Visual Studio C++ 构建工具
- WebView2 Runtime (通常Windows 10/11已预装)

#### macOS
```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

#### Linux (Fedora)
```bash
sudo dnf install webkit2gtk3-devel \
    openssl-devel \
    curl \
    wget \
    gtk3-devel \
    libappindicator-gtk3-devel \
    librsvg2-devel
```

## 开发运行

```bash
# 启动开发服务器
pnpm tauri dev

# 或使用npm
npm run tauri dev
```

## 构建生产版本

```bash
# 构建应用
pnpm tauri build

# 或使用npm
npm run tauri build
```

构建完成后，可执行文件位于：
- **Windows**: `src-tauri/target/release/time-assistant.exe`
- **macOS**: `src-tauri/target/release/bundle/dmg/Time Assistant_*.dmg`
- **Linux**: `src-tauri/target/release/bundle/appimage/time-assistant_*.AppImage`

## 发布打包

### Windows
生成的安装包：
- MSI安装程序: `src-tauri/target/release/bundle/msi/`
- NSIS安装程序: `src-tauri/target/release/bundle/nsis/`

### macOS
生成的安装包：
- DMG磁盘映像: `src-tauri/target/release/bundle/dmg/`
- APP应用包: `src-tauri/target/release/bundle/macos/`

### Linux
生成的安装包：
- AppImage: `src-tauri/target/release/bundle/appimage/`
- DEB包: `src-tauri/target/release/bundle/deb/`
- RPM包: `src-tauri/target/release/bundle/rpm/`

## 代码签名

### macOS
```bash
# 设置开发者证书
export APPLE_CERTIFICATE="Developer ID Application: Your Name"
export APPLE_CERTIFICATE_PASSWORD="your-password"

# 签名并公证
pnpm tauri build -- --target universal-apple-darwin
```

### Windows
需要购买代码签名证书，并配置在 `tauri.conf.json` 中：
```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

## 自动更新配置

编辑 `src-tauri/tauri.conf.json`：
```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://releases.yourdomain.com/{{target}}/{{current_version}}"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

## 持续集成

### GitHub Actions示例

创建 `.github/workflows/build.yml`：
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-latest, macos-latest, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build Tauri app
        run: pnpm tauri build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.platform }}-build
          path: src-tauri/target/release/bundle/
```

## 故障排除

### 编译错误
1. 确保Rust工具链已正确安装
2. 清理缓存: `cargo clean`
3. 更新依赖: `cargo update`

### WebView问题
- **Windows**: 确保安装了WebView2 Runtime
- **Linux**: 确保安装了webkit2gtk

### 图标缺失
参考 `src-tauri/icons/README.md` 生成图标文件

## 性能优化

编辑 `src-tauri/Cargo.toml`：
```toml
[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "z"
strip = true
```

## 更多信息

- Tauri官方文档: https://tauri.app/
- Tauri中文文档: https://tauri.app/zh-cn/
- GitHub Issues: 报告问题和获取帮助
