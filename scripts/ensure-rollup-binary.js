#!/usr/bin/env node

/**
 * Ensure Rollup binary is available for the current platform
 * This script checks if the platform-specific Rollup binary exists,
 * and installs it if missing. This is needed because package-lock.json
 * may have been generated on a different platform (e.g., macOS) and
 * doesn't include Linux binaries.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const platform = os.platform();
const arch = os.arch();

// Map platform/arch to Rollup binary package name
const getRollupBinaryPackage = () => {
  if (platform === 'linux' && arch === 'x64') {
    return '@rollup/rollup-linux-x64-gnu';
  } else if (platform === 'linux' && arch === 'arm64') {
    return '@rollup/rollup-linux-arm64-gnu';
  } else if (platform === 'darwin' && arch === 'x64') {
    return '@rollup/rollup-darwin-x64';
  } else if (platform === 'darwin' && arch === 'arm64') {
    return '@rollup/rollup-darwin-arm64';
  } else if (platform === 'win32' && arch === 'x64') {
    return '@rollup/rollup-win32-x64-msvc';
  }
  return null;
};

const checkBinaryExists = (packageName) => {
  try {
    const binaryPath = path.join(process.cwd(), 'node_modules', packageName);
    return fs.existsSync(binaryPath);
  } catch (error) {
    return false;
  }
};

const installBinary = (packageName) => {
  try {
    console.log(`Installing ${packageName}...`);
    execSync(`npm install ${packageName}@4.52.5 --no-save --legacy-peer-deps`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log(`✓ Successfully installed ${packageName}`);
    return true;
  } catch (error) {
    console.warn(`⚠ Failed to install ${packageName}:`, error.message);
    return false;
  }
};

const main = () => {
  const binaryPackage = getRollupBinaryPackage();
  
  if (!binaryPackage) {
    console.log(`Platform ${platform}/${arch} not supported for Rollup binary check`);
    return;
  }

  console.log(`Checking for Rollup binary: ${binaryPackage}`);
  
  if (checkBinaryExists(binaryPackage)) {
    console.log(`✓ Rollup binary already exists: ${binaryPackage}`);
    return;
  }

  console.log(`Rollup binary not found, installing...`);
  const success = installBinary(binaryPackage);
  
  if (!success) {
    console.warn(`⚠ Could not install Rollup binary. Build may fail if Rollup is required.`);
    process.exit(0); // Don't fail the build, let it try to continue
  }
};

main();

