// PhotoUpload - Dark theme with brand purple

import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, X, CheckCircle2, ArrowLeft, Loader2, ImagePlus, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import analytics from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';

export default function PhotoUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromProfile = location.state?.from === 'profile';
  const { currentUser } = useAuth();
  const { setOnboardingStepComplete } = useOnboarding();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);

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
      const previewUrl = URL.createObjectURL(selected);
      setPreview(previewUrl);
      setUploaded(false);
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setPreview(null);
    setUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No photo selected',
        description: 'Please select a photo to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser || !currentUser.uid) {
      toast({
        title: 'Authentication error',
        description: 'Please sign in again.',
        variant: 'destructive',
      });
      navigate('/signin');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 200);

      const uploadPromise = (async () => {
        const { userService } = await import('@/services');
        return await userService.uploadProfilePhoto(currentUser.uid, file);
      })();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Upload timeout. Please try again.'));
        }, 30000);
      });

      await Promise.race([uploadPromise, timeoutPromise]);
      
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setUploadProgress(100);
      setUploaded(true);
      
      setOnboardingStepComplete('photo');
      
      analytics.track('onboarding_step_completed', {
        step: 'photo',
        step_number: 2,
        has_photo: true,
      });
      
      toast({
        title: 'Photo uploaded!',
        description: 'Your profile photo has been uploaded successfully.',
      });

      setTimeout(() => {
        try {
          navigate(fromProfile ? '/profile' : '/checkin');
        } catch (navError) {
          logError(navError as Error, { 
            context: 'PhotoUpload.navigate', 
            target: fromProfile ? '/profile' : '/checkin' 
          });
          window.location.href = fromProfile ? '/profile' : '/checkin';
        }
      }, 1000);
    } catch (error: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      logError(error as Error, { 
        context: 'PhotoUpload.handleUpload', 
        userId: currentUser?.uid || 'unknown',
        fileName: file.name,
        fileSize: file.size 
      });
      
      let errorMessage = 'Failed to upload photo. Please try again.';
      
      if (error?.message?.includes('timeout')) {
        errorMessage = 'Upload took too long. Please check your connection and try again.';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error?.message?.includes('quota') || error?.message?.includes('storage')) {
        errorMessage = 'Storage quota exceeded. Please contact support.';
      } else if (error?.message?.includes('permission') || error?.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check your account settings.';
      }
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setUploadProgress(0);
      setUploaded(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_50%)]" />
      
      {/* Progress bar */}
      <div className="w-full h-1 bg-[#1a1a24]">
        <div className="h-full w-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]" />
      </div>

      {/* Back button */}
      <div className="px-6 py-4">
        <button
          onClick={() => navigate('/create-profile')}
          className="flex items-center text-[#6B7280] hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto w-full"
        >
          {/* Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30 mb-6">
            <ImagePlus className="w-8 h-8 text-white" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-[#A78BFA] text-sm font-semibold uppercase tracking-wider mb-2">Step 2 of 2</p>
            <h1 className="text-2xl font-bold text-white mb-2">Add your photo</h1>
            <p className="text-[#6B7280]">A clear photo helps others recognize you</p>
          </div>

          {/* Photo Upload Area */}
          <div className="flex justify-center mb-8">
            <label className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-[#7C3AED]/40 flex items-center justify-center cursor-pointer overflow-hidden bg-[#111118] hover:border-[#7C3AED]/70 hover:bg-[#1a1a24] transition-all duration-200 group">
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative w-full h-full"
                  >
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    {uploaded && (
                      <div className="absolute inset-0 bg-[#7C3AED]/30 flex items-center justify-center">
                        <CheckCircle2 className="w-16 h-16 text-white" />
                      </div>
                    )}
                    {file && !uploaded && !uploading && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemovePhoto();
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center space-y-3 text-[#6B7280] group-hover:text-[#A78BFA] transition-colors"
                  >
                    <Camera className="w-12 h-12" />
                    <span className="text-sm font-medium">Tap to add photo</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading || uploaded}
              />
            </label>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 mb-6"
            >
              <div className="w-full bg-[#1a1a24] rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-center text-[#9CA3AF]">
                Uploading... {uploadProgress}%
              </p>
            </motion.div>
          )}

          {/* Success Message */}
          {uploaded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <p className="text-sm text-green-400 font-medium mb-2">
                ✓ Photo uploaded successfully!
              </p>
              <p className="text-xs text-[#6B7280]">
                Redirecting...
              </p>
            </motion.div>
          )}

          {/* Action Button */}
          {preview && !uploaded && (
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full h-14 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white font-semibold rounded-xl shadow-lg shadow-[#7C3AED]/25 transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          )}

          {!preview && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white font-semibold rounded-xl shadow-lg shadow-[#7C3AED]/25 transition-all"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take a Photo
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
