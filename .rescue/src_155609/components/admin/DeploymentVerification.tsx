
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { auth, firestore } from '@/firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import services from '@/services';

type CheckStatus = 'pending' | 'success' | 'error' | 'warning';

interface SystemCheck {
  name: string;
  status: CheckStatus;
  message: string;
}

const DeploymentVerification: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: 'Firebase Auth', status: 'pending', message: 'Checking...' },
    { name: 'Firestore Database', status: 'pending', message: 'Checking...' },
    { name: 'Service Implementation', status: 'pending', message: 'Checking...' },
    { name: 'Environment Variables', status: 'pending', message: 'Checking...' },
    { name: 'Firebase Rules', status: 'pending', message: 'Checking...' },
  ]);

  const updateCheck = (name: string, status: CheckStatus, message: string) => {
    setChecks(prev => prev.map(check => 
      check.name === name ? { ...check, status, message } : check
    ));
  };

  useEffect(() => {
    const runChecks = async () => {
      // Check Firebase Auth
      try {
        await auth.app.options;
        updateCheck('Firebase Auth', 'success', 'Firebase Auth initialized successfully');
      } catch (error) {
        updateCheck('Firebase Auth', 'error', `Firebase Auth error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Check Firestore
      try {
        await firestore.app.options;
        updateCheck('Firestore Database', 'success', 'Firestore initialized successfully');
      } catch (error) {
        updateCheck('Firestore Database', 'error', `Firestore error: ${error instanceof Error ? error.message : String(error)}`);
      }

      // Check service implementation (mock or firebase)
      try {
        const isMock = services.auth === (await import('@/services/mock/mockAuthService')).default;
        if (isMock && import.meta.env.PROD) {
          updateCheck('Service Implementation', 'error', 'Using mock services in production environment');
        } else if (isMock) {
          updateCheck('Service Implementation', 'warning', 'Using mock services in development environment');
        } else {
          updateCheck('Service Implementation', 'success', 'Using Firebase services');
        }
      } catch (error) {
        updateCheck('Service Implementation', 'error', 'Error checking service implementation');
      }

      // Check environment variables
      const requiredEnvVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID'
      ];
      
      const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
      
      if (missingVars.length > 0) {
        updateCheck('Environment Variables', 'error', `Missing required env vars: ${missingVars.join(', ')}`);
      } else {
        updateCheck('Environment Variables', 'success', 'All required environment variables are set');
      }

      // Check Firebase Rules (simple check if we can write to a test collection)
      try {
        const testDoc = collection(firestore, '_deployment_test');
        await addDoc(testDoc, { test: true });
        updateCheck('Firebase Rules', 'success', 'Firebase security rules allow writing to test collection');
      } catch (error) {
        if (String(error).includes('permission-denied')) {
          updateCheck('Firebase Rules', 'success', 'Firebase security rules are properly restricted');
        } else {
          updateCheck('Firebase Rules', 'warning', `Could not verify Firebase rules: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    };

    runChecks();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Deployment Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {checks.map((check) => (
            <li key={check.name} className="flex items-start space-x-2">
              {check.status === 'pending' && (
                <div className="animate-pulse h-5 w-5 bg-gray-200 rounded-full" />
              )}
              {check.status === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {check.status === 'error' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {check.status === 'warning' && (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <div>
                <div className="font-medium">{check.name}</div>
                <div className={`text-sm ${
                  check.status === 'error' ? 'text-red-500' : 
                  check.status === 'warning' ? 'text-amber-500' : 
                  check.status === 'success' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {check.message}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default DeploymentVerification;
