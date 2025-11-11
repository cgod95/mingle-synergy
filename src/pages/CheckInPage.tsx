import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, CheckCircle2, ArrowLeft, QrCode } from "lucide-react";
import { getVenues } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import config from "@/config";
import { NetworkErrorBanner } from "@/components/ui/NetworkErrorBanner";
import { RetryButton } from "@/components/ui/RetryButton";
import { retryWithMessage, isNetworkError } from "@/utils/retry";
import { logError } from "@/utils/errorHandler";
import { VenueCardSkeleton } from "@/components/ui/LoadingStates";
import { calculateDistance } from "@/utils/locationUtils";

const ACTIVE_KEY = "mingle_active_venue";

interface VenueWithDistance {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  checkInCount?: number;
  image?: string;
  distanceKm?: number;
  openingHours?: string;
}

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [venues, setVenues] = useState<VenueWithDistance[]>([]);
  const [checked, setChecked] = useState<boolean>(() => !!localStorage.getItem(ACTIVE_KEY));
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { currentUser } = useAuth();
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState<Error | null>(null);

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
      // Failed to track check-in event - non-critical
    }
    
    navigate(`/venues/${id}`);
  };

  const loadVenues = async () => {
    setLoadingVenues(true);
    setVenueError(null);
    
    try {
      const loadedVenues = await retryWithMessage(
        () => getVenues(),
        { operationName: 'loading venues', maxRetries: 3 }
      );
      
      // Get user location if available
      let userLat: number | null = null;
      let userLng: number | null = null;
      
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 60000
            });
          });
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });
        } catch (error) {
          // Location not available - continue without distance calculation
        }
      }
      
      // Calculate distances and sort by proximity
      const venuesWithDistance: VenueWithDistance[] = loadedVenues.map((venue: any) => {
        let distanceKm: number | undefined;
        if (userLat !== null && userLng !== null && venue.latitude && venue.longitude) {
          distanceKm = calculateDistance(
            { latitude: userLat, longitude: userLng },
            { latitude: venue.latitude, longitude: venue.longitude }
          );
        }
        return {
          ...venue,
          distanceKm
        };
      });
      
      // Sort by distance (closest first), then by check-in count
      venuesWithDistance.sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        if (a.distanceKm !== undefined) return -1;
        if (b.distanceKm !== undefined) return 1;
        return (b.checkInCount || 0) - (a.checkInCount || 0);
      });
      
      // Show top 3 closest venues
      setVenues(venuesWithDistance.slice(0, 3));
      
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
              // Failed to track check-in event - non-critical
            }
            
            navigate(`/venues/${qrVenueId}`);
          }, 500);
        }
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to load venues'), { 
        context: 'CheckInPage.loadVenues' 
      });
      setVenueError(error instanceof Error ? error : new Error('Failed to load venues'));
      setVenues([]);
    } finally {
      setLoadingVenues(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, [qrVenueId, source, currentUser, navigate]);

  const preselect = qrVenueId || params.get("id");

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <NetworkErrorBanner error={venueError} onRetry={loadVenues} />
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
          <div className="bg-white rounded-xl border border-neutral-200 p-5 mb-6 shadow-sm">
            <h1 className="text-heading-1 mb-2">Venues</h1>
            <p className="text-body-secondary mb-3">Check in to see who's here. Scan a QR code or select a venue below.</p>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Showing venues closest to you</span>
            </div>
          </div>
        </motion.div>

        {/* QR Code Scanner Button - Primary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4"
        >
          <Card 
            className="border-2 border-indigo-500 bg-indigo-50 cursor-pointer hover:border-indigo-600 hover:bg-indigo-100 hover:shadow-lg transition-all"
            onClick={() => {
              // For now, show message about using phone camera
              // Scanner component will be enabled when html5-qrcode is installed
              alert('Scan the venue QR code with your phone camera app. The QR code will open this app and auto-check you in!');
            }}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                Scan QR Code
              </h2>
              <p className="text-sm text-neutral-700 mb-1 font-medium">
                Use your phone camera to scan the venue QR code
              </p>
              <p className="text-xs text-neutral-600">
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

        {/* Auto-detect Button - Secondary */}
        {navigator.geolocation && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4"
            >
              <Card className="border border-indigo-300 bg-white hover:border-indigo-400 hover:shadow-md transition-all">
                <Button
                  onClick={async () => {
                    try {
                      const { requestLocationPermission } = await import("@/utils/locationPermission");
                      const granted = await requestLocationPermission();
                      if (granted) {
                        // Try to detect nearby venue
                        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                          navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 10000,
                          });
                        });
                        
                        // Find closest venue (simplified - would need proper distance calculation)
                        const nearbyVenue = venues.find(v => {
                          // Simple distance check (would need proper haversine formula)
                          return v.latitude && v.longitude;
                        });
                        
                        if (nearbyVenue) {
                          await onCheckIn(nearbyVenue.id);
                        } else {
                          alert('No venue detected nearby. Please scan QR code or select manually.');
                        }
                      } else {
                        alert('Location permission needed for auto-detect. Please scan QR code or select manually.');
                      }
                    } catch (error) {
                      alert('Could not detect your location. Please scan QR code or select manually.');
                    }
                  }}
                  variant="outline"
                  className="w-full border-0 text-indigo-600 hover:bg-indigo-50 font-medium"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  I'm Here (Auto-detect)
                </Button>
              </Card>
            </motion.div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-neutral-50 text-neutral-500 font-medium">
                  Nearby Venues
                </span>
              </div>
            </div>
          </>
        )}

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

        {venueError && venues.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-white rounded-xl border-2 border-red-200 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 mb-2">Failed to load venues</h3>
            <p className="text-sm text-neutral-600 mb-4">
              {isNetworkError(venueError)
                ? 'Network error. Please check your connection and try again.'
                : venueError.message || 'Something went wrong. Please try again.'}
            </p>
            <RetryButton onRetry={loadVenues} isLoading={loadingVenues} />
          </motion.div>
        )}

        {loadingVenues && venues.length === 0 && !venueError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VenueCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {!loadingVenues && venues.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((v, index) => {
            const distanceText = v.distanceKm !== undefined 
              ? v.distanceKm < 1 
                ? `${Math.round(v.distanceKm * 1000)}m`
                : `${v.distanceKm.toFixed(1)}km`
              : null;
            
            return (
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
                      ? "border-2 border-indigo-500 shadow-md bg-indigo-50"
                      : "border border-neutral-200 hover:border-indigo-300 hover:shadow-md bg-white"
                  }`}
                  onClick={() => onCheckIn(v.id)}
                >
                  {/* Venue Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-200">
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
                        <MapPin className="w-12 h-12 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {distanceText && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 backdrop-blur-sm border-0 text-indigo-600 font-medium shadow-md">
                          {distanceText}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-neutral-900 text-lg mb-1">{v.name}</h3>
                    {v.address && (
                      <div className="flex items-center space-x-1 text-sm text-neutral-500 mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{v.address}</span>
                      </div>
                    )}
                    {v.openingHours && (
                      <p className="text-xs text-neutral-500 mb-2">{v.openingHours}</p>
                    )}
                    {v.checkInCount !== undefined && v.checkInCount > 0 && (
                      <div className="mb-3 text-sm font-medium text-indigo-600">
                        {v.checkInCount} {v.checkInCount === 1 ? 'person' : 'people'} here
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-indigo-600 hover:bg-indigo-50 font-medium border-0"
                    >
                      Check In →
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
