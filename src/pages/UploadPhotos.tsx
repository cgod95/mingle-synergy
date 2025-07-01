import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UploadPhotos() {
  const [files, setFiles] = React.useState<FileList | null>(null);
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md text-center p-6">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Upload Your Photos</h1>
          <input type="file" accept="image/*" multiple className="mb-4" onChange={e => setFiles(e.target.files)} />
          <Button className="w-full" disabled={!files || files.length === 0}>Continue</Button>
        </CardContent>
      </Card>
    </div>
  );
}
