import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { hapticLight, hapticMedium, hapticSuccess } from "@/lib/haptics";

interface QRScannerOverlayProps {
  open: boolean;
  onClose: () => void;
  onVenueFound: (venueId: string, venueName: string) => void;
  venues: Array<{ id: string; name: string }>;
}

type ScanPhase = "scanning" | "aligning" | "found" | "checking-in";

export default function QRScannerOverlay({ open, onClose, onVenueFound, venues }: QRScannerOverlayProps) {
  const [phase, setPhase] = useState<ScanPhase>("scanning");
  const [foundVenue, setFoundVenue] = useState<{ id: string; name: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase("scanning");
      setFoundVenue(null);
      stopCamera();
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    startCamera();
    hapticLight();

    // Phase 1: scanning (scan line sweeps) — 3s
    timers.push(setTimeout(() => {
      if (cancelled) return;
      hapticLight();
      setPhase("aligning");

      // Phase 2: aligning / locking on — 1.5s
      timers.push(setTimeout(() => {
        if (cancelled) return;
        hapticMedium();
        const venue = venues[0];
        if (venue) {
          setFoundVenue(venue);
          setPhase("found");

          // Phase 3: found — show venue name — 1.5s
          timers.push(setTimeout(() => {
            if (cancelled) return;
            hapticSuccess();
            setPhase("checking-in");

            // Phase 4: checking-in — 1.2s then navigate
            timers.push(setTimeout(() => {
              if (cancelled) return;
              onVenueFound(venue.id, venue.name);
            }, 1200));
          }, 1500));
        }
      }, 1500));
    }, 3000));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      stopCamera();
    };
  }, [open]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      // Camera not available — the overlay still looks fine without it
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="qr-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col"
      >
        {/* Camera feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark overlay with cutout */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Scanning box border */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-2xl" />

            {/* Animated corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-violet-400 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-violet-400 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-violet-400 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-violet-400 rounded-br-xl" />

            {/* Scan line animation */}
            {phase === "scanning" && (
              <motion.div
                className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent"
                initial={{ top: "10%" }}
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Aligning pulse — scanner locks onto the QR */}
            {phase === "aligning" && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-violet-400"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}

            {/* Found checkmark */}
            {(phase === "found" || phase === "checking-in") && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/80 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Top bar */}
        <div
          className="relative z-10 flex items-center justify-between px-4 pt-2"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
        >
          <h2 className="text-white font-semibold text-lg">Scan QR Code</h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Status text */}
        <div className="relative z-10 mt-auto mb-16 text-center px-6">
          <AnimatePresence mode="wait">
            {phase === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-white text-base font-medium">
                  Point your camera at the venue QR code
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Hold steady while we scan
                </p>
              </motion.div>
            )}
            {phase === "aligning" && (
              <motion.div
                key="aligning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-violet-300 text-base font-medium">
                  QR code detected...
                </p>
                <p className="text-white/50 text-sm mt-1">
                  Verifying venue
                </p>
              </motion.div>
            )}
            {phase === "found" && foundVenue && (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-green-400 text-lg font-semibold">
                  {foundVenue.name}
                </p>
                <p className="text-white/50 text-sm mt-1">QR code detected</p>
              </motion.div>
            )}
            {phase === "checking-in" && foundVenue && (
              <motion.div
                key="checkin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-violet-400 text-lg font-semibold">
                  Checking you in...
                </p>
                <p className="text-white/50 text-sm mt-1">{foundVenue.name}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
