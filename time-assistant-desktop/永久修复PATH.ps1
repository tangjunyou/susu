# 永久添加Rust到系统PATH
# 以管理员身份运行此脚本

Write-Host "正在永久添加Rust到系统PATH..." -ForegroundColor Cyan

$cargoPath = "C:\Users\Administrator\.cargo\bin"

# 检查路径是否存在
if (Test-Path $cargoPath) {
    Write-Host "✓ 找到Rust安装路径: $cargoPath" -ForegroundColor Green
    
    # 获取当前用户的PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    # 检查是否已经包含
    if ($currentPath -notlike "*$cargoPath*") {
        # 添加到用户PATH
        $newPath = $currentPath + ";" + $cargoPath
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        
        Write-Host "✓ 已永久添加Rust到PATH!" -ForegroundColor Green
        Write-Host "请重启PowerShell使更改生效" -ForegroundColor Yellow
    } else {
        Write-Host "✓ PATH中已包含Rust路径" -ForegroundColor Green
    }
} else {
    Write-Host "✗ 未找到Rust安装路径" -ForegroundColor Red
}

Write-Host ""
Write-Host "验证:" -ForegroundColor Cyan
Write-Host "关闭并重新打开PowerShell，然后运行: cargo --version"





