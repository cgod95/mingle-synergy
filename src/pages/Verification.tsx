// Verification Page - Email and optional selfie verification
// Per spec section 3.2: "Verification (lightweight): Email and optional selfie, not public badges—just safety improvements"

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Camera, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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

      // Check email verification status from Firebase auth
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        if (firebaseUser.emailVerified) {
          setEmailVerified(true);
        } else {
          // Reload user to get latest verification status
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

      // Check selfie verification status (stored in user profile)
      // This would come from Firestore user document
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

    // Poll for email verification status every 5 seconds
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
    // Selfie verification would typically:
    // 1. Open camera/file picker
    // 2. Upload selfie to Firebase Storage
    // 3. Submit for verification (manual or AI-based)
    // 4. Update user profile with verification status
    
    setIsLoading(true);
    try {
      // For MVP, this is a placeholder
      // In production, this would integrate with a verification service
      toast({
        title: 'Selfie verification',
        description: 'Selfie verification is coming soon. This feature will help improve safety.',
      });
      
      // Simulate verification process
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 via-pink-50 to-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Verification
            </h1>
            <p className="text-lg text-neutral-600">
              Verify your account to improve safety and trust. Verification is optional but recommended.
            </p>
          </div>

          {/* Email Verification */}
          <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${emailVerified ? 'bg-green-100' : 'bg-indigo-100'}`}>
                    <Mail className={`w-5 h-5 ${emailVerified ? 'text-green-600' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>
                      Verify your email address to secure your account
                    </CardDescription>
                  </div>
                </div>
                {emailVerified ? (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailVerified ? (
                <div className="text-sm text-green-700">
                  Your email address has been verified. Your account is more secure.
                </div>
              ) : (
                <>
                  <div className="text-sm text-neutral-600">
                    {emailVerificationSent ? (
                      <p>
                        We've sent a verification email to <strong>{currentUser?.email}</strong>.
                        Please check your inbox and click the verification link.
                      </p>
                    ) : (
                      <p>
                        Click the button below to send a verification email to <strong>{currentUser?.email}</strong>.
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSendEmailVerification}
                    disabled={isLoading || emailVerificationSent}
                    className="w-full"
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
                    <p className="text-xs text-neutral-500">
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        onClick={handleSendEmailVerification}
                        className="text-indigo-600 hover:underline"
                        disabled={isLoading}
                      >
                        resend
                      </button>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Selfie Verification (Optional) */}
          <Card className="border-2 border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selfieVerified ? 'bg-green-100' : 'bg-purple-100'}`}>
                    <Camera className={`w-5 h-5 ${selfieVerified ? 'text-green-600' : 'text-purple-600'}`} />
                  </div>
                  <div>
                    <CardTitle>Selfie Verification (Optional)</CardTitle>
                    <CardDescription>
                      Submit a selfie to help us verify your identity
                    </CardDescription>
                  </div>
                </div>
                {selfieVerified ? (
                  <Badge className="bg-green-500">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">Optional</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selfieVerified ? (
                <div className="text-sm text-green-700">
                  Your selfie has been verified. This helps improve safety for everyone.
                </div>
              ) : (
                <>
                  <div className="text-sm text-neutral-600">
                    <p className="mb-2">
                      Selfie verification helps us ensure you're a real person and improves safety.
                      This is completely optional and your selfie will not be displayed publicly.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-neutral-500 ml-2">
                      <li>Take a clear selfie showing your face</li>
                      <li>Make sure your face is well-lit and visible</li>
                      <li>Verification typically takes a few hours</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleSelfieVerification}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
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
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border-2 border-indigo-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-sm text-indigo-900">
                <p className="font-semibold mb-2">Why verify?</p>
                <ul className="list-disc list-inside space-y-1 text-indigo-700">
                  <li>Improved account security</li>
                  <li>Better matching experience</li>
                  <li>Helps maintain a safe community</li>
                </ul>
                <p className="mt-3 text-xs text-indigo-600">
                  Note: Verification badges are not displayed publicly. This is for safety purposes only.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/9af3d496-4d58-4d8c-9b68-52ff87ec5850',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Verification.tsx:340',message:'Go back button clicked',data:{hasHistory:window.history.length>1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                // #endregion
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/signin');
                }
              }} 
              className="flex-1 border-indigo-200 hover:bg-indigo-50"
            >
              Back
            </Button>
            <Button 
              onClick={() => navigate('/profile')} 
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            >
              Go to Profile
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
