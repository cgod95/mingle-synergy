// 🧠 Purpose: Implement ProfileEdit page to allow user to edit their name and bio.
// --- File: /src/pages/ProfileEdit.tsx ---
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, X, Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logError } from "@/utils/errorHandler";
import { useToast } from "@/hooks/use-toast";

export default function ProfileEdit() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setPhotos(profile.photos || []);
        } else {
          // Fallback to currentUser data
          setName(currentUser.name || "");
          setBio("");
          setPhotos([]);
        }
      } catch (error) {
        logError(error as Error, { context: 'ProfileEdit.loadProfile', userId: currentUser?.uid || 'unknown' });
        // Fallback to currentUser data
        setName(currentUser.name || "");
        setBio("");
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      // Validate file type
      if (!selected.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (selected.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadPhoto = async () => {
    if (!file || !currentUser?.uid) {
      toast({
        title: 'No photo selected',
        description: 'Please select a photo to upload.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { userService } = await import('@/services');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const photoUrl = await userService.uploadProfilePhoto(currentUser.uid, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Replace photo (only one photo allowed)
      setPhotos([photoUrl]);
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: 'Photo uploaded!',
        description: 'Your photo has been uploaded successfully.',
      });
    } catch (error) {
      logError(error as Error, { context: 'ProfileEdit.handleUploadPhoto', userId: currentUser?.uid || 'unknown' });
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveExistingPhoto = async (photoIndex: number) => {
    if (!currentUser?.uid) return;
    
    try {
      const updatedPhotos = photos.filter((_, index) => index !== photoIndex);
      const { userService } = await import('@/services');
      await userService.updateUserProfile(currentUser.uid, {
        photos: updatedPhotos
      });
      setPhotos(updatedPhotos);
      toast({
        title: 'Photo removed',
        description: 'Photo has been removed from your profile.',
      });
    } catch (error) {
      logError(error as Error, { context: 'ProfileEdit.handleRemoveExistingPhoto', userId: currentUser?.uid || 'unknown' });
      toast({
        title: 'Failed to remove photo',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    
    setSaving(true);
    try {
      const { userService } = await import('@/services');
      await userService.updateUserProfile(currentUser.uid, {
        displayName: name, // Use displayName, not name
        bio,
        photos // Include photos in update
      });
      // Navigate to profile page - it will reload data automatically
      navigate("/profile");
    } catch (error) {
      logError(error as Error, { context: 'ProfileEdit.handleSave', userId: currentUser?.uid || 'unknown' });
      toast({
        title: "Failed to update profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-neutral-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
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
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
            {/* Photo Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">Profile Photo</label>
              
              {/* Existing Photo */}
              {photos.length > 0 && photos[0] && (
                <div className="mb-3">
                  <div className="relative group">
                    <img
                      src={photos[0]}
                      alt="Profile"
                      className="w-full h-64 object-cover rounded-lg border-2 border-neutral-600"
                    />
                    <button
                      onClick={() => handleRemoveExistingPhoto(0)}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Photo Upload Area */}
              <div className="border-2 border-dashed border-neutral-600 rounded-lg p-6 bg-neutral-700/50">
                {preview ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={handleRemovePhoto}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        aria-label="Remove preview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {uploading && (
                      <div className="space-y-2">
                        <div className="w-full bg-neutral-600 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-neutral-400 text-center">{uploadProgress}%</p>
                      </div>
                    )}
                    <Button
                      onClick={handleUploadPhoto}
                      disabled={uploading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {uploading ? (
                        <span className="flex items-center justify-center">
                          <Upload className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </span>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center w-full py-8 text-neutral-400 hover:text-white transition-colors"
                      disabled={uploading}
                    >
                      <Camera className="w-12 h-12 mb-3" />
                      <span className="text-sm font-medium">Click to upload a photo</span>
                      <span className="text-xs mt-1">JPG, PNG up to 5MB</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                )}
              </div>
            </div>

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
  );
}
