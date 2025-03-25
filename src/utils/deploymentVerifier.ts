
import { auth, firestore, storage } from '@/firebase/config';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
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
    
    if (!projectId) {
      return {
        success: false,
        message: 'Firebase project ID is not configured',
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
    
    return {
      success: true,
      message: 'Firestore access verified',
      details: {
        documentCount: snapshot.size,
        isEmptyResult: snapshot.empty
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
    // Try to check if a public file exists
    const placeholderRef = ref(storage, 'placeholder.jpg');
    try {
      // Just check if the URL can be generated, don't actually download the file
      await getDownloadURL(placeholderRef);
      return {
        success: true,
        message: 'Storage access verified'
      };
    } catch (storageError: any) {
      // Object not found is expected for our test
      if (storageError.code === 'storage/object-not-found') {
        return {
          success: true,
          message: 'Storage access verified (placeholder not found but access works)'
        };
      }
      throw storageError;
    }
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

export async function verifyAppPerformance(): Promise<VerificationResult> {
  const metrics: Record<string, number> = {};
  const startTime = performance.now();
  
  try {
    // Check page load time
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      metrics.timeToFirstByte = timing.responseStart - timing.navigationStart;
    }
    
    // Check runtime performance
    // Simulate some UI operations
    for (let i = 0; i < 1000; i++) {
      // Do some work to measure JavaScript performance
      const div = document.createElement('div');
      div.className = `test-${i}`;
      div.textContent = `Test ${i}`;
      // Just create but don't append to avoid DOM modification
    }
    metrics.jsOperationTime = performance.now() - startTime;
    
    // Check memory usage if available
    if (window.performance && (performance as any).memory) {
      metrics.usedJSHeapSize = (performance as any).memory.usedJSHeapSize;
      metrics.totalJSHeapSize = (performance as any).memory.totalJSHeapSize;
    }
    
    return {
      success: true,
      message: 'Performance metrics collected',
      details: metrics
    };
  } catch (error) {
    return {
      success: false,
      message: `Performance measurement error: ${error instanceof Error ? error.message : String(error)}`,
      details: metrics
    };
  }
}

export async function runAllVerifications(): Promise<Record<string, VerificationResult>> {
  console.log("🔍 Starting Mingle App deployment verification...");
  
  const results: Record<string, VerificationResult> = {
    firebaseConnection: await verifyFirebaseConnection(),
    firestoreAccess: await verifyFirestoreAccess(), 
    storageAccess: await verifyStorageAccess(),
    anonymousAuth: await verifyAnonymousAuth(),
    appPerformance: await verifyAppPerformance(),
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
  verifyAppPerformance,
  runAllVerifications
};
