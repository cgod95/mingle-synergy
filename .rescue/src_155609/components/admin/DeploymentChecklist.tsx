
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  runAllVerifications,
  verifyFirebaseConnection,
  verifyFirestoreAccess,
  verifyStorageAccess,
  verifyAnonymousAuth,
  verifyMockStatus,
  verifyRequiredEnvVars
} from '@/utils/deploymentVerifier';

type CheckResult = {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
};

const DeploymentChecklist: React.FC = () => {
  const [checks, setChecks] = useState<CheckResult[]>([
    { name: 'Firebase Connection', status: 'pending', message: 'Checking...' },
    { name: 'Firestore Access', status: 'pending', message: 'Checking...' },
    { name: 'Storage Access', status: 'pending', message: 'Checking...' },
    { name: 'Authentication', status: 'pending', message: 'Checking...' },
    { name: 'Mock Services', status: 'pending', message: 'Checking...' },
    { name: 'Environment Variables', status: 'pending', message: 'Checking...' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runChecks = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Reset all checks to pending
    setChecks(prev => prev.map(check => ({
      ...check,
      status: 'pending',
      message: 'Checking...'
    })));

    try {
      // Firebase Connection
      setProgress(10);
      const connectionResult = await verifyFirebaseConnection();
      setChecks(prev => prev.map(check => 
        check.name === 'Firebase Connection' 
          ? { ...check, status: connectionResult.success ? 'success' : 'error', message: connectionResult.message }
          : check
      ));

      // Firestore Access
      setProgress(25);
      const firestoreResult = await verifyFirestoreAccess();
      setChecks(prev => prev.map(check => 
        check.name === 'Firestore Access' 
          ? { ...check, status: firestoreResult.success ? 'success' : 'error', message: firestoreResult.message }
          : check
      ));

      // Storage Access
      setProgress(40);
      const storageResult = await verifyStorageAccess();
      setChecks(prev => prev.map(check => 
        check.name === 'Storage Access' 
          ? { ...check, status: storageResult.success ? 'success' : 'error', message: storageResult.message }
          : check
      ));

      // Authentication
      setProgress(55);
      const authResult = await verifyAnonymousAuth();
      setChecks(prev => prev.map(check => 
        check.name === 'Authentication' 
          ? { ...check, status: authResult.success ? 'success' : 'error', message: authResult.message }
          : check
      ));

      // Mock Services
      setProgress(70);
      const mockResult = await verifyMockStatus();
      setChecks(prev => prev.map(check => 
        check.name === 'Mock Services' 
          ? { ...check, status: mockResult.success ? 'success' : 'error', message: mockResult.message }
          : check
      ));

      // Environment Variables
      setProgress(85);
      const envResult = await verifyRequiredEnvVars();
      setChecks(prev => prev.map(check => 
        check.name === 'Environment Variables' 
          ? { ...check, status: envResult.success ? 'success' : 'error', message: envResult.message }
          : check
      ));

      setProgress(100);
    } catch (error) {
      console.error('Error running deployment checks:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const totalChecks = checks.length;
  const passedChecks = checks.filter(check => check.status === 'success').length;
  const readyForDeployment = passedChecks === totalChecks;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Deployment Readiness Checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {check.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse"></div>
                )}
                {check.status === 'success' && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                    ✓
                  </div>
                )}
                {check.status === 'error' && (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                    ✗
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="font-medium">{check.name}</div>
                <div className={`text-sm ${
                  check.status === 'error' ? 'text-red-500' :
                  check.status === 'success' ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {check.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between mb-2">
            <span>Overall Status:</span>
            <span className={readyForDeployment ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>
              {readyForDeployment ? 'Ready for Deployment' : 'Not Ready for Deployment'}
            </span>
          </div>
          <Progress value={(passedChecks / totalChecks) * 100} className="h-2" />
          <div className="text-right text-sm mt-1 text-gray-500">
            {passedChecks} / {totalChecks} checks passed
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={runChecks} 
          disabled={isRunning}
          className="bg-brand-primary hover:bg-brand-primary/90"
        >
          {isRunning ? 'Running Checks...' : 'Run Checks'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeploymentChecklist;
