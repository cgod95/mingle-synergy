// 🧠 Purpose: Implement static Profile page to display current user info.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Settings, LogOut, Edit } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';

export default function Profile() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
        <div className="max-w-md mx-auto p-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Profile</h1>
            <p className="text-neutral-600">Manage your account</p>
          </motion.div>

          <Card className="mb-4 border border-neutral-200 shadow-sm">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="mb-4"
              >
                <Avatar className="h-24 w-24 mx-auto ring-4 ring-white shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-3xl font-bold">
                    {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <CardTitle className="text-xl text-neutral-800">{currentUser.name || 'User'}</CardTitle>
              <p className="text-sm text-neutral-600 mt-1">{currentUser.email}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => navigate('/profile/edit')}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                variant="default"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/settings')}
                className="w-full border-neutral-300 hover:bg-neutral-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={signOut}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </Layout>
  );
}