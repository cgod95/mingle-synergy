#!/usr/bin/env node

/**
 * Ensure Rollup binary is available for the current platform
 * This script checks if the platform-specific Rollup binary exists,
 * and installs it if missing. This is needed because package-lock.json
 * may have been generated on a different platform (e.g., macOS) and
 * doesn't include Linux binaries.
 * 
 * Uses npm pack + tar to avoid npm install modifying the dependency tree.
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

const installBinaryManually = (packageName) => {
  try {
    console.log(`Installing ${packageName} (isolated)...`);
    
    const tempDir = path.join(os.tmpdir(), 'rollup-binary-' + Date.now());
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const targetPath = path.join(nodeModulesPath, packageName.replace('/', path.sep));
    
    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Download the package tarball using npm pack
    execSync(`npm pack ${packageName}@4.52.5 --pack-destination="${tempDir}"`, {
      stdio: 'pipe',
      cwd: tempDir,
    });
    
    // Find the tarball
    const files = fs.readdirSync(tempDir);
    const tarball = files.find(f => f.endsWith('.tgz'));
    
    if (!tarball) {
      throw new Error('Tarball not found after npm pack');
    }
    
    // Create target directory
    fs.mkdirSync(targetPath, { recursive: true });
    
    // Extract the tarball to target location
    execSync(`tar -xzf "${path.join(tempDir, tarball)}" -C "${targetPath}" --strip-components=1`, {
      stdio: 'pipe',
    });
    
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    
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
  const success = installBinaryManually(binaryPackage);
  
  if (!success) {
    console.warn(`⚠ Could not install Rollup binary. Build may fail if Rollup is required.`);
    process.exit(0); // Don't fail the build, let it try to continue
  }
};

main();
