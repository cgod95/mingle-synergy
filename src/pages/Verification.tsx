
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useToast } from "@/components/ui/use-toast";
import services from '@/services';
import { useAppState } from '@/context/AppStateContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { User } from '@/types';
import { logUserAction } from '@/utils/errorHandler';

const Verification = () => {
  const { currentUser } = useAppState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in');
    }
  }, [currentUser, navigate]);
  
  // Clean up camera when component unmounts
  useEffect(() => {
    return () => {
      if (cameraActive && videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access camera. Please check permissions."
      });
    }
  };
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to the canvas
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    
    // Stop camera
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async () => {
    if (!capturedImage || !currentUser?.id) return;
    
    setIsUploading(true);
    
    try {
      // In a real implementation, you would upload to Firebase here
      // For the demo, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      logUserAction('verification_submitted', { userId: currentUser.id });
      
      setIsCompleted(true);
      toast({
        title: "Verification submitted",
        description: "Your verification has been submitted successfully."
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Could not complete verification. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Verification" showBackButton={true} />
      
      <div className="flex-1 flex flex-col p-4 pt-20">
        {isCompleted ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Verification Complete!</h1>
            <p className="text-muted-foreground text-center mb-8">
              Thank you for verifying your identity. You're all set to start using Mingle.
            </p>
            
            <p className="text-sm text-muted-foreground">Redirecting you to the home page...</p>
          </div>
        ) : (
          <div className="p-4 flex flex-col min-h-[500px]">
            <div className="flex items-center mb-6">
              <button onClick={handleBack} className="mr-3">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl font-semibold">Verify Your Identity</h1>
            </div>
            
            <p className="text-gray-600 mb-6">
              To ensure everyone on Mingle is who they say they are, we require a simple verification photo.
              This helps create a safe community focused on real connections.
            </p>
            
            <div className="flex-1 flex flex-col items-center justify-center mb-6">
              {capturedImage ? (
                <div className="w-full max-w-sm">
                  <div className="relative rounded-xl overflow-hidden mb-4 bg-gray-100">
                    <img src={capturedImage} alt="Verification" className="w-full object-cover" />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => setCapturedImage(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Retake
                    </Button>
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      {isUploading ? 'Uploading...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              ) : cameraActive ? (
                <div className="w-full max-w-sm">
                  <div className="rounded-xl overflow-hidden bg-black mb-4">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full" 
                    />
                  </div>
                  
                  <Button 
                    onClick={capturePhoto}
                    className="w-full"
                  >
                    <Camera className="mr-2" />
                    Take Photo
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-sm text-center">
                  <div className="mb-6">
                    <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Camera size={48} className="text-[#3A86FF]" />
                    </div>
                    <p className="text-gray-700">Take a clear photo of your face</p>
                    <p className="text-gray-500 text-sm">This helps ensure you're a real person</p>
                  </div>
                  
                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={startCamera}
                      className="w-full"
                    >
                      <Camera className="mr-2" />
                      Use Camera
                    </Button>
                    
                    <div className="relative">
                      <Button variant="outline" className="w-full">
                        Upload a Photo
                      </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;
