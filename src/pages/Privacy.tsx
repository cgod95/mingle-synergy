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
      <div className="min-h-screen bg-neutral-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-indigo-900/30 text-indigo-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>

          <div className="space-y-4">
            <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
                <CardTitle className="text-indigo-400">Your Data</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-300">
                  We collect only the information needed to make the app functional and enjoyable. This includes your profile, matches, location (with permission), and photos. We do not sell your data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
                <CardTitle className="text-indigo-400">Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-300">
                  We use Firebase and Google Analytics for app functionality and diagnostics. These services may collect anonymized usage data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
                <CardTitle className="text-indigo-400">Data Removal</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-300">
                  You can delete your data at any time by contacting support or using the app's data deletion settings (coming soon).
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
                <CardTitle className="text-indigo-400">Policy Updates</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-neutral-300">
                  We may update this policy for clarity or to reflect app changes. Continued use implies acceptance.
                </p>
              </CardContent>
            </Card>

            <div className="text-center pt-4">
              <Button 
                onClick={() => navigate(-1)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
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