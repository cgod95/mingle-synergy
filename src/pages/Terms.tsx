// 🧠 Purpose: Add legal and safety informational pages to meet MVP requirements and support Footer navigation links.

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <Card className="max-w-xl w-full rounded-2xl shadow-xl">
        <CardContent className="space-y-6">
          <h1 className="text-2xl font-semibold text-center">Terms & Conditions</h1>

          <div className="text-sm text-muted-foreground space-y-4 max-h-[400px] overflow-y-auto">
            <p>
              Welcome to Mingle. By using our app, you agree to abide by the following terms and conditions.
              Please read them carefully. Continued use of the app signifies your agreement.
            </p>
            <p>
              1. Respectful conduct is required. Abusive behavior will result in suspension.
              2. Your data is protected per our Privacy Policy.
              3. Matches expire and message limits apply.
              4. Content must not violate laws or community standards.
            </p>
            <p>
              We reserve the right to update these terms. Please check periodically for changes.
            </p>
          </div>

          <Button className="w-full" onClick={() => navigate(-1)}>
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms; 