
import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle, RefreshCw } from 'lucide-react';

interface VerificationStepProps {
  currentUser: User;
  onComplete: () => void;
  onBack: () => void;
}

const VerificationStep: React.FC<VerificationStepProps> = ({ currentUser, onComplete, onBack }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    return () => {
      // Clean up camera on unmount
      if (cameraActive) {
        stopCamera();
      }
    };
  }, [cameraActive]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fall back to file upload if camera access fails
      setCameraActive(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleVerificationSubmit = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    
    try {
      // In a real implementation, this would upload to Firebase Storage
      // and update the user's verification status
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Error uploading verification photo:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const resetPhoto = () => {
    setCapturedImage(null);
  };
  
  return (
    <div className="flex flex-col min-h-[500px] p-4">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Verify Your Identity</h1>
      </div>
      
      <p className="text-gray-600 mb-6">
        To ensure everyone on Mingle is who they say they are, we require a simple verification photo.
        This helps create a safe community focused on real connections.
      </p>
      
      <div className="flex-1 flex flex-col items-center justify-center mb-6">
        {isCompleted ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-xl font-medium mb-2">Verification Complete!</h2>
            <p className="text-gray-600">You're all set to start using Mingle.</p>
          </div>
        ) : capturedImage ? (
          <div className="w-full max-w-sm">
            <div className="relative rounded-xl overflow-hidden mb-4 bg-gray-100">
              <img src={capturedImage} alt="Verification" className="w-full object-cover" />
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={resetPhoto}
                className="flex-1 py-2.5 border border-blue-500 text-blue-500 rounded-full font-medium flex items-center justify-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Retake
              </button>
              
              <button 
                onClick={handleVerificationSubmit}
                disabled={isUploading}
                className="flex-1 py-2.5 bg-blue-500 text-white rounded-full font-medium flex items-center justify-center"
              >
                {isUploading ? 'Uploading...' : 'Submit'}
              </button>
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
            
            <button 
              onClick={capturePhoto}
              className="w-full py-2.5 bg-blue-500 text-white rounded-full font-medium flex items-center justify-center"
            >
              <Camera size={16} className="mr-2" />
              Take Photo
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm text-center">
            <div className="mb-6">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Camera size={48} className="text-blue-500" />
              </div>
              <p className="text-gray-700">Take a clear photo of your face</p>
              <p className="text-gray-500 text-sm">This helps ensure you're a real person</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button 
                onClick={startCamera}
                className="w-full py-2.5 bg-blue-500 text-white rounded-full font-medium"
              >
                Use Camera
              </button>
              
              <div className="relative">
                <button className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-full font-medium">
                  Upload a Photo
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VerificationStep;
