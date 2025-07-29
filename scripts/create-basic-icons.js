const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const publicDir = path.join(process.cwd(), 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple SVG icon
const createSVGIcon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#3b82f6" rx="${size * 0.1}"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold">💪</text>
</svg>`;

async function generateIcons() {
  console.log('🎨 Generating basic PWA icons...');
  
  try {
    // Generate PNG icons for each size
    for (const size of sizes) {
      const svgBuffer = Buffer.from(createSVGIcon(size));
      const iconPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(iconPath);
      
      console.log(`✓ Created icon-${size}x${size}.png`);
    }
    
    // Create favicon.ico from the 32x32 version
    const svgBuffer32 = Buffer.from(createSVGIcon(32));
    const faviconPath = path.join(publicDir, 'favicon.ico');
    
    await sharp(svgBuffer32)
      .resize(32, 32)
      .png()
      .toFile(faviconPath);
    
    console.log('✓ Created favicon.ico');
    
    // Create Apple touch icon (180x180)
    const svgBuffer180 = Buffer.from(createSVGIcon(180));
    const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
    
    await sharp(svgBuffer180)
      .resize(180, 180)
      .png()
      .toFile(appleTouchPath);
    
    console.log('✓ Created apple-touch-icon.png');
    
    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('📱 Your PWA is now ready to build and test.\n');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

generateIcons(); 