import React, { useState } from 'react';
import { runUserJourneyTest } from '../utils/testUserJourney';
import { Button } from './ui/button';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import usePerformance from '@/hooks/usePerformance';

type TestResultItem = { step: string; message: string; success: boolean };
type TestResults = { success: boolean; summary: TestResultItem[] };

const TestUserJourney: React.FC = () => {
  usePerformance('TestUserJourney');
  const [results, setResults] = useState<TestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunTest = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const testResults = await runUserJourneyTest();
      setResults(testResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">User Journey Test</h2>
        <p className="text-gray-600 mb-4">
          This will test the complete user flow from sign up to check-out.
        </p>
        <Button 
          onClick={handleRunTest} 
          disabled={isRunning}
          className="w-full mb-4"
        >
          {isRunning ? 'Running Test...' : 'Run User Journey Test'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Test Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-medium">
              Test Results: {results.success ? 
                <span className="text-green-600">Passed</span> : 
                <span className="text-red-600">Failed</span>
              }
            </h3>
          </div>
          <div className="space-y-3 mt-4">
            {results.summary.map((item) => (
              <div key={item.step} className="flex items-start">
                {item.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <div>
                  <div className="font-medium">{item.step}</div>
                  <div className="text-sm text-gray-600">{item.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestUserJourney;
