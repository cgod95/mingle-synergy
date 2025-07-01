// 🧠 Purpose: Implement ProfileEdit page to allow user to edit their name and bio.
// --- File: /src/pages/ProfileEdit.tsx ---
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import userService from "@/services/firebase/userService";
import { useAuth } from "@/context/AuthContext";

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-xl p-6">
        <CardContent>
          <h1 className="text-2xl font-bold mb-6 text-center">Edit Profile</h1>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Bio</label>
              <Input
                type="text"
                placeholder="Short bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <Button 
              className="w-full mt-6" 
              onClick={handleSave}
              disabled={saving || !name.trim() || !bio.trim()}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
