import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

export default function UploadPhotos() {
  const [files, setFiles] = React.useState<FileList | null>(null);
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Upload Your Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="w-full p-2 border border-neutral-200 rounded-lg" 
              onChange={e => setFiles(e.target.files)} 
            />
            <Button className="w-full" disabled={!files || files.length === 0}>Continue</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
