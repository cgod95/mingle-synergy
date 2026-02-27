import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import analytics from '@/services/appAnalytics';
import { logError } from '@/utils/errorHandler';
import { clearCheckIn } from '@/lib/checkinStore';
import ImageCropper from '@/components/ui/ImageCropper';

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
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // Memoized back handler to prevent stuck state
  const handleBack = useCallback(() => {
    if (uploading) return; // Don't navigate while uploading
    
    // Use replace to prevent back button loops
    if (fromProfile) {
      navigate('/profile', { replace: true });
    } else {
      navigate('/create-profile', { replace: true });
    }
  }, [navigate, fromProfile, uploading]);

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

      const objectUrl = URL.createObjectURL(selected);
      setCropSrc(objectUrl);
      setUploaded(false);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setFile(croppedFile);
    const previewUrl = URL.createObjectURL(croppedBlob);
    setPreview(previewUrl);
    setCropSrc(null);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      navigate('/signin', { replace: true });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { userService } = await import('@/services');
      await userService.uploadProfilePhoto(currentUser.uid, file, (pct) => {
        setUploadProgress(pct);
      });

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
        if (!fromProfile) {
          clearCheckIn();
        }
        navigate(fromProfile ? '/profile' : '/checkin', { replace: true });
      }, 800);
    } catch (error: any) {
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
    <Layout showBottomNav={false}>
      <div className="min-h-screen min-h-[100dvh] bg-neutral-900 overflow-y-auto safe-y">
        <div className="flex flex-col min-h-screen min-h-[100dvh] px-4 py-8">
          {/* Back */}
          <div className="flex-shrink-0 mb-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={uploading || uploaded}
              className="text-violet-400 hover:text-violet-300 hover:bg-violet-900/30 -ml-2"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 flex flex-col justify-start pt-[4vh] w-full max-w-sm mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-center mb-6 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">1</div>
                <div className="w-10 h-0.5 bg-violet-600 rounded"></div>
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-semibold">2</div>
              </div>
            </div>

            <div className="text-center mb-6 flex-shrink-0">
              <h1 className="text-3xl font-bold text-white">Upload your photo</h1>
              <p className="text-base text-neutral-300 mt-2">Photos help others recognise you</p>
            </div>

            {/* Photo Preview/Upload Area */}
            <div className="flex justify-center mb-6 flex-shrink-0">
              <label className="relative w-48 h-48 rounded-2xl border-2 border-dashed border-violet-500/30 flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br from-violet-500/5 to-violet-500/10 hover:border-violet-500/50 transition-all duration-200 group active:scale-[0.98]">
                <AnimatePresence mode="wait">
                  {preview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative w-full h-full"
                    >
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      {uploaded && (
                        <div className="absolute inset-0 bg-violet-500/10 flex items-center justify-center">
                          <CheckCircle2 className="w-16 h-16 text-violet-400" />
                        </div>
                      )}
                      {file && !uploaded && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemovePhoto(); }}
                          className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg"
                          type="button"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center space-y-3 text-neutral-400 group-hover:text-violet-400 transition-colors p-4"
                    >
                      <Camera className="w-14 h-14" />
                      <span className="text-sm font-medium text-center">Tap to add a photo</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
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
                className="space-y-2 mb-6 flex-shrink-0"
              >
                <div className="w-full bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-center text-neutral-300">
                  Uploading... {uploadProgress}%
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 flex-shrink-0">
              {preview && !uploaded && (
                <>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base rounded-2xl"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full"
                        />
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Photo
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="w-full h-12 text-neutral-400 hover:text-neutral-200 font-medium text-base rounded-xl"
                  >
                    Retake
                  </Button>
                </>
              )}

              {uploaded && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <p className="text-base text-green-400 font-medium mb-1">Photo uploaded!</p>
                  <p className="text-sm text-neutral-400">Redirecting...</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspect={1}
        />
      )}
    </Layout>
  );
}
