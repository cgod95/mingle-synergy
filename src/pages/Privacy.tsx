// 🧠 Purpose: Add legal and safety informational pages to meet MVP requirements and support Footer navigation links.

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Privacy Policy</h1>
        </div>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="space-y-6 p-6 text-gray-700 text-sm">
            <div>
              <h2 className="font-semibold text-lg text-gray-800 mb-2">Your Data</h2>
              <p>
                We collect only the information needed to make the app functional and enjoyable. This includes your profile, matches, location (with permission), and photos. We do not sell your data.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-lg text-gray-800 mb-2">Third-Party Services</h2>
              <p>
                We use Firebase and Google Analytics for app functionality and diagnostics. These services may collect anonymized usage data.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-lg text-gray-800 mb-2">Data Removal</h2>
              <p>
                You can delete your data at any time by contacting support or using the app's data deletion settings (coming soon).
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-lg text-gray-800 mb-2">Policy Updates</h2>
              <p>
                We may update this policy for clarity or to reflect app changes. Continued use implies acceptance.
              </p>
            </div>

            <div className="text-center pt-4">
              <Button variant="default" onClick={() => navigate(-1)}>Got it</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 