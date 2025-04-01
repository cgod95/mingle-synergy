import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const UploadPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    // Add your Firebase upload logic here
    console.log('Uploading photos:', photos);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Upload Your Photos</h1>
      <input type="file" accept="image/*" multiple onChange={handleFileChange} />
      <Button className="mt-4" onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default UploadPhotos;
