# 图标说明

本项目需要以下图标文件：

## 所需图标
- `32x32.png` - 32x32像素PNG图标
- `128x128.png` - 128x128像素PNG图标
- `128x128@2x.png` - 256x256像素PNG图标（Retina显示屏）
- `icon.icns` - macOS图标文件
- `icon.ico` - Windows图标文件

## 生成图标

### 方法1：使用在线工具
访问 https://www.icoconverter.com/ 或类似工具，上传一个PNG图像，生成所需的图标文件。

### 方法2：使用命令行工具

#### 安装图标生成工具
```bash
cargo install tauri-cli
pnpm tauri icon path/to/your-icon.png
```

这将自动生成所有需要的图标格式。

### 方法3：手动创建
1. 准备一个1024x1024的PNG图像
2. 使用图像编辑软件（如GIMP、Photoshop）缩放到不同尺寸
3. 对于ICO和ICNS格式，使用专门的转换工具

## 临时解决方案

如果暂时没有图标，可以：
1. 使用Tauri的默认图标
2. 创建简单的单色图标
3. 从免费图标库下载合适的图标

推荐图标库：
- Heroicons (https://heroicons.com/)
- Lucide Icons (https://lucide.dev/)
- Flaticon (https://www.flaticon.com/)
