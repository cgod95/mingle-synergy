
import { auth, firestore, storage } from '@/firebase/config';
import { collection, getDocs, limit, query, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadString, deleteObject } from 'firebase/storage';
import { signInAnonymously } from 'firebase/auth';

interface VerificationResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

export async function verifyFirebaseConnection(): Promise<VerificationResult> {
  try {
    // Verify Firebase project ID is correctly configured
    const projectId = auth.app.options.projectId;
    
    if (!projectId || projectId === 'mingle-dev' || projectId === 'your-project-id') {
      return {
        success: false,
        message: 'Firebase project ID is not properly configured',
      };
    }
    
    return {
      success: true,
      message: 'Firebase connection verified',
      details: { projectId }
    };
  } catch (error) {
    return {
      success: false,
      message: `Firebase connection error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function verifyFirestoreAccess(): Promise<VerificationResult> {
  try {
    // Try to read from a public collection
    const venuesRef = collection(firestore, 'venues');
    const venuesQuery = query(venuesRef, limit(1));
    const snapshot = await getDocs(venuesQuery);
    
    // Try to write to a test collection
    const testCollectionRef = collection(firestore, '_deployment_test');
    const testDoc = await addDoc(testCollectionRef, {
      testId: `test-${Date.now()}`,
      timestamp: new Date().toISOString()
    });
    
    // Clean up
    await deleteDoc(testDoc);
    
    return {
      success: true,
      message: 'Firestore read and write access verified',
      details: {
        documentCount: snapshot.size,
        isEmptyResult: snapshot.empty,
        writeTest: 'passed'
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Firestore access error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function verifyStorageAccess(): Promise<VerificationResult> {
  try {
    // Create a random test file name
    const testFileName = `_test_${Date.now()}.txt`;
    const testContent = 'This is a test file for storage access verification';
    
    // Try to upload a test file
    const testFileRef = ref(storage, testFileName);
    await uploadString(testFileRef, testContent);
    
    // Try to get the download URL
    const downloadUrl = await getDownloadURL(testFileRef);
    
    // Clean up
    await deleteObject(testFileRef);
    
    return {
      success: true,
      message: 'Storage read and write access verified',
      details: {
        fileUploaded: true,
        downloadUrlGenerated: !!downloadUrl
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Storage access error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function verifyAnonymousAuth(): Promise<VerificationResult> {
  try {
    // Sign in anonymously to test auth
    const result = await signInAnonymously(auth);
    const user = result.user;
    
    if (user) {
      // Sign out immediately after verification
      await auth.signOut();
      
      return {
        success: true,
        message: 'Anonymous authentication verified',
        details: { uid: user.uid }
      };
    } else {
      return {
        success: false,
        message: 'Anonymous authentication failed - no user returned',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Authentication error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export async function verifyMockStatus(): Promise<VerificationResult> {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  const isProduction = import.meta.env.MODE === 'production';
  
  // In production, mock should be disabled
  if (isProduction && useMock) {
    return {
      success: false,
      message: 'Mock services are enabled in production. Set VITE_USE_MOCK=false for production.',
    };
  }
  
  return {
    success: true,
    message: isProduction 
      ? 'Mock services are correctly disabled in production'
      : 'Using mock services in development environment',
    details: { useMock, environment: import.meta.env.MODE }
  };
}

export async function verifyRequiredEnvVars(): Promise<VerificationResult> {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName] || 
               import.meta.env[varName] === 'your-api-key' ||
               import.meta.env[varName] === 'undefined'
  );
  
  const placeholderVars = requiredVars.filter(
    varName => import.meta.env[varName] && 
               (import.meta.env[varName].includes('your-') || 
                import.meta.env[varName].includes('example'))
  );
  
  if (missingVars.length > 0) {
    return {
      success: false,
      message: `Missing required environment variables: ${missingVars.join(', ')}`,
      details: { missingVars }
    };
  }
  
  if (placeholderVars.length > 0) {
    return {
      success: false,
      message: `Found placeholder values in: ${placeholderVars.join(', ')}`,
      details: { placeholderVars }
    };
  }
  
  return {
    success: true,
    message: 'All required environment variables are properly set',
    details: { checkedVars: requiredVars }
  };
}

export async function runAllVerifications(): Promise<Record<string, VerificationResult>> {
  console.log("🔍 Starting Mingle App deployment verification...");
  
  const results: Record<string, VerificationResult> = {
    firebaseConnection: await verifyFirebaseConnection(),
    firestoreAccess: await verifyFirestoreAccess(), 
    storageAccess: await verifyStorageAccess(),
    anonymousAuth: await verifyAnonymousAuth(),
    mockStatus: await verifyMockStatus(),
    envVariables: await verifyRequiredEnvVars()
  };
  
  // Print summary
  console.log("====== VERIFICATION RESULTS ======");
  let allSuccess = true;
  
  Object.entries(results).forEach(([key, result]) => {
    console.log(`${result.success ? '✅' : '❌'} ${key}: ${result.message}`);
    if (!result.success) {
      allSuccess = false;
      console.error(`  Details:`, result.details || 'No details available');
    }
  });
  
  console.log("==================================");
  console.log(`🏁 Verification ${allSuccess ? 'PASSED' : 'FAILED'}`);
  
  return results;
}

export default {
  verifyFirebaseConnection,
  verifyFirestoreAccess,
  verifyStorageAccess,
  verifyAnonymousAuth,
  verifyMockStatus,
  verifyRequiredEnvVars,
  runAllVerifications
};
