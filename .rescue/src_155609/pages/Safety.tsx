// 🧠 Purpose: Add legal and safety informational pages to meet MVP requirements and support Footer navigation links.

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/components/PublicLayout';

export default function Safety() {
  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle>Safety First</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-600 text-center">
              Mingle is committed to safety. Please treat others with respect, meet in public places, and report any inappropriate behavior.
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
} 