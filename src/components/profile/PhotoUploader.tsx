
import React, { useState, useRef } from 'react';
import { storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from "@/components/ui/button";
import { Plus, Loader } from "lucide-react";

interface PhotoUploaderProps {
  onPhotoUploaded: (url: string) => void;
  userId: string;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ onPhotoUploaded, userId }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;
    
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Create a unique filename
      const fileName = `${userId}_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `users/${userId}/photos/${fileName}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Call the callback with the URL
      onPhotoUploaded(downloadURL);
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        ref={fileInputRef}
      />
      
      <button
        onClick={triggerFileInput}
        disabled={uploading}
        className="w-full h-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
      >
        {uploading ? (
          <div className="w-6 h-6 border-2 border-t-[#F3643E] border-gray-200 rounded-full animate-spin"></div>
        ) : (
          <Plus className="h-8 w-8 text-gray-400" />
        )}
      </button>
      
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default PhotoUploader;
