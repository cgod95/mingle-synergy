import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, ArrowLeft, QrCode } from "lucide-react";
import { getVenues } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import config from "@/config";

const ACTIVE_KEY = "mingle_active_venue";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [venues, setVenues] = useState<any[]>([]);
  const [checked, setChecked] = useState<boolean>(() => !!localStorage.getItem(ACTIVE_KEY));
  const { currentUser } = useAuth();

  // Get venueId from QR code URL params
  const qrVenueId = params.get("venueId");
  const source = params.get("source");

  const onCheckIn = async (id: string) => {
    // DEMO MODE: Photo requirement disabled
    // Photo check removed for easier demo/testing
    
    localStorage.setItem(ACTIVE_KEY, id);
    setChecked(true);
    
    // Track user checked in event per spec section 9
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      const venue = venues.find(v => v.id === id);
      trackUserCheckedIn(id, venue?.name || id);
    } catch (error) {
      console.warn('Failed to track user_checked_in event:', error);
    }
    
    navigate(`/venues/${id}`);
  };

  useEffect(() => {
    getVenues()
      .then(loadedVenues => {
        console.log('[CheckInPage] Loaded venues:', loadedVenues.length);
        setVenues(loadedVenues);
        
        // Auto-check-in if coming from QR code URL
        if (qrVenueId && source === "qr" && currentUser) {
          const venue = loadedVenues.find(v => v.id === qrVenueId);
          const alreadyChecked = !!localStorage.getItem(ACTIVE_KEY);
          
          if (venue && !alreadyChecked) {
            // Small delay to show user what's happening
            setTimeout(() => {
              localStorage.setItem(ACTIVE_KEY, qrVenueId);
              setChecked(true);
              
              // Track check-in
              try {
                import("@/services/specAnalytics").then(({ trackUserCheckedIn }) => {
                  trackUserCheckedIn(qrVenueId, venue.name);
                });
              } catch (error) {
                console.warn('Failed to track user_checked_in event:', error);
              }
              
              navigate(`/venues/${qrVenueId}`);
            }, 500);
          }
        }
      })
      .catch(error => {
        console.error('[CheckInPage] Error loading venues:', error);
        setVenues([]);
      });
  }, [qrVenueId, source, currentUser, navigate]);

  const preselect = qrVenueId || params.get("id");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button - only show if not in demo mode or if user came from landing */}
        {!config.DEMO_MODE && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Check In</h1>
          <p className="text-neutral-600 mb-2">Select your current venue to start meeting people</p>
          <p className="text-sm text-neutral-500">
            💡 You must be within 500m of a venue to check in. Once checked in, you can see and like people at that venue.
          </p>
        </motion.div>

        {/* QR Code Scanner Button - Prominent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card 
            className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 cursor-pointer hover:shadow-xl transition-all"
            onClick={() => {
              // For now, show message about using phone camera
              // Scanner component will be enabled when html5-qrcode is installed
              alert('Scan the venue QR code with your phone camera app. The QR code will open this app and auto-check you in!');
            }}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-800 mb-2">
                Scan QR Code
              </h2>
              <p className="text-sm text-neutral-600 mb-1">
                Use your phone camera to scan the venue QR code
              </p>
              <p className="text-xs text-neutral-500">
                The QR code will automatically check you in
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Show message if coming from QR code */}
        {source === "qr" && qrVenueId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl"
          >
            <p className="text-sm text-indigo-700 font-medium">
              📱 Scanned QR code for {venues.find(v => v.id === qrVenueId)?.name || "venue"} - Checking you in...
            </p>
          </motion.div>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-indigo-50 to-white text-neutral-500">
              or select manually
            </span>
          </div>
        </div>

        {checked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-2"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">You're checked in! Browse people at your venue.</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((v, index) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all h-full overflow-hidden ${
                  preselect === v.id
                    ? "border-2 border-indigo-500 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50"
                    : "border border-neutral-200 hover:border-indigo-300 hover:shadow-xl bg-white"
                }`}
                onClick={() => onCheckIn(v.id)}
              >
                {/* Venue Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={v.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-white/80" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    <h3 className="font-bold text-neutral-800 text-xl mb-1">{v.name}</h3>
                    {v.address && (
                      <div className="flex items-center space-x-1 text-sm text-neutral-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{v.address}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-indigo-600 hover:bg-indigo-50 font-medium"
                  >
                    Check In →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
