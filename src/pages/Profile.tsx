// 🧠 Purpose: Implement static Profile page to display current user info.

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-md p-6">
        <CardContent className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-center">Your Profile</h1>
          <p className="text-center text-muted-foreground">{currentUser.email}</p>
          <Button onClick={() => navigate('/profile/edit')}>Edit Profile</Button>
          <Button variant="destructive" onClick={signOut}>Sign Out</Button>
          <button
            onClick={() => navigate('/settings')}
            className="mt-6 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
          >
            Settings
          </button>
        </CardContent>
      </Card>
    </div>
  );
}