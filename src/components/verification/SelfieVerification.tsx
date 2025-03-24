
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Upload, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import services from '@/services';
import { storage } from '@/services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface SelfieVerificationProps {
  userId: string;
  onVerificationComplete: () => void;
}

const SelfieVerification: React.FC<SelfieVerificationProps> = ({ userId, onVerificationComplete }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Could not access camera. Please check permissions.');
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access camera. Please check permissions."
      });
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsCapturing(false);
  };
  
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame onto canvas
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      
      // Stop camera
      stopCamera();
    }
  };
  
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };
  
  const uploadSelfie = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const selfieRef = ref(storage, `verification/${userId}/selfie_${Date.now()}.jpg`);
      await uploadBytes(selfieRef, blob);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(selfieRef);
      
      // Update user verification status using our service
      const success = await services.verification.submitVerification(userId, downloadURL);
      
      if (success) {
        toast({
          title: "Verification Submitted",
          description: "Your selfie has been submitted for verification."
        });
        onVerificationComplete();
      } else {
        throw new Error("Failed to submit verification");
      }
    } catch (error) {
      console.error('Error uploading verification photo:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload verification photo. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Verify Your Identity</h2>
        <p className="text-muted-foreground">
          To keep our community safe, please take a selfie to verify your identity.
        </p>
      </div>
      
      <div className="bg-muted rounded-xl overflow-hidden relative mb-6 flex-1 flex items-center justify-center">
        {isCapturing ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Verification selfie" 
            className="w-full h-full object-cover"
          />
        ) : cameraError ? (
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">{cameraError}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={startCamera}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="text-center p-6">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Your selfie will only be used for verification purposes</p>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="mt-auto">
        {isCapturing ? (
          <Button
            onClick={capturePhoto}
            className="w-full"
            size="lg"
          >
            <Camera className="mr-2" />
            Take Photo
          </Button>
        ) : capturedImage ? (
          <div className="flex flex-col space-y-3">
            <Button
              onClick={uploadSelfie}
              disabled={isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <>
                  <Upload className="mr-2" />
                  Submit Verification
                </>
              )}
            </Button>
            
            <Button
              onClick={retakePhoto}
              disabled={isUploading}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2" />
              Retake Photo
            </Button>
          </div>
        ) : (
          <Button
            onClick={startCamera}
            className="w-full"
            size="lg"
          >
            <Camera className="mr-2" />
            Start Camera
          </Button>
        )}
      </div>
    </div>
  );
};

export default SelfieVerification;
