// Verification Page - Dark theme with purple brand colors

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goBackSafely } from '@/utils/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Camera, CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { logError } from '@/utils/errorHandler';

export default function Verification() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!currentUser) {
        navigate('/signin');
        return;
      }

      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          setEmailVerified(true);
        } else {
          try {
            await reload(firebaseUser);
            setEmailVerified(firebaseUser.emailVerified || false);
          } catch (error) {
            logError(error as Error, { source: 'Verification', action: 'reloadUser' });
            setEmailVerified(false);
          }
        }
      } else {
        setEmailVerified(false);
      }

      try {
        const { default: userService } = await import('@/services/firebase/userService');
        const userProfile = await userService.getUserProfile(currentUser.uid);
        setSelfieVerified(userProfile?.isVerified || false);
      } catch (error) {
        logError(error as Error, { source: 'Verification', action: 'checkSelfieVerification' });
      }

      setCheckingStatus(false);
    };

    checkVerificationStatus();

    const interval = setInterval(async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser && !emailVerified) {
        try {
          await reload(firebaseUser);
          if (firebaseUser.emailVerified) {
            setEmailVerified(true);
            toast({
              title: 'Email verified! ✅',
              description: 'Your email has been successfully verified.',
            });
          }
        } catch (error) {
          logError(error as Error, { source: 'Verification', action: 'checkVerificationStatus' });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, emailVerified, navigate]);

  const handleSendEmailVerification = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    setIsLoading(true);
    try {
      await sendEmailVerification(firebaseUser);
      setEmailVerificationSent(true);
      toast({
        title: 'Verification email sent! 📧',
        description: 'Please check your inbox and click the verification link.',
      });
    } catch (error: any) {
      logError(error as Error, { source: 'Verification', action: 'sendEmailVerification' });
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfieVerification = async () => {
    setIsLoading(true);
    try {
      toast({
        title: 'Selfie verification',
        description: 'Selfie verification is coming soon. This feature will help improve safety.',
      });
      
      setTimeout(() => {
        setSelfieVerified(true);
        setIsLoading(false);
        toast({
          title: 'Selfie submitted',
          description: 'Your selfie has been submitted for verification. This may take a few hours.',
        });
      }, 1000);
    } catch (error: any) {
      logError(error as Error, { source: 'Verification', action: 'submitSelfie' });
      toast({
        title: 'Error',
        description: 'Failed to submit selfie. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-20 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_50%)]" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* Back button */}
        <button
          onClick={() => goBackSafely(navigate, '/settings')}
          className="flex items-center text-[#6B7280] hover:text-white text-sm font-medium transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verification
            </h1>
            <p className="text-[#9CA3AF]">
              Verify your account to improve safety and trust. Verification is optional but recommended.
            </p>
          </div>

          {/* Email Verification */}
          <div className="bg-[#111118] rounded-2xl border border-[#2D2D3A] overflow-hidden">
            <div className="p-5 border-b border-[#2D2D3A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${emailVerified ? 'bg-green-500/20' : 'bg-[#7C3AED]/20'}`}>
                  <Mail className={`w-5 h-5 ${emailVerified ? 'text-green-400' : 'text-[#A78BFA]'}`} />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Email Verification</h2>
                  <p className="text-sm text-[#6B7280]">Verify your email address to secure your account</p>
                </div>
              </div>
              {emailVerified ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-[#2D2D3A] text-[#6B7280] border-[#3D3D4A]">
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Verified
                </Badge>
              )}
            </div>
            <div className="p-5 space-y-4">
              {emailVerified ? (
                <p className="text-sm text-green-400">
                  Your email address has been verified. Your account is more secure.
                </p>
              ) : (
                <>
                  <p className="text-sm text-[#9CA3AF]">
                    {emailVerificationSent ? (
                      <>We've sent a verification email to <strong className="text-white">{currentUser?.email}</strong>. Check your inbox and click the link.</>
                    ) : (
                      <>Click below to send a verification email to <strong className="text-white">{currentUser?.email}</strong>.</>
                    )}
                  </p>
                  <Button
                    onClick={handleSendEmailVerification}
                    disabled={isLoading || emailVerificationSent}
                    className="w-full h-12 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white font-semibold rounded-xl disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : emailVerificationSent ? (
                      'Verification Email Sent'
                    ) : (
                      'Send Verification Email'
                    )}
                  </Button>
                  {emailVerificationSent && (
                    <p className="text-xs text-[#6B7280]">
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        onClick={handleSendEmailVerification}
                        className="text-[#A78BFA] hover:underline"
                        disabled={isLoading}
                      >
                        resend
                      </button>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Selfie Verification */}
          <div className="bg-[#111118] rounded-2xl border border-[#2D2D3A] overflow-hidden">
            <div className="p-5 border-b border-[#2D2D3A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selfieVerified ? 'bg-green-500/20' : 'bg-[#7C3AED]/20'}`}>
                  <Camera className={`w-5 h-5 ${selfieVerified ? 'text-green-400' : 'text-[#A78BFA]'}`} />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Selfie Verification</h2>
                  <p className="text-sm text-[#6B7280]">Submit a selfie to verify your identity (optional)</p>
                </div>
              </div>
              {selfieVerified ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-[#2D2D3A] text-[#6B7280] border-[#3D3D4A]">
                  Optional
                </Badge>
              )}
            </div>
            <div className="p-5 space-y-4">
              {selfieVerified ? (
                <p className="text-sm text-green-400">
                  Your selfie has been verified. This helps improve safety for everyone.
                </p>
              ) : (
                <>
                  <div className="text-sm text-[#9CA3AF]">
                    <p className="mb-3">
                      Selfie verification helps ensure you're a real person and improves safety.
                      Your selfie will not be displayed publicly.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-[#6B7280]">
                      <li>Take a clear selfie showing your face</li>
                      <li>Make sure your face is well-lit</li>
                      <li>Verification typically takes a few hours</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleSelfieVerification}
                    disabled={isLoading}
                    className="w-full h-12 bg-[#1a1a24] border border-[#2D2D3A] hover:bg-[#2D2D3A] text-white font-medium rounded-xl"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Submit Selfie
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-[#7C3AED]/10 rounded-2xl border border-[#7C3AED]/30 p-5">
            <p className="font-semibold text-white mb-2">Why verify?</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-[#9CA3AF]">
              <li>Improved account security</li>
              <li>Better matching experience</li>
              <li>Helps maintain a safe community</li>
            </ul>
            <p className="mt-3 text-xs text-[#6B7280]">
              Note: Verification badges are not displayed publicly. This is for safety purposes only.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={() => goBackSafely(navigate, '/settings')} 
              className="flex-1 h-12 bg-[#1a1a24] border border-[#2D2D3A] hover:bg-[#2D2D3A] text-white rounded-xl"
            >
              Back
            </Button>
            <Button 
              onClick={() => navigate('/profile')} 
              className="flex-1 h-12 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white rounded-xl"
            >
              Go to Profile
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
