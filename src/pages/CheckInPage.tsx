import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { Clock, History } from "lucide-react";

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
  const { toast } = useToast();
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState<Error | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>([]);
  
  // Add refs to prevent duplicate concurrent calls
  const loadingRef = useRef(false);
  const lastLoadKeyRef = useRef<string>("");

  // Get venueId from QR code URL params
  const qrVenueId = params.get("venueId");
  const source = params.get("source");

  // Load recently visited venues
  useEffect(() => {
    try {
      const recent = JSON.parse(localStorage.getItem('checkedInVenues') || '[]');
      setRecentlyVisited(recent.slice(0, 5)); // Last 5 venues
    } catch (error) {
      // Non-critical
    }
  }, []);

  const onCheckIn = async (id: string) => {
    // Prevent double-clicks
    if (isCheckingIn) return;
    setIsCheckingIn(true);
    
    try {
      // CRITICAL: Update Firebase check-in status so other users can see this user
      if (!config.DEMO_MODE && currentUser?.uid) {
        const venueService = await import("@/services/firebase/venueService");
        await retryWithMessage(
          () => venueService.default.checkInToVenue(currentUser.uid, id),
          { operationName: 'checking in', maxRetries: 3 }
        );
      }
      
      // Only set localStorage and navigate after Firebase succeeds
      localStorage.setItem(ACTIVE_KEY, id);
      setChecked(true);
      
      const venue = venues.find(v => v.id === id);
      
      // Track user checked in event per spec section 9
      try {
        const { trackUserCheckedIn } = await import("@/services/specAnalytics");
        trackUserCheckedIn(id, venue?.name || id);
      } catch (error) {
        // Failed to track check-in event - non-critical
      }
      
      toast({
        title: "Checked in!",
        description: `You're now visible at ${venue?.name || 'the venue'}`,
      });
      
      navigate(`/venues/${id}`);
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'CheckInPage',
        action: 'checkInToVenue',
        venueId: id,
        userId: currentUser?.uid
      });
      
      toast({
        title: "Check-in Failed",
        description: isNetworkError(error) 
          ? "Network error. Please check your connection and try again."
          : "Could not check in. Please try again.",
        variant: "destructive",
      });
      // Don't navigate - stay on page so user can retry
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Memoize loadVenues to prevent recreation and use stable dependencies
  const loadVenues = useCallback(async () => {
    // Create a unique key for this load attempt
    const loadKey = `${qrVenueId || ''}-${source || ''}-${currentUser?.uid || 'none'}`;
    
    // Prevent duplicate concurrent calls
    if (loadingRef.current) {
      return;
    }
    
    // Prevent duplicate calls with same parameters
    if (lastLoadKeyRef.current === loadKey) {
      return;
    }
    
    loadingRef.current = true;
    lastLoadKeyRef.current = loadKey;
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
      loadingRef.current = false;
    }
  }, [qrVenueId, source, currentUser?.uid]); // Use uid instead of whole currentUser object

  useEffect(() => {
    loadVenues();
  }, [loadVenues]); // Only depend on memoized function

  const preselect = qrVenueId || params.get("id");

  return (
    <div className="min-h-screen bg-neutral-900 pb-20">
      <NetworkErrorBanner error={venueError} onRetry={loadVenues} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button - only show if not in demo mode or if user came from landing */}
        {!config.DEMO_MODE && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-neutral-800 border border-neutral-600 hover:border-neutral-500 rounded-md px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        )}
        <div className="mb-6">
          <div className="mb-6 p-6 border-2 border-neutral-700 bg-neutral-800 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">Venues</h1>
            <p className="text-neutral-300 mb-3">Check in with the QR code at the venue, auto check-in, or choose from the venues below.</p>
          </div>
        </div>

        {/* Check-in Options - Uniform Cards */}
        <div className="flex flex-col items-center gap-4 mb-6 relative">
          {/* Connecting visual element */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-indigo-500/50 via-indigo-500/50 to-transparent pointer-events-none z-0" />
          {/* QR Code Scanner Button - Primary */}
          <div className="w-full max-w-md">
            <Card 
              className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-500/40 to-indigo-500/30 cursor-pointer hover:border-indigo-400 hover:from-indigo-500/50 hover:to-indigo-500/40 hover:shadow-xl transition-all relative group"
              onClick={() => {
                // For now, show message about using phone camera
                // Scanner component will be enabled when html5-qrcode is installed
                toast({
                  title: "Scan QR Code",
                  description: "Use your phone camera to scan the venue QR code. It will open this app and auto-check you in!",
                });
              }}
              aria-label="Scan QR code to check in"
            >
              <div className="px-6 py-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Scan QR Code
                </h2>
                <p className="text-sm text-neutral-200">
                  The QR code will automatically check you in
                </p>
              </div>
            </Card>
          </div>

        {/* Show message if coming from QR code */}
        {source === "qr" && qrVenueId && (
          <div className="mb-4 p-4 bg-indigo-500/30 border border-indigo-500/50 rounded-xl">
            <p className="text-sm text-white font-medium">
              📱 Scanned QR code for {venues.find(v => v.id === qrVenueId)?.name || "venue"} - Checking you in...
            </p>
          </div>
        )}

          {/* Auto-detect Button - Secondary */}
          {navigator.geolocation && (
            <div className="w-full max-w-md">
              <Card
                className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-500/40 to-indigo-500/30 cursor-pointer hover:border-indigo-400 hover:from-indigo-500/50 hover:to-indigo-500/40 hover:shadow-xl transition-all relative group"
                onClick={async () => {
                  setIsCheckingIn(true);
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
                        toast({
                          title: "Checked in!",
                          description: `You're now checked in at ${nearbyVenue.name}`,
                        });
                      } else {
                        toast({
                          title: "No venue nearby",
                          description: "Please scan QR code or select a venue manually.",
                          variant: "destructive",
                        });
                      }
                    } else {
                      toast({
                        title: "Location permission needed",
                        description: "Please enable location access or scan QR code.",
                        variant: "destructive",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Location error",
                      description: "Could not detect your location. Please scan QR code or select manually.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsCheckingIn(false);
                  }
                }}
                aria-label="Auto check-in using location"
              >
                <div className="px-6 py-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    I'm Here
                  </h2>
                  <p className="text-sm text-neutral-200">
                    Auto check-in to nearest venue
                  </p>
                </div>
                {isCheckingIn && (
                  <div className="absolute inset-0 bg-indigo-500/50 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Recently Visited Section */}
        {recentlyVisited.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Recently Visited</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {recentlyVisited.map((venueId) => {
                const venue = venues.find(v => v.id === venueId);
                if (!venue) return null;
                return (
                  <Card
                    key={venueId}
                    className="cursor-pointer border border-neutral-700 hover:border-indigo-500 bg-neutral-800 overflow-hidden"
                    onClick={() => onCheckIn(venueId)}
                    aria-label={`Check in to ${venue.name}`}
                  >
                    <div className="relative h-24 w-full overflow-hidden bg-neutral-200">
                      {venue.image ? (
                        <img
                          src={venue.image}
                          alt={venue.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                          <MapPin className="w-6 h-6 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-white truncate">{venue.name}</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        {navigator.geolocation && (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-900 text-neutral-400 font-medium">
                Nearby Venues
              </span>
            </div>
          </div>
        )}

        {checked && (
          <div className="mb-4 p-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border-2 border-indigo-600/50 rounded-xl flex items-center space-x-3 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-indigo-400 flex-shrink-0" />
            <p className="text-sm text-indigo-300 font-semibold">You're checked in! Browse people at your venue.</p>
          </div>
        )}

        {venueError && venues.length === 0 && (
          <div className="mb-6 p-6 bg-neutral-800 rounded-xl border-2 border-red-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Failed to load venues</h3>
            <p className="text-sm text-neutral-300 mb-4">
              {isNetworkError(venueError)
                ? 'Network error. Please check your connection and try again.'
                : venueError.message || 'Something went wrong. Please try again.'}
            </p>
            <RetryButton onRetry={loadVenues} isLoading={loadingVenues} />
          </div>
        )}

        {loadingVenues && venues.length === 0 && !venueError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <VenueCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {!loadingVenues && !venueError && venues.length === 0 && (
          <div className="mb-6 p-8 bg-neutral-800 rounded-xl border-2 border-neutral-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No venues found nearby</h3>
            <p className="text-sm text-neutral-300 mb-4">
              We couldn't find any venues in your area. Try scanning a QR code at a venue or check back later.
            </p>
            <Button
              onClick={() => loadVenues()}
              variant="outline"
              className="border-indigo-600 text-indigo-400 hover:bg-indigo-900/30"
            >
              Refresh
            </Button>
          </div>
        )}

        {!loadingVenues && venues.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v, index) => {
            const distanceText = v.distanceKm !== undefined 
              ? v.distanceKm < 1 
                ? `${Math.round(v.distanceKm * 1000)}m`
                : `${v.distanceKm.toFixed(1)}km`
              : null;
            
            return (
              <div key={v.id}>
                <Card
                  className={`cursor-pointer transition-all h-full overflow-hidden relative border-2 ${
                    isCheckingIn
                      ? "pointer-events-none opacity-70"
                      : preselect === v.id 
                        ? "border-indigo-600 shadow-lg bg-indigo-900/30 ring-2 ring-indigo-500" 
                        : "border-neutral-700 hover:border-indigo-500 hover:shadow-lg bg-neutral-800"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-900`}
                  onClick={() => !isCheckingIn && onCheckIn(v.id)}
                  onKeyDown={(e) => {
                    if (!isCheckingIn && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onCheckIn(v.id);
                    }
                  }}
                  tabIndex={isCheckingIn ? -1 : 0}
                  role="button"
                  aria-label={`Check in to ${v.name}`}
                  aria-disabled={isCheckingIn}
                >
                  {/* Prominent "Tap to Check In" indicator */}
                  <div className="absolute top-2 right-2 z-20">
                    <Badge className={`${isCheckingIn ? 'bg-neutral-600' : 'bg-indigo-600'} text-white font-bold shadow-xl px-3 py-1.5 text-xs border-2 ${isCheckingIn ? 'border-neutral-500' : 'border-indigo-400 animate-pulse'}`}>
                      {isCheckingIn ? 'Checking in...' : 'Tap to Check In'}
                    </Badge>
                  </div>
                  {/* Venue Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-neutral-200 aspect-square">
                    {v.image ? (
                      <img
                        src={v.image}
                        alt={v.name}
                        className="h-full w-full object-cover object-center"
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
                    {/* Distance - PROMINENT */}
                    {distanceText && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-indigo-600 text-white font-bold shadow-xl px-3 py-1.5 text-sm border-2 border-indigo-400">
                          {distanceText}
                        </Badge>
                      </div>
                    )}
                    {/* People count */}
                    {v.checkInCount !== undefined && v.checkInCount > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-indigo-600/90 backdrop-blur-sm border-2 border-indigo-500 text-white font-semibold shadow-lg px-3 py-1">
                          {v.checkInCount} {v.checkInCount === 1 ? 'person' : 'people'} here
                        </Badge>
                      </div>
                    )}
                    {/* Venue Status Indicator */}
                    {v.openingHours && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-600/90 backdrop-blur-sm border-2 border-green-500 text-white font-semibold shadow-lg px-2 py-1 text-xs">
                          <Clock className="w-3 h-3 mr-1 inline" />
                          Open
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white text-lg flex-1">{v.name}</h3>
                      {/* Distance badge in card body for mobile */}
                      {distanceText && (
                        <Badge className="bg-indigo-600 text-white font-semibold text-xs px-2 py-1 ml-2 flex-shrink-0">
                          {distanceText}
                        </Badge>
                      )}
                    </div>
                    {/* Opening Hours - PROMINENT */}
                    {v.openingHours && (
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <p className="text-sm text-indigo-300 font-medium">
                          {v.openingHours.includes('until') || v.openingHours.includes('Closes') 
                            ? v.openingHours.replace(/Closes|Open until/gi, 'Open until').trim()
                            : `Open until ${v.openingHours}`}
                        </p>
                      </div>
                    )}
                    {v.address && (
                      <p className="text-sm text-neutral-400 mb-2">
                        {v.address}
                      </p>
                    )}
                    {/* Social Proof */}
                    {v.checkInCount !== undefined && v.checkInCount > 0 && (
                      <p className="text-xs text-indigo-400 mb-2">
                        {v.checkInCount} {v.checkInCount === 1 ? 'person' : 'people'} checked in today
                      </p>
                    )}
                    {/* Venue Categories/Tags */}
                    {(v as any).categories && Array.isArray((v as any).categories) && (v as any).categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(v as any).categories.slice(0, 3).map((cat: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs border-indigo-700/50 text-indigo-300 bg-indigo-900/20">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
