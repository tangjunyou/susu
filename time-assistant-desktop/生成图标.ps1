# 生成兼容的ICO图标文件
# 从PNG转换为标准ICO格式

Write-Host "=== 图标转换工具 ===" -ForegroundColor Cyan
Write-Host ""

$sourcePng = "src-tauri\icons\icon.png"
$targetIco = "src-tauri\icons\icon.ico"

if (-not (Test-Path $sourcePng)) {
    Write-Host "❌ 错误: 找不到源文件 $sourcePng" -ForegroundColor Red
    exit 1
}

Write-Host "📄 源文件: $sourcePng" -ForegroundColor Green
Write-Host "🎯 目标文件: $targetIco" -ForegroundColor Green
Write-Host ""

try {
    # 加载 .NET 图像处理库
    Add-Type -AssemblyName System.Drawing
    
    # 读取PNG图片
    Write-Host "⏳ 正在读取PNG图片..." -ForegroundColor Yellow
    $image = [System.Drawing.Image]::FromFile((Resolve-Path $sourcePng).Path)
    
    # 创建多个尺寸的图标（ICO可以包含多个尺寸）
    Write-Host "⏳ 正在转换为ICO格式..." -ForegroundColor Yellow
    
    # 创建bitmap
    $bitmap = New-Object System.Drawing.Bitmap($image)
    
    # 创建内存流
    $memoryStream = New-Object System.IO.MemoryStream
    
    # 创建ICO文件
    # ICO文件头
    $iconHeader = [byte[]](0, 0, 1, 0, 1, 0)  # 签名 + 类型(1=ICO) + 图片数量(1)
    $memoryStream.Write($iconHeader, 0, $iconHeader.Length)
    
    # 获取图片尺寸（限制在256以内）
    $width = [Math]::Min($image.Width, 256)
    $height = [Math]::Min($image.Height, 256)
    
    # 创建缩放后的图片
    $resizedBitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($resizedBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($image, 0, 0, $width, $height)
    $graphics.Dispose()
    
    # 转换为PNG格式（ICO内部可以使用PNG）
    $pngStream = New-Object System.IO.MemoryStream
    $resizedBitmap.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytes = $pngStream.ToArray()
    $pngStream.Dispose()
    
    # 写入图标目录条目（16字节）
    $iconDirEntry = [byte[]](
        $width,    # 宽度
        $height,   # 高度
        0,         # 颜色数（0表示不使用调色板）
        0,         # 保留
        1, 0,      # 颜色平面数
        32, 0,     # 每像素位数（32位ARGB）
        [BitConverter]::GetBytes($pngBytes.Length) +  # 图片数据大小（4字节）
        [BitConverter]::GetBytes(22)  # 图片数据偏移（4字节，6+16=22）
    )
    $memoryStream.Write($iconDirEntry, 0, 16)
    
    # 写入图片数据
    $memoryStream.Write($pngBytes, 0, $pngBytes.Length)
    
    # 保存到文件
    $fileStream = [System.IO.File]::Create((Resolve-Path "src-tauri\icons").Path + "\icon.ico")
    $memoryStream.WriteTo($fileStream)
    $fileStream.Close()
    $memoryStream.Close()
    
    # 清理资源
    $resizedBitmap.Dispose()
    $bitmap.Dispose()
    $image.Dispose()
    
    Write-Host ""
    Write-Host "✅ 成功生成标准ICO图标文件！" -ForegroundColor Green
    Write-Host "📁 位置: $targetIco" -ForegroundColor Cyan
    
    # 显示文件信息
    $fileInfo = Get-Item $targetIco
    Write-Host "📊 文件大小: $($fileInfo.Length) 字节" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ 转换失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 备用方案：使用在线转换工具" -ForegroundColor Yellow
    Write-Host "   1. 访问: https://www.aconvert.com/icon/png-to-ico/" -ForegroundColor White
    Write-Host "   2. 上传: src-tauri\icons\icon.png" -ForegroundColor White
    Write-Host "   3. 下载转换后的icon.ico" -ForegroundColor White
    Write-Host "   4. 保存到: src-tauri\icons\icon.ico" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "🎉 转换完成！现在可以重新编译项目了。" -ForegroundColor Green
Write-Host ""





