#!/usr/bin/env node
/**
 * iOS App Icon Generator
 * 
 * This script generates all required iOS app icon sizes from a 1024x1024 source image.
 * 
 * Usage: node scripts/generate-ios-icons.cjs [source-image]
 * Default source: public/logo512.png (will be upscaled)
 * 
 * For best results, provide a 1024x1024 PNG image.
 * 
 * Required: Install sharp if not present
 *   npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('\n📦 Installing sharp for image processing...\n');
  const { execSync } = require('child_process');
  execSync('npm install sharp --save-dev', { stdio: 'inherit' });
  sharp = require('sharp');
}

const SOURCE_IMAGE = process.argv[2] || path.join(__dirname, '../public/logo512.png');
const OUTPUT_DIR = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');

// iOS requires a single 1024x1024 icon for the app icon asset catalog
const ICON_SIZE = 1024;

async function generateIcons() {
  console.log('🎨 Generating iOS App Icons...\n');
  
  // Check source exists
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ Source image not found: ${SOURCE_IMAGE}`);
    console.log('\nPlease provide a 1024x1024 PNG image as the app icon.');
    console.log('Usage: node scripts/generate-ios-icons.cjs path/to/icon.png');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    const image = sharp(SOURCE_IMAGE);
    const metadata = await image.metadata();
    
    console.log(`📷 Source image: ${SOURCE_IMAGE}`);
    console.log(`   Size: ${metadata.width}x${metadata.height}`);
    
    if (metadata.width !== 1024 || metadata.height !== 1024) {
      console.log(`\n⚠️  Resizing to 1024x1024 (original: ${metadata.width}x${metadata.height})`);
      console.log('   For best quality, provide a 1024x1024 source image.\n');
    }

    // Generate the 1024x1024 icon
    const outputPath = path.join(OUTPUT_DIR, 'AppIcon-512@2x.png');
    await sharp(SOURCE_IMAGE)
      .resize(ICON_SIZE, ICON_SIZE, {
        fit: 'cover',
        background: { r: 15, g: 10, b: 26, alpha: 1 } // #0f0a1a - dark theme background
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated: AppIcon-512@2x.png (1024x1024)`);

    // Update Contents.json
    const contentsJson = {
      images: [
        {
          filename: 'AppIcon-512@2x.png',
          idiom: 'universal',
          platform: 'ios',
          size: '1024x1024'
        }
      ],
      info: {
        author: 'xcode',
        version: 1
      }
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'Contents.json'),
      JSON.stringify(contentsJson, null, 2)
    );
    
    console.log(`✅ Updated: Contents.json\n`);
    console.log('🎉 iOS app icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run build');
    console.log('2. Run: npx cap sync ios');
    console.log('3. Run: npx cap open ios');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
