// 使用专业库将 PNG 转换为真正的 ICO 格式
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

console.log('=== 专业图标转换工具 ===\n');

const sourcePng = path.join(__dirname, 'src-tauri', 'icons', 'icon.png');
const targetIco = path.join(__dirname, 'src-tauri', 'icons', 'icon.ico');

console.log('📄 源文件:', sourcePng);
console.log('🎯 目标文件:', targetIco);
console.log('');

async function convertIcon() {
    try {
        if (!fs.existsSync(sourcePng)) {
            console.error('❌ 错误: 找不到源文件', sourcePng);
            process.exit(1);
        }
        
        console.log('⏳ 正在读取PNG文件...');
        const pngBuffer = fs.readFileSync(sourcePng);
        
        console.log('⏳ 正在转换为真正的ICO格式...');
        // 使用to-ico生成真正的ICO文件（支持RC.EXE）
        const icoBuffer = await toIco([pngBuffer]);
        
        console.log('⏳ 正在保存ICO文件...');
        fs.writeFileSync(targetIco, icoBuffer);
        
        const stats = fs.statSync(targetIco);
        console.log('');
        console.log('✅ 成功生成真正的ICO文件!');
        console.log('📁 位置:', targetIco);
        console.log('📊 文件大小:', stats.size, '字节');
        console.log('🔧 格式: 标准ICO（兼容Windows RC.EXE）');
        console.log('');
        console.log('🎉 转换完成！现在可以重新编译项目了。');
        console.log('');
        
    } catch (error) {
        console.error('');
        console.error('❌ 转换失败:', error.message);
        console.log('');
        console.log('💡 备用方案：手动转换ICO文件');
        console.log('   1. 访问: https://www.aconvert.com/icon/png-to-ico/');
        console.log('   2. 上传: src-tauri\\icons\\icon.png');
        console.log('   3. 设置: 256x256, 保持长宽比');
        console.log('   4. 下载并保存到: src-tauri\\icons\\icon.ico');
        console.log('');
        process.exit(1);
    }
}

// 运行转换
convertIcon();

