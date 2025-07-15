/**
 * ファビコン生成スクリプト
 * 既存のPWAアイコンからfavicon.icoを生成
 */

const fs = require('fs');
const path = require('path');

// 既存のアイコンファイルをfavicon.icoとしてコピー
function generateFavicon() {
  const sourceIcon = path.join(__dirname, '../public/icons/icon-32x32.png');
  const targetFavicon = path.join(__dirname, '../public/favicon.ico');
  
  try {
    // 32x32のPNGアイコンをfavicon.icoとしてコピー
    fs.copyFileSync(sourceIcon, targetFavicon);
    console.log('✅ favicon.ico generated successfully');
    console.log('Source:', sourceIcon);
    console.log('Target:', targetFavicon);
  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
  }
}

// 追加で16x16アイコンも確認
function checkIcons() {
  const iconsDir = path.join(__dirname, '../public/icons');
  const icons = fs.readdirSync(iconsDir).filter(file => file.endsWith('.png'));
  
  console.log('\n📁 Available icon files:');
  icons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    const stats = fs.statSync(iconPath);
    console.log(`  ${icon} (${stats.size} bytes)`);
  });
}

console.log('🔧 Favicon generation for WBGT Checker');
console.log('');

checkIcons();
console.log('');
generateFavicon();