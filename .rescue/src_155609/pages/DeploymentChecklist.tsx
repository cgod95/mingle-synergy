
import React from 'react';
import { Helmet } from 'react-helmet';
import DeploymentChecklist from '@/components/admin/DeploymentChecklist';

const DeploymentChecklistPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 page-container">
      <Helmet>
        <title>Deployment Checklist - Mingle</title>
      </Helmet>
      
      <h1 className="text-2xl font-bold mb-6">Deployment Readiness</h1>
      
      <p className="text-gray-600 mb-6">
        Verify that your application is ready for production deployment by running the checks below.
        All checks should pass before deploying to production.
      </p>
      
      <DeploymentChecklist />
      
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-medium text-blue-700">Deployment Tips</h3>
        <ul className="list-disc ml-5 mt-2 text-blue-700 text-sm">
          <li>Make sure <code>VITE_USE_MOCK=false</code> in production</li>
          <li>Use proper Firebase security rules for Firestore and Storage</li>
          <li>Enable Analytics in production for monitoring</li>
          <li>Test your app on various devices before final deployment</li>
          <li>Check the network tab for any failed API calls</li>
        </ul>
      </div>
    </div>
  );
};

export default DeploymentChecklistPage;
