# 时间助手桌面版 - 一键启动脚本
# 使用方法：双击运行或在PowerShell中执行 .\启动应用.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  时间助手桌面版 - 启动中..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 添加Rust到PATH（临时）
Write-Host "1. 配置环境..." -ForegroundColor Green
$env:Path += ";C:\Users\Administrator\.cargo\bin"

# 2. 验证环境
Write-Host "2. 验证环境..." -ForegroundColor Green
try {
    $cargoVersion = cargo --version
    Write-Host "  ✓ Cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Cargo未找到，请先运行 永久修复PATH.ps1" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

# 3. 切换到项目目录
Write-Host "3. 切换到项目目录..." -ForegroundColor Green
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# 4. 启动应用
Write-Host "4. 启动应用..." -ForegroundColor Green
Write-Host ""
Write-Host "⏳ 正在启动..." -ForegroundColor Yellow
Write-Host "   首次启动需要5-10分钟编译" -ForegroundColor Yellow
Write-Host "   后续启动只需30秒" -ForegroundColor Yellow
Write-Host ""

# 运行开发模式
npm run tauri:dev





