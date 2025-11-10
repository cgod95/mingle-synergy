// 🧠 Purpose: Add legal and safety informational pages to meet MVP requirements and support Footer navigation links.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-indigo-50">
              <ArrowLeft className="h-5 w-5 text-indigo-600" />
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>

          <div className="space-y-4">
            <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
                <CardTitle className="text-indigo-600">Your Data</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-700">
                  We collect only the information needed to make the app functional and enjoyable. This includes your profile, matches, location (with permission), and photos. We do not sell your data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
                <CardTitle className="text-indigo-600">Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-700">
                  We use Firebase and Google Analytics for app functionality and diagnostics. These services may collect anonymized usage data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
                <CardTitle className="text-indigo-600">Data Removal</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-700">
                  You can delete your data at any time by contacting support or using the app's data deletion settings (coming soon).
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
                <CardTitle className="text-indigo-600">Policy Updates</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-700">
                  We may update this policy for clarity or to reflect app changes. Continued use implies acceptance.
                </p>
              </CardContent>
            </Card>

            <div className="text-center pt-4">
              <Button 
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 