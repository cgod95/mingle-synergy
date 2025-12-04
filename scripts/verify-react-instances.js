#!/usr/bin/env node

/**
 * Build-time verification script to ensure single React instance
 * Fails build if multiple React instances detected in bundle
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = join(process.cwd(), 'dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');

function findReactInstances(content) {
  const reactPatterns = [
    /["']react["']/g,
    /["']react\/jsx-runtime["']/g,
    /["']react-dom["']/g,
    /__REACT_DEVTOOLS_GLOBAL_HOOK__/g,
  ];
  
  let reactCount = 0;
  for (const pattern of reactPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      reactCount += matches.length;
    }
  }
  
  return reactCount;
}

function checkBundle() {
  try {
    if (!statSync(DIST_DIR).isDirectory()) {
      console.error('❌ dist directory not found. Run build first.');
      process.exit(1);
    }

    if (!statSync(ASSETS_DIR).isDirectory()) {
      console.error('❌ dist/assets directory not found. Run build first.');
      process.exit(1);
    }

    const files = readdirSync(ASSETS_DIR);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    let totalReactReferences = 0;
    const reactVendorFiles = [];
    
    for (const file of jsFiles) {
      const filePath = join(ASSETS_DIR, file);
      const content = readFileSync(filePath, 'utf-8');
      const reactCount = findReactInstances(content);
      
      if (reactCount > 0) {
        totalReactReferences += reactCount;
        if (file.includes('react-vendor')) {
          reactVendorFiles.push(file);
        } else if (reactCount > 10) {
          // Non-vendor file with many React references might indicate duplicate instance
          console.warn(`⚠️  Warning: ${file} has ${reactCount} React references (might indicate duplicate instance)`);
        }
      }
    }
    
    // Check if react-vendor chunk exists (good sign - React is bundled together)
    if (reactVendorFiles.length === 0) {
      console.warn('⚠️  Warning: No react-vendor chunk found. React might be split across multiple chunks.');
    } else if (reactVendorFiles.length > 1) {
      console.error(`❌ ERROR: Multiple react-vendor chunks detected: ${reactVendorFiles.join(', ')}`);
      console.error('   This indicates multiple React instances in the bundle!');
      process.exit(1);
    } else {
      console.log(`✅ Single react-vendor chunk found: ${reactVendorFiles[0]}`);
    }
    
    console.log(`✅ Build verification passed. Total React references: ${totalReactReferences}`);
    console.log('   (High reference count is normal - indicates React is properly bundled)');
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    process.exit(1);
  }
}

checkBundle();





