// 🧠 Purpose: Add legal and safety informational pages to meet MVP requirements and support Footer navigation links.

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function Safety() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Safety First</h1>
          <p className="text-left">
            Mingle is committed to safety. Please treat others with respect, meet in public places, and report any inappropriate behavior.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 