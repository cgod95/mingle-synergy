// ProfileEdit page - Name and photo only (no bio)

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, X, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logError } from "@/utils/errorHandler";
import { useToast } from "@/hooks/use-toast";

export default function ProfileEdit() {
  const [name, setName] = useState("");
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
          setPhotos(profile.photos || []);
        } else {
          setName(currentUser.name || "");
          setPhotos([]);
        }
      } catch (error) {
        logError(error as Error, { context: 'ProfileEdit.loadProfile', userId: currentUser?.uid || 'unknown' });
        setName(currentUser.name || "");
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
      if (!selected.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      
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
        displayName: name,
        photos
      });
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-[#2D2D3A]">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold text-white">Edit Profile</h1>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Photo Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#9CA3AF]">Photo</label>
          
          {/* Current Photo */}
          {photos.length > 0 && photos[0] && !preview && (
            <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-[#2D2D3A]">
              <img
                src={photos[0]}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemoveExistingPhoto(0)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Preview */}
          {preview && (
            <div className="space-y-3">
              <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-[#7C3AED]">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {uploading && (
                <div className="max-w-xs mx-auto space-y-2">
                  <div className="w-full bg-[#1a1a24] rounded-full h-2">
                    <div
                      className="bg-[#7C3AED] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleUploadPhoto}
                disabled={uploading}
                className="w-full max-w-xs mx-auto flex h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
            </div>
          )}
          
          {/* Upload Button */}
          {!preview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs mx-auto flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#2D2D3A] rounded-2xl text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
            >
              <Camera className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">Upload new photo</span>
              <span className="text-xs mt-1">JPG, PNG up to 5MB</span>
            </button>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#9CA3AF]">Name</label>
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#111118] border-[#2D2D3A] text-white placeholder:text-[#4B5563] focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] h-12 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}
