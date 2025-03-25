
#!/bin/bash
# Comprehensive deployment script for Mingle

echo "🚀 Starting Mingle deployment process..."

# Step 1: Run linting and type checking
echo "Running type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed. Fix errors before proceeding."
  exit 1
fi

# Step 2: Run tests
echo "Running tests..."
npm run test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Fix errors before proceeding."
  exit 1
fi

# Step 3: Build for production
echo "Building for production..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Fix errors before proceeding."
  exit 1
fi

# Step 4: Verify build size
echo "Checking build size..."
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "Build size: $BUILD_SIZE"

# Step 5: Verify build locally
echo "Verifying build locally..."
echo "To verify locally, run: npm run preview"
echo "Press Enter to continue with deployment or Ctrl+C to abort"
read

# Step 6: Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
  echo "❌ Deployment failed."
  exit 1
fi

# Step 7: Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
  echo "❌ Firestore rules deployment failed."
  exit 1
fi

# Step 8: Deploy Storage rules
echo "Deploying Storage rules..."
firebase deploy --only storage

if [ $? -ne 0 ]; then
  echo "❌ Storage rules deployment failed."
  exit 1
fi

# Step 9: Run post-deployment verification
echo "Running post-deployment verification..."
echo "Visit the deployed app and run the following in the console:"
echo "import { runAllVerifications } from './utils/deploymentVerifier'; runAllVerifications();"

echo "✅ Deployment completed successfully!"
echo "🌎 Your app is now live!"

# Make script executable
chmod +x ./deploy.sh
