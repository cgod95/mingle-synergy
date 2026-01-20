const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a 1024x1024 app icon: White M on purple gradient
async function createIcon() {
  const size = 1024;
  const cornerRadius = Math.round(size * 0.22); // iOS-style rounded corners
  
  // SVG with purple gradient background and white M
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Purple gradient background with rounded corners -->
      <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#purpleGradient)"/>
      
      <!-- White M letter -->
      <text 
        x="50%" 
        y="58%" 
        font-family="Arial, sans-serif" 
        font-size="${Math.round(size * 0.65)}" 
        font-weight="bold" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >M</text>
    </svg>
  `;

  const outputPath = path.join(__dirname, '..', 'mingle-icon-1024.png');
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Created icon at: ${outputPath}`);
  return outputPath;
}

createIcon().catch(console.error);
