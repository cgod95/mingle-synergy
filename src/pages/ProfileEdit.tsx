// 🧠 Purpose: Implement ProfileEdit page to allow user to edit their name and bio.
// --- File: /src/pages/ProfileEdit.tsx ---
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import { logError } from "@/utils/errorHandler";

export default function ProfileEdit() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }
      
      try {
        const { userService } = await import('@/services');
        const profile = await userService.getUserProfile(currentUser.uid);
        if (profile) {
          setName(profile.displayName || profile.name || currentUser.name || "");
          setBio(profile.bio || "");
        } else {
          // Fallback to currentUser data
          setName(currentUser.name || "");
          setBio("");
        }
      } catch (error) {
        logError(error as Error, { context: 'ProfileEdit.loadProfile', userId: currentUser?.uid || 'unknown' });
        // Fallback to currentUser data
        setName(currentUser.name || "");
        setBio("");
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    
    setSaving(true);
    try {
      const { userService } = await import('@/services');
      await userService.updateUserProfile(currentUser.uid, {
        displayName: name, // Use displayName, not name
        bio
      });
      // Navigate to profile page - it will reload data automatically
      navigate("/profile");
    } catch (error) {
      logError(error as Error, { context: 'ProfileEdit.handleSave', userId: currentUser?.uid || 'unknown' });
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-neutral-900 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-neutral-300">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-900 pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          <Card className="w-full border-2 border-neutral-700 bg-neutral-800 shadow-xl">
            <CardHeader className="text-center space-y-2 border-b border-neutral-700">
              <CardTitle className="text-2xl text-white font-bold">
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">Bio</label>
              <Input
                type="text"
                placeholder="Short bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-neutral-700 border-neutral-600 text-white placeholder:text-neutral-400"
              />
            </div>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" 
              onClick={handleSave}
              disabled={saving || !name.trim() || !bio.trim()}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
}
