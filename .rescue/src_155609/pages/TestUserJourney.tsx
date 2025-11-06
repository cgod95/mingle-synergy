import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestUserJourney: React.FC = () => {
  const setupDemoUser = () => {
    try {
      const demoUser = {
        uid: 'mock-user-1',
        email: 'test@example.com',
        displayName: 'Demo User',
        photoURL: null,
        emailVerified: true
      };
      
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
      localStorage.setItem('onboardingComplete', 'true');
      
      alert('Demo user set up successfully! You can now access /venues');
      window.location.reload();
    } catch (error) {
      console.error('Error setting up demo user:', error);
      alert('Error setting up demo user');
    }
  };

  const clearDemoData = () => {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('onboardingSeen');
      
      alert('Demo data cleared! You will need to sign up again.');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing demo data:', error);
      alert('Error clearing demo data');
    }
  };

  const checkCurrentState = () => {
    const user = localStorage.getItem('currentUser');
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    
    alert(`Current State:
User: ${user ? 'Logged in' : 'Not logged in'}
Onboarding Complete: ${onboardingComplete}`);
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Test User Journey</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={setupDemoUser} className="w-full">
            Setup Demo User (Complete Onboarding)
          </Button>
          
          <Button onClick={clearDemoData} variant="outline" className="w-full">
            Clear Demo Data (Start Fresh)
          </Button>
          
          <Button onClick={checkCurrentState} variant="secondary" className="w-full">
            Check Current State
          </Button>
          
          <div className="text-sm text-gray-600 mt-4">
            <p><strong>Setup Demo User:</strong> Creates a user with completed onboarding, allowing access to /venues</p>
            <p><strong>Clear Demo Data:</strong> Removes all user data, forcing you to go through signup again</p>
            <p><strong>Check Current State:</strong> Shows what's currently stored in localStorage</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestUserJourney; 