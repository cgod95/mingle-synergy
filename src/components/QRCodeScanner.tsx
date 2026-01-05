// QRCodeScanner - Dark theme with brand purple

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logError } from '@/utils/errorHandler';
import { parseQRCodeVenueId } from '@/utils/qrCodeGenerator';

interface QRCodeScannerProps {
  onScanSuccess: (venueId: string) => void;
  onClose: () => void;
}

export default function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const scannerId = "qr-reader";

  useEffect(() => {
    const startScanning = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            handleQRCodeScanned(decodedText);
          },
          () => {}
        );

        setScanning(true);
        setError(null);
      } catch (err: any) {
        logError(err as Error, { source: 'QRCodeScanner', action: 'startScanning' });
        
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
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleQRCodeScanned = (decodedText: string) => {
    const venueId = parseQRCodeVenueId(decodedText);
    
    if (venueId) {
      scannerRef.current?.stop().catch(() => {});
      scannerRef.current?.clear();
      onScanSuccess(venueId);
    } else {
      setError('Invalid QR code format. Please scan a venue QR code.');
    }
  };

  const handleRetry = () => {
    setError(null);
    setCameraPermissionDenied(false);
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111118] rounded-2xl border border-[#2D2D3A] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2D2D3A] flex items-center justify-between bg-gradient-to-r from-[#7C3AED]/10 to-[#6D28D9]/10">
          <h2 className="text-lg font-semibold text-white">Scan QR Code</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-[#6B7280] hover:text-white hover:bg-[#1a1a24]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-2 font-medium">{error}</p>
              {cameraPermissionDenied && (
                <p className="text-sm text-[#6B7280] mb-4">
                  Go to your browser settings and enable camera access for this site.
                </p>
              )}
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={handleRetry} 
                  className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#8B5CF6] hover:to-[#7C3AED] text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-[#2D2D3A] text-[#9CA3AF] hover:bg-[#1a1a24] hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scanner viewport */}
              <div 
                id={scannerId} 
                className="w-full rounded-xl overflow-hidden bg-[#0a0a0f]"
                style={{ minHeight: '300px' }}
              />
              
              {scanning && (
                <div className="text-center">
                  <p className="text-sm text-white mb-1">
                    Point camera at venue QR code
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    Make sure the QR code is well-lit and in focus
                  </p>
                </div>
              )}
              
              {!scanning && !error && (
                <div className="text-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED] mx-auto mb-2" />
                  <p className="text-sm text-[#9CA3AF]">Starting camera...</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full border-[#2D2D3A] text-[#9CA3AF] hover:bg-[#1a1a24] hover:text-white"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
