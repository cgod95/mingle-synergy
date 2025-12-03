#!/usr/bin/env node
/**
 * Build verification script
 * Checks for multiple React instances and verifies build output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');

console.log('🔍 Verifying build output...\n');

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Find React vendor chunk
const reactVendorFiles = fs.readdirSync(assetsDir)
  .filter(file => file.startsWith('react-vendor-') && file.endsWith('.js'));

if (reactVendorFiles.length === 0) {
  console.error('❌ No react-vendor chunk found!');
  process.exit(1);
}

if (reactVendorFiles.length > 1) {
  console.warn('⚠️  Multiple react-vendor chunks found:', reactVendorFiles);
  console.warn('   This may indicate React is being split incorrectly.');
}

const reactVendorFile = reactVendorFiles[0];
const reactVendorPath = path.join(assetsDir, reactVendorFile);
const reactVendorContent = fs.readFileSync(reactVendorPath, 'utf8');

console.log(`✅ Found React vendor chunk: ${reactVendorFile}`);

// Check file size (should be ~300KB)
const stats = fs.statSync(reactVendorPath);
const sizeKB = (stats.size / 1024).toFixed(2);
console.log(`   Size: ${sizeKB} KB`);

if (stats.size < 200000) {
  console.warn('⚠️  React vendor chunk seems too small. React packages might be missing.');
}

if (stats.size > 500000) {
  console.warn('⚠️  React vendor chunk seems too large. Check for duplicate dependencies.');
}

// Check for React in content
const hasReact = reactVendorContent.includes('react.production.min.js') || 
                reactVendorContent.includes('react.production');
const hasReactDOM = reactVendorContent.includes('react-dom.production.min.js') ||
                   reactVendorContent.includes('react-dom.production');
const hasJSXRuntime = reactVendorContent.includes('react-jsx-runtime');

console.log(`   Contains React: ${hasReact ? '✅' : '❌'}`);
console.log(`   Contains ReactDOM: ${hasReactDOM ? '✅' : '❌'}`);
console.log(`   Contains JSX Runtime: ${hasJSXRuntime ? '✅' : '❌'}`);

if (!hasReact || !hasReactDOM) {
  console.error('❌ React vendor chunk is missing critical React packages!');
  process.exit(1);
}

// Check for multiple React instances (look for multiple "react.production" references)
const reactMatches = reactVendorContent.match(/react\.production/g);
if (reactMatches && reactMatches.length > 3) {
  console.warn(`⚠️  Found ${reactMatches.length} "react.production" references. This might indicate duplicates.`);
}

// Check for scheduler
const hasScheduler = reactVendorContent.includes('scheduler') || 
                     reactVendorContent.includes('unstable_scheduleCallback');
console.log(`   Contains Scheduler: ${hasScheduler ? '✅' : '⚠️'}`);

// Check for framer-motion
const hasFramerMotion = reactVendorContent.includes('framer-motion') ||
                        reactVendorContent.includes('motion');
console.log(`   Contains Framer Motion: ${hasFramerMotion ? '✅' : '⚠️'}`);

// Check index.html references correct chunk
const indexHtmlPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const chunkName = reactVendorFile.replace('.js', '');
  if (indexHtml.includes(chunkName)) {
    console.log(`✅ index.html references correct chunk: ${chunkName}`);
  } else {
    console.warn(`⚠️  index.html might not reference ${chunkName}`);
  }
}

console.log('\n✅ Build verification complete!');
const hashMatch = reactVendorFile.match(/react-vendor-([^.]+)/);
console.log(`\n📦 Build hash: ${hashMatch ? hashMatch[1] : 'unknown'}`);
