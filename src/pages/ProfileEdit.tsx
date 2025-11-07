// 🧠 Purpose: Implement ProfileEdit page to allow user to edit their name and bio.
// --- File: /src/pages/ProfileEdit.tsx ---
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import userService from "@/services/firebase/userService";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";

export default function ProfileEdit() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleSave = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    try {
      await userService.updateUserProfile(currentUser.uid, {
        name,
        bio
      });
      navigate("/profile");
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              className="w-full" 
              onClick={handleSave}
              disabled={saving || !name.trim() || !bio.trim()}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
