// 🧠 Purpose: Add legal and safety informational pages to meet MVP requirements and support Footer navigation links.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/PublicLayout';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="w-7 h-7 text-green-500 mr-2" />
          <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              We collect only the information needed to make the app functional and enjoyable. This includes your profile, matches, location (with permission), and photos. We do not sell your data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              We use Firebase and Google Analytics for app functionality and diagnostics. These services may collect anonymized usage data.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Removal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              You can delete your data at any time by contacting support or using the app's data deletion settings (coming soon).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">
              We may update this policy for clarity or to reflect app changes. Continued use implies acceptance.
            </p>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <Button onClick={() => navigate(-1)}>Got it</Button>
        </div>
      </div>
    </PublicLayout>
  );
} 