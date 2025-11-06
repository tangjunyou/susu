# 图标文件说明

## 已生成的图标

✅ `icon.svg` - 原始SVG图标（512x512）  
✅ `32x32.png` - 32x32像素PNG图标  
✅ `128x128.png` - 128x128像素PNG图标  
✅ `128x128@2x.png` - 256x256像素PNG图标（Retina显示屏）  
✅ `icon.ico` - Windows图标文件  

## 待生成的图标

⚠️ `icon.icns` - macOS图标文件

macOS的.icns文件需要在macOS系统上生成，或使用专门的工具。

### 在macOS上生成.icns

1. 创建iconset目录：
```bash
mkdir icon.iconset
```

2. 生成不同尺寸的PNG：
```bash
sips -z 16 16     icon.svg --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.svg --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.svg --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.svg --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.svg --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.svg --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.svg --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.svg --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.svg --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.svg --out icon.iconset/icon_512x512@2x.png
```

3. 转换为.icns：
```bash
iconutil -c icns icon.iconset
```

### 使用在线工具生成

访问以下网站上传icon.svg生成.icns：
- https://cloudconvert.com/svg-to-icns
- https://anyconv.com/svg-to-icns-converter/

### 临时解决方案

如果暂时无法生成.icns文件，可以：
1. 注释掉tauri.conf.json中的icon.icns引用
2. macOS构建时会使用PNG图标作为后备
3. 正式发布前再生成完整的.icns文件

## 图标设计说明

当前图标设计：
- 蓝色圆角方形背景（#3b82f6）
- 白色时钟图案（时间管理）
- 绿色对号（任务完成）

如需自定义图标：
1. 编辑 `icon.svg` 文件
2. 使用上述命令重新生成PNG和ICO
3. 在macOS上生成.icns

## Tauri图标生成命令

如果安装了Tauri CLI，可以自动生成所有格式：
```bash
pnpm tauri icon icon.svg
```

这会自动生成所有需要的图标格式。
