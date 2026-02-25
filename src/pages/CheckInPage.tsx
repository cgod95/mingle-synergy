import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, QrCode, Users, CheckCircle2 } from "lucide-react";
import { getVenues } from "../lib/api";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import config from "@/config";
import { NetworkErrorBanner } from "@/components/ui/NetworkErrorBanner";
import { RetryButton } from "@/components/ui/RetryButton";
import { retryWithMessage, isNetworkError } from "@/utils/retry";
import { logError } from "@/utils/errorHandler";
import { hapticSuccess } from "@/lib/haptics";
import { VenueCardSkeleton } from "@/components/ui/LoadingStates";
import { calculateDistance } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";
import { LocationPermissionPrompt, LocationDeniedBanner } from "@/components/ui/LocationPermissionPrompt";
import { getLocationPermissionStatus } from "@/utils/locationPermission";
import { checkInAt, getCheckedVenueId } from "@/lib/checkinStore";
import QRScannerOverlay from "@/components/QRScannerOverlay";

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
  const [checked, setChecked] = useState<boolean>(() => !!getCheckedVenueId());
  const [checkedVenueId, setCheckedVenueId] = useState<string | null>(() => getCheckedVenueId());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState<Error | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>(getLocationPermissionStatus());
  const [showScanner, setShowScanner] = useState(false);
  
  const loadingRef = useRef(false);
  const lastLoadKeyRef = useRef<string>("");

  const qrVenueId = params.get("venueId");
  const source = params.get("source");

  const onCheckIn = async (id: string) => {
    hapticSuccess();
    checkInAt(id, currentUser?.uid);
    setChecked(true);
    setCheckedVenueId(id);
    
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      const venue = venues.find(v => v.id === id);
      trackUserCheckedIn(id, venue?.name || id);
    } catch (error) {}
    
    navigate(`/venues/${id}`);
  };

  const loadVenues = useCallback(async () => {
    const loadKey = `${qrVenueId || ''}-${source || ''}-${currentUser?.uid || 'none'}`;
    if (loadingRef.current) return;
    if (lastLoadKeyRef.current === loadKey) return;
    
    loadingRef.current = true;
    lastLoadKeyRef.current = loadKey;
    setLoadingVenues(true);
    setVenueError(null);
    
    try {
      const loadedVenues = await retryWithMessage(
        () => getVenues(),
        { operationName: 'loading venues', maxRetries: 3 }
      );
      
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
        } catch (error) {}
      }
      
      const venuesWithDistance: VenueWithDistance[] = loadedVenues.map((venue: any) => {
        let distanceKm: number | undefined;
        if (userLat !== null && userLng !== null && venue.latitude && venue.longitude) {
          distanceKm = calculateDistance(
            { latitude: userLat, longitude: userLng },
            { latitude: venue.latitude, longitude: venue.longitude }
          );
        }
        return { ...venue, distanceKm };
      });
      
      venuesWithDistance.sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) return a.distanceKm - b.distanceKm;
        if (a.distanceKm !== undefined) return -1;
        if (b.distanceKm !== undefined) return 1;
        return (b.checkInCount || 0) - (a.checkInCount || 0);
      });
      
      setVenues(venuesWithDistance.slice(0, 10));
      
      if (qrVenueId && source === "qr" && currentUser) {
        const venue = loadedVenues.find((v: any) => v.id === qrVenueId);
        const alreadyChecked = !!getCheckedVenueId();
        if (venue && !alreadyChecked) {
          setTimeout(() => {
            checkInAt(qrVenueId, currentUser?.uid);
            setChecked(true);
            try {
              import("@/services/specAnalytics").then(({ trackUserCheckedIn }) => {
                trackUserCheckedIn(qrVenueId, venue.name);
              });
            } catch (error) {}
            navigate(`/venues/${qrVenueId}`);
          }, 500);
        }
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to load venues'), { context: 'CheckInPage.loadVenues' });
      setVenueError(error instanceof Error ? error : new Error('Failed to load venues'));
      setVenues([]);
    } finally {
      setLoadingVenues(false);
      loadingRef.current = false;
    }
  }, [qrVenueId, source, currentUser?.uid]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  return (
    <div>
      <NetworkErrorBanner error={venueError} onRetry={loadVenues} />
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-page-title mb-0.5">Venues</h1>
          <p className="text-page-subtitle">Check in to see who's here</p>
        </div>

        {/* Scan QR Code — primary action */}
        <button
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center justify-center gap-3 px-6 py-5 mb-6 bg-violet-600 hover:bg-violet-700 rounded-2xl active:scale-[0.97] transition-all shadow-lg shadow-violet-600/20"
        >
          <QrCode className="w-7 h-7 text-white flex-shrink-0" />
          <span className="text-base font-semibold text-white">Scan QR Code to Check In</span>
        </button>

        {/* QR scan notification */}
        {source === "qr" && qrVenueId && (
          <div className="mb-4 p-3 bg-violet-600/20 rounded-xl">
            <p className="text-sm text-white font-medium">
              Checking you in to {venues.find(v => v.id === qrVenueId)?.name || "venue"}...
            </p>
          </div>
        )}

        {/* Location denied */}
        {locationStatus === 'denied' && <LocationDeniedBanner className="mb-4" />}

        {/* Error state */}
        {venueError && venues.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Failed to load venues</h3>
            <p className="text-sm text-neutral-400 mb-4">
              {isNetworkError(venueError) ? 'Check your connection.' : 'Something went wrong.'}
            </p>
            <RetryButton onRetry={loadVenues} isLoading={loadingVenues} />
          </div>
        )}

        {/* Loading */}
        {loadingVenues && venues.length === 0 && !venueError && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <VenueCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingVenues && !venueError && venues.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No venues nearby</h3>
            <p className="text-sm text-neutral-400 mb-4">Try scanning a QR code at a venue.</p>
            <Button onClick={() => loadVenues()} variant="outline" size="sm" className="rounded-xl">
              Refresh
            </Button>
          </div>
        )}

        {/* Venue Cards */}
        {!loadingVenues && venues.length > 0 && (
          <div className="space-y-3">
            {venues.map((v) => {
              const distanceText = v.distanceKm !== undefined 
                ? v.distanceKm < 1 
                  ? `${Math.round(v.distanceKm * 1000)}m`
                  : `${v.distanceKm.toFixed(1)}km`
                : null;
              
              const isCheckedHere = checkedVenueId === v.id;
              
              return (
                <button
                  key={v.id}
                  onClick={() => isCheckedHere ? navigate(`/venues/${v.id}`) : onCheckIn(v.id)}
                  className="w-full text-left rounded-xl overflow-hidden bg-neutral-800 active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label={isCheckedHere ? `View ${v.name}` : `Check in to ${v.name}`}
                >
                  <div className="relative h-32 overflow-hidden bg-neutral-800">
                    {v.image ? (
                      <img
                        src={v.image}
                        alt={v.name}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-neutral-700">
                        <MapPin className="w-8 h-8 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />
                    
                    {/* You're here badge */}
                    {isCheckedHere && (
                      <div className="absolute top-2.5 left-2.5 bg-green-500/90 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        You're here
                      </div>
                    )}

                    {/* Distance badge */}
                    {distanceText && (
                      <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                        {distanceText}
                      </div>
                    )}
                    
                    {/* Venue info overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="font-bold text-white text-base leading-tight">{v.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {v.address && (
                          <p className="text-neutral-300 text-xs truncate">{v.address}</p>
                        )}
                        {(v.checkInCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1 text-violet-300 text-xs font-medium flex-shrink-0">
                            <Users className="w-3 h-3" />
                            {v.checkInCount} here
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Location permission prompt */}
      <LocationPermissionPrompt
        open={showLocationPrompt}
        onAllow={async () => {
          setShowLocationPrompt(false);
          setIsCheckingIn(true);
          try {
            const { requestLocationPermission } = await import("@/utils/locationPermission");
            const granted = await requestLocationPermission();
            setLocationStatus(granted ? 'granted' : 'denied');
          } catch {
            setLocationStatus('denied');
          } finally {
            setIsCheckingIn(false);
          }
        }}
        onDismiss={() => setShowLocationPrompt(false)}
      />

      {/* QR Scanner Overlay */}
      <QRScannerOverlay
        open={showScanner}
        onClose={() => setShowScanner(false)}
        venues={venues}
        onVenueFound={(venueId, venueName) => {
          setShowScanner(false);
          onCheckIn(venueId);
        }}
      />
    </div>
  );
}
