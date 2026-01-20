// 🧠 Purpose: Add legal and safety informational pages to meet MVP requirements and support Footer navigation links.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="max-w-xl w-full">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-neutral-600 space-y-4 max-h-[400px] overflow-y-auto">
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
    </Layout>
  );
};

export default Terms; 