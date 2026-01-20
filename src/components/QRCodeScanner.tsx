// QR Code Scanner Component
// NOTE: Requires html5-qrcode library to be installed: npm install html5-qrcode
// Currently disabled until library is installed. For now, users can scan QR codes
// with their phone camera app, which will open the URL and auto-check them in.

import { useEffect, useRef, useState } from 'react';
// import { Html5Qrcode } from 'html5-qrcode'; // Uncomment when library is installed
import { X, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { logError } from '@/utils/errorHandler';

interface QRCodeScannerProps {
  onScanSuccess: (venueId: string) => void;
  onClose: () => void;
}

export default function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
  // const scannerRef = useRef<Html5Qrcode | null>(null); // Uncomment when library is installed
  const scannerRef = useRef<any>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>("QR scanner requires html5-qrcode library. Please scan QR code with your phone camera app instead.");
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const scannerId = "qr-reader";

  useEffect(() => {
    // Disabled until html5-qrcode is installed
    setError("QR scanner not available. Please scan the QR code with your phone camera app - it will open the app and auto-check you in!");
    return;
    
    /* Uncomment when html5-qrcode is installed:
    const startScanning = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // QR code scanned successfully
            handleQRCodeScanned(decodedText);
          },
          (errorMessage) => {
            // Ignore scanning errors (just keep scanning)
            // Only log if it's a real error
            if (errorMessage.includes('No MultiFormat Readers')) {
              // This is normal, ignore
            }
          }
        );

        setScanning(true);
        setError(null);
      } catch (err: any) {
        logError(err as Error, { source: 'QRCodeScanner', action: 'startScanning' });
        
        // Check if it's a permission error
        if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
          setCameraPermissionDenied(true);
          setError('Camera permission denied. Please enable camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please use a device with a camera.');
        } else {
          setError('Could not access camera. Please check permissions and try again.');
        }
      }
    };

    startScanning();

    return () => {
      // Cleanup
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
    */ // End of commented code
  }, []);

  const handleQRCodeScanned = (decodedText: string) => {
    // Parse QR code using utility function
    const { parseQRCodeVenueId } = require('@/utils/qrCodeGenerator');
    const venueId = parseQRCodeVenueId(decodedText);
    
    if (venueId) {
      // Stop scanning
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current?.clear();
      
      // Call success handler
      onScanSuccess(venueId);
    } else {
      setError('Invalid QR code format. Please scan a venue QR code.');
    }
  };

  const handleRetry = () => {
    setError(null);
    setCameraPermissionDenied(false);
    // Reload component to retry
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <h2 className="text-lg font-semibold text-neutral-800">Scan QR Code</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 mb-2 font-medium">{error}</p>
              {cameraPermissionDenied && (
                <p className="text-sm text-neutral-600 mb-4">
                  Go to your browser settings and enable camera access for this site.
                </p>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                  <Camera className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                id={scannerId} 
                className="w-full rounded-lg overflow-hidden bg-neutral-900"
                style={{ minHeight: '300px' }}
              />
              <div className="text-center">
                <p className="text-sm text-neutral-600 mb-1">
                  Point camera at venue QR code
                </p>
                <p className="text-xs text-neutral-500">
                  Make sure the QR code is well-lit and in focus
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

