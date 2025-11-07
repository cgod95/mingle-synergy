// 🧠 Purpose: Scaffold /verification route and placeholder page for future identity verification functionality (e.g., photo or ID verification). This will be developed post-MVP.
// File: /src/pages/Verification.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';

export default function Verification() {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh] pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Verify Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600">Please verify your phone number or email to continue using Mingle.</p>
            <Button className="w-full" disabled>{/* TODO: Enable when verification requirements are met */}Verify</Button>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </Layout>
  );
}
