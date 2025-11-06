# 时间助手桌面版 - 一键环境安装脚本
# 适用于 Windows 10/11

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  时间助手桌面版 - 环境自动配置脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员权限运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  警告: 建议以管理员权限运行此脚本" -ForegroundColor Yellow
    Write-Host "右键点击 PowerShell，选择'以管理员身份运行'" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "是否继续？(y/n)"
    if ($continue -ne 'y') {
        exit
    }
}

# 步骤1: 检查 Node.js
Write-Host "📦 步骤 1/4: 检查 Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js 未安装" -ForegroundColor Red
    Write-Host "  请先安装 Node.js: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# 步骤2: 检查 Rust
Write-Host ""
Write-Host "📦 步骤 2/4: 检查 Rust..." -ForegroundColor Green
try {
    $rustVersion = rustc --version
    Write-Host "  ✅ Rust 已安装: $rustVersion" -ForegroundColor Green
    $needRust = $false
} catch {
    Write-Host "  ❌ Rust 未安装" -ForegroundColor Red
    $needRust = $true
}

# 安装 Rust
if ($needRust) {
    Write-Host ""
    Write-Host "🔧 正在安装 Rust..." -ForegroundColor Yellow
    Write-Host "  这可能需要 10-15 分钟..." -ForegroundColor Yellow
    
    # 方法1: 尝试使用 winget
    try {
        Write-Host "  尝试使用 winget 安装..." -ForegroundColor Cyan
        winget install Rustlang.Rust.MSVC --silent
        Write-Host "  ✅ Rust 安装成功!" -ForegroundColor Green
        
        # 更新环境变量
        Write-Host "  正在更新环境变量..." -ForegroundColor Cyan
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
    } catch {
        Write-Host "  ⚠️  winget 安装失败，请手动安装:" -ForegroundColor Yellow
        Write-Host "  1. 访问: https://rustup.rs/" -ForegroundColor Yellow
        Write-Host "  2. 下载并运行 rustup-init.exe" -ForegroundColor Yellow
        Write-Host "  3. 按照提示完成安装" -ForegroundColor Yellow
        Write-Host "  4. 重启终端后重新运行此脚本" -ForegroundColor Yellow
        exit 1
    }
}

# 步骤3: 检查 Visual Studio Build Tools
Write-Host ""
Write-Host "📦 步骤 3/4: 检查 Visual Studio Build Tools..." -ForegroundColor Green

# 检查是否安装了 VS Build Tools 或 Visual Studio
$vsInstalled = Test-Path "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools" -or `
               Test-Path "C:\Program Files\Microsoft Visual Studio\2022\Community" -or `
               Test-Path "C:\Program Files\Microsoft Visual Studio\2022\Professional"

if ($vsInstalled) {
    Write-Host "  ✅ Visual Studio Build Tools 已安装" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  无法确认 Visual Studio Build Tools 是否已安装" -ForegroundColor Yellow
    Write-Host "  如果编译时出现链接器错误，请安装:" -ForegroundColor Yellow
    Write-Host "  https://visualstudio.microsoft.com/downloads/" -ForegroundColor Yellow
}

# 步骤4: 安装项目依赖
Write-Host ""
Write-Host "📦 步骤 4/4: 安装项目依赖..." -ForegroundColor Green

if (Test-Path "node_modules") {
    Write-Host "  ✅ 依赖已安装" -ForegroundColor Green
} else {
    Write-Host "  正在安装 npm 依赖..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ 依赖安装成功!" -ForegroundColor Green
    } else {
        Write-Host "  ❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}

# 验证环境
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  环境验证" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Node.js:  " -NoNewline
node --version

Write-Host "npm:      " -NoNewline
npm --version

try {
    Write-Host "Rust:     " -NoNewline
    rustc --version
    
    Write-Host "Cargo:    " -NoNewline
    cargo --version
    
    $allInstalled = $true
} catch {
    Write-Host "Rust: 未安装 ❌" -ForegroundColor Red
    $allInstalled = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allInstalled) {
    Write-Host ""
    Write-Host "🎉 环境配置完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步:" -ForegroundColor Cyan
    Write-Host "  1. 如果这是首次安装 Rust，请重启终端" -ForegroundColor Yellow
    Write-Host "  2. 运行: npm run tauri:dev" -ForegroundColor Green
    Write-Host "  3. 首次编译需要 5-10 分钟" -ForegroundColor Yellow
    Write-Host ""
    
    $runNow = Read-Host "是否立即运行应用？(y/n)"
    if ($runNow -eq 'y') {
        Write-Host ""
        Write-Host "🚀 启动应用..." -ForegroundColor Cyan
        Write-Host "  首次编译可能需要较长时间，请耐心等待..." -ForegroundColor Yellow
        Write-Host ""
        npm run tauri:dev
    }
} else {
    Write-Host ""
    Write-Host "⚠️  环境配置未完成" -ForegroundColor Yellow
    Write-Host "请按照提示完成 Rust 安装后重新运行此脚本" -ForegroundColor Yellow
    Write-Host ""
}

