// 🧠 Purpose: Implement static Profile page to display current user info.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Your Profile</CardTitle>
            <p className="text-sm text-neutral-600">{currentUser.email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/profile/edit')} className="w-full">Edit Profile</Button>
            <Button variant="outline" onClick={() => navigate('/settings')} className="w-full">Settings</Button>
            <Button variant="destructive" onClick={signOut} className="w-full">Sign Out</Button>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </Layout>
  );
}