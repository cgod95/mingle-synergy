
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Upload, AlertTriangle } from 'lucide-react';
import OptimizedImage from '@/components/shared/OptimizedImage';

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
  const navigate = useNavigate();
  
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
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
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
      // In a real app, we would upload to Firebase Storage
      // For now, simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Verification Submitted",
        description: "Your selfie has been submitted for verification.",
        variant: "default"
      });
      
      onVerificationComplete();
    } catch (error) {
      console.error('Error uploading verification photo:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload verification photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Verify Your Identity</h1>
        <p className="text-muted-foreground">
          To keep our community safe, we need a quick selfie to verify your identity.
        </p>
      </div>
      
      <div className="flex-1 mb-6">
        <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border/30 relative mb-4 h-[350px] flex items-center justify-center">
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
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive font-medium mb-2">Camera Access Error</p>
              <p className="text-muted-foreground text-sm">{cameraError}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Camera className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Click "Start Camera" to begin</p>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-primary mr-2 text-xs text-white flex items-center justify-center">1</span>
            Position your face clearly in the camera
          </p>
          <p className="flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-primary mr-2 text-xs text-white flex items-center justify-center">2</span>
            Ensure good lighting for a clear image
          </p>
          <p className="flex items-center">
            <span className="inline-block w-4 h-4 rounded-full bg-primary mr-2 text-xs text-white flex items-center justify-center">3</span>
            Remove glasses and face coverings
          </p>
        </div>
      </div>
      
      <div className="mt-auto">
        {isCapturing ? (
          <Button
            onClick={capturePhoto}
            className="w-full py-6 rounded-full"
            size="lg"
          >
            Take Photo
          </Button>
        ) : capturedImage ? (
          <div className="flex flex-col space-y-3">
            <Button
              onClick={uploadSelfie}
              disabled={isUploading}
              className="w-full py-6 rounded-full"
              size="lg"
            >
              {isUploading ? 'Uploading...' : 'Submit Verification'}
              {!isUploading && <Upload className="ml-2 w-4 h-4" />}
            </Button>
            
            <Button
              onClick={retakePhoto}
              disabled={isUploading}
              variant="outline"
              className="w-full py-6 rounded-full"
              size="lg"
            >
              Retake Photo
              <RefreshCw className="ml-2 w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={startCamera}
            className="w-full py-6 rounded-full"
            size="lg"
          >
            Start Camera
            <Camera className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SelfieVerification;
