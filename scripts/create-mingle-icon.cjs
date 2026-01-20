const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create a 1024x1024 app icon matching the Mingle M logo
// Purple gradient background with white M - matches the app branding
async function createIcon() {
  const size = 1024;
  const cornerRadius = Math.round(size * 0.22); // iOS-style rounded corners
  
  // SVG matching the exact Mingle branding:
  // - Purple-to-indigo gradient (from-purple-600 via-indigo-600 to-purple-700)
  // - Rounded corners
  // - Bold white M
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#4f46e5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
        <!-- Subtle inner shadow for depth -->
        <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="20" result="blur"/>
          <feOffset dy="10" dx="10"/>
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff"/>
          <feFlood flood-color="#000000" flood-opacity="0.15"/>
          <feComposite in2="shadowDiff" operator="in"/>
          <feComposite in2="SourceGraphic" operator="over"/>
        </filter>
      </defs>
      
      <!-- Purple gradient background with rounded corners -->
      <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#purpleGradient)"/>
      
      <!-- White M letter - centered and bold -->
      <text 
        x="50%" 
        y="56%" 
        font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" 
        font-size="${Math.round(size * 0.55)}" 
        font-weight="700" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle"
        letter-spacing="-0.02em"
      >M</text>
    </svg>
  `;

  const outputPath = path.join(__dirname, '..', 'mingle-icon-1024.png');
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`✅ Created app icon at: ${outputPath}`);
  return outputPath;
}

createIcon().catch(console.error);
