# Vercel Deployment Guide

## Overview

This guide documents the Vercel deployment configuration and troubleshooting steps for the Mingle application.

## Current Configuration

### Build Process
- **Build Command**: `npm run build:production` (runs `vite build` directly)
- **Install Command**: `rm -rf node_modules node_modules/.cache .next .vercel && NODE_ENV= npm ci && npm install @rollup/rollup-linux-x64-gnu@4.52.5 --save-optional --no-save || true`
- **Type Checking**: Handled in CI/CD (GitHub Actions), not in production builds

### Why Skip Type Checking in Production?
- Type checking requires dev dependencies (`@types/react`, `@vitejs/plugin-react`, etc.)
- Vercel's build cache can interfere with dev dependency installation
- Type checking already happens in GitHub Actions CI/CD pipeline
- Vite can build successfully without TypeScript type checking
- Faster build times
- More reliable deployments

## Deployment Process

### Automatic Deployment
- Pushes to `main` branch trigger automatic deployments
- Vercel builds from the latest commit
- Build cache is used to speed up installations

### Manual Deployment
1. Push changes to `main` branch
2. Vercel automatically detects and starts build
3. Monitor build logs in Vercel dashboard
4. Verify deployment after completion

## Troubleshooting

### Issue: Dev Dependencies Not Installing

**Symptoms:**
- Build fails with errors like "Cannot find module '@vitejs/plugin-react'"
- TypeScript errors about missing type definitions
- `npm ci` skips dev dependencies

**Root Cause:**
- Vercel's build cache may restore `node_modules` without dev dependencies
- `npm ci` respects `NODE_ENV=production` and skips dev dependencies
- Build cache interference

**Solutions:**

1. **Clear Build Cache (Recommended)**
   - Go to Vercel Dashboard → Project → Settings → General
   - Scroll to "Build Cache" section
   - Click "Clear Build Cache"
   - Redeploy

2. **Verify Install Command**
   - Ensure `NODE_ENV= npm ci` is used (unset NODE_ENV)
   - Check that install command runs before build command

3. **Check npm Version**
   - Vercel uses Node.js 22.x by default
   - Ensure npm version supports `--include=dev` flag (npm 9+)

### Issue: Rollup Native Binary Missing

**Symptoms:**
- Build fails with: `Cannot find module '@rollup/rollup-linux-x64-gnu'`

**Solution:**
- Install command already includes explicit installation: `npm install @rollup/rollup-linux-x64-gnu@4.52.5 --save-optional --no-save`
- If issue persists, clear build cache

### Issue: Build Cache Problems

**Symptoms:**
- Builds fail inconsistently
- Dependencies seem to be missing despite being in package.json
- Changes to install command don't take effect

**Solutions:**

1. **Clear Build Cache**
   - Vercel Dashboard → Settings → General → Clear Build Cache

2. **Force Fresh Install**
   - Install command already includes `rm -rf node_modules`
   - This ensures fresh install each time

3. **Check package-lock.json**
   - Ensure `package-lock.json` is committed
   - Verify it's up to date with `package.json`

### Issue: TypeScript Errors in Build

**Symptoms:**
- Build fails with TypeScript type errors
- Type checking runs during build

**Solution:**
- Production builds use `build:production` script which skips type checking
- Type checking happens in CI/CD (GitHub Actions)
- If you need type checking in builds, ensure dev dependencies install correctly

## Configuration Files

### vercel.json
- **Rewrites**: SPA routing to `/index.html`
- **Headers**: Security headers configured
- **Build Env**: `NODE_ENV=production` set for build command
- **Install Command**: Clears cache, installs dependencies, installs Rollup binary

### package.json
- **build**: Full build with type checking (for local/CI)
- **build:production**: Production build without type checking (for Vercel)
- **typecheck**: Separate script for type checking

## Best Practices

1. **Type Checking**: Run in CI/CD, not production builds
2. **Build Cache**: Clear cache when dependency issues occur
3. **package-lock.json**: Always commit and keep up to date
4. **Environment Variables**: Set in Vercel dashboard, not in code
5. **Monitoring**: Check build logs for warnings and errors

## Related Documentation

- [GitHub Actions CI/CD](../.github/workflows/deploy.yml)
- [Production Deployment Script](../scripts/deploy-production.sh)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

## Support

If deployment issues persist:
1. Check Vercel build logs for detailed error messages
2. Verify environment variables are set correctly
3. Clear build cache and redeploy
4. Review this guide for common issues
5. Check GitHub Actions CI/CD for type checking results

