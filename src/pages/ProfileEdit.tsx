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
        console.error('Error loading profile:', error);
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
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white pb-20">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          <Card className="w-full border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-xl">
            <CardHeader className="text-center space-y-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
              <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold">
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-900">Bio</label>
              <Input
                type="text"
                placeholder="Short bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold" 
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
