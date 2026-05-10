import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, QrCode, Users, CheckCircle2, TrendingUp } from "lucide-react";
import { getVenues } from "../lib/api";
import { useAuth } from "@/context/AuthContext";
import { NetworkErrorBanner } from "@/components/ui/NetworkErrorBanner";
import { RetryButton } from "@/components/ui/RetryButton";
import { retryWithMessage, isNetworkError } from "@/utils/retry";
import { logError } from "@/utils/errorHandler";
import { hapticSuccess } from "@/lib/haptics";
import { VenueCardSkeleton } from "@/components/ui/LoadingStates";
import { EmptyState } from "@/components/ui/EmptyState";
import { calculateDistance } from "@/utils/locationUtils";
import { LocationDeniedBanner } from "@/components/ui/LocationPermissionPrompt";
import { getLocationPermissionStatus } from "@/utils/locationPermission";
import { checkInAt, getCheckedVenueId, getCheckInTimestamp, CHECKIN_DURATION_MS } from "@/lib/checkinStore";
import QRScannerOverlay from "@/components/QRScannerOverlay";

interface Venue {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  checkInCount?: number;
  image?: string;
  openingHours?: string;
}

interface VenueWithDistance extends Venue {
  distanceKm?: number;
}

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [venues, setVenues] = useState<VenueWithDistance[]>([]);
  const [checkedVenueId, setCheckedVenueId] = useState<string | null>(() => getCheckedVenueId());
  const { currentUser } = useAuth();
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState<Error | null>(null);
  const [locationStatus] = useState<string>(getLocationPermissionStatus());
  const [showScanner, setShowScanner] = useState(false);

  const loadingRef = useRef(false);
  const lastLoadKeyRef = useRef<string>("");
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const qrVenueId = params.get("venueId");
  const source = params.get("source");
  const openScanner = params.get("openScanner") === "true";
  const showAll = params.get("showAll") === "true";

  // Open scanner when navigating with ?openScanner=true
  useEffect(() => {
    if (openScanner) setShowScanner(true);
  }, [openScanner]);

  // Auto-redirect to venue details if already checked in (skip if QR scan in progress or showAll)
  useEffect(() => {
    if (source === "qr" && qrVenueId) return;
    if (showAll) return;
    const activeVenueId = getCheckedVenueId();
    if (activeVenueId) {
      const ts = getCheckInTimestamp();
      if (ts && Date.now() - ts < CHECKIN_DURATION_MS) {
        navigateRef.current(`/venues/${activeVenueId}`, { replace: true });
      }
    }
  }, [source, qrVenueId, showAll]);

  const onCheckIn = useCallback(async (id: string) => {
    hapticSuccess();
    checkInAt(id, currentUser?.uid);
    setCheckedVenueId(id);

    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      const venue = venues.find(v => v.id === id);
      trackUserCheckedIn(id, venue?.name || id);
    } catch {
      // analytics is non-critical
    }

    navigateRef.current(`/venues/${id}`);
  }, [currentUser?.uid, venues]);

  const loadVenues = useCallback(async () => {
    const loadKey = `${qrVenueId || ''}-${source || ''}-${currentUser?.uid || 'none'}`;
    if (loadingRef.current) return;
    if (lastLoadKeyRef.current === loadKey) return;

    loadingRef.current = true;
    lastLoadKeyRef.current = loadKey;
    setLoadingVenues(true);
    setVenueError(null);

    try {
      const loadedVenues = (await retryWithMessage(
        () => getVenues(),
        { operationName: 'loading venues', maxRetries: 3 }
      )) as Venue[];

      // Kick off geolocation in parallel; don't block initial render past a
      // short timeout. Saves ~1-5s on first paint when user denies later.
      let userLat: number | null = null;
      let userLng: number | null = null;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 3000,
              maximumAge: 5 * 60 * 1000,
            });
          });
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
        } catch {
          // location is optional - venues still show
        }
      }

      const venuesWithDistance: VenueWithDistance[] = loadedVenues.map((venue) => {
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
        const venue = loadedVenues.find((v) => v.id === qrVenueId);
        const alreadyChecked = !!getCheckedVenueId();
        if (venue && !alreadyChecked) {
          setTimeout(() => {
            checkInAt(qrVenueId, currentUser?.uid);
            void import("@/services/specAnalytics")
              .then(({ trackUserCheckedIn }) => trackUserCheckedIn(qrVenueId, venue.name))
              .catch(() => undefined);
            navigateRef.current(`/venues/${qrVenueId}`);
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
  }, [qrVenueId, source, currentUser]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  return (
    <div>
      <NetworkErrorBanner error={venueError} onRetry={loadVenues} />
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-violet-500 to-pink-500 bg-clip-text text-transparent mb-0.5">Venues</h1>
          <p className="text-page-subtitle">Check in to see who's here</p>
        </div>

        {/* Scan QR Code — primary action */}
        <button
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center justify-center gap-3 px-6 py-5 mb-6 bg-violet-600 hover:bg-violet-700 rounded-2xl active:scale-[0.97] transition-all shadow-lg shadow-violet-600/10"
        >
          <QrCode className="w-7 h-7 text-white flex-shrink-0" />
          <span className="text-base font-semibold text-white">Scan QR Code to Check In</span>
        </button>

        {/* QR scan notification */}
        {source === "qr" && qrVenueId && (
          <div className="mb-4 p-4 bg-violet-600/10 rounded-xl">
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
          <EmptyState
            illustrationVariant="venues"
            title="No venues nearby"
            description="Try scanning a QR code at a venue."
            action={{ label: "Refresh", onClick: () => loadVenues() }}
            secondaryAction={{ label: "Scan QR code", onClick: () => setShowScanner(true) }}
          />
        )}

        {/* Venue Cards */}
        {!loadingVenues && venues.length > 0 && (
          <div className="space-y-3">
            {(() => {
              const maxCheckIn = Math.max(...venues.map(v => v.checkInCount ?? 0), 0);
              const isTopByPopularity = (c: number) => c > 0 && c === maxCheckIn && venues.filter(x => (x.checkInCount ?? 0) === maxCheckIn).length <= 2;
              return venues.map((v) => {
              const distanceText = v.distanceKm !== undefined 
                ? v.distanceKm < 1 
                  ? `${Math.round(v.distanceKm * 1000)}m`
                  : `${v.distanceKm.toFixed(1)}km`
                : null;
              
              const isCheckedHere = checkedVenueId === v.id;
              const showBusiestBadge = venues.length > 1 && isTopByPopularity(v.checkInCount ?? 0);
              
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
                      <div className="absolute top-2.5 left-2.5 bg-green-500/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        You're here
                      </div>
                    )}

                    {/* Distance badge */}
                    {distanceText && (
                      <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {distanceText}
                      </div>
                    )}

                    {/* Busiest badge */}
                    {showBusiestBadge && (
                      <div className="absolute bottom-12 left-2.5 flex items-center gap-1 bg-amber-500/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3" />
                        Busiest
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
            });
            })()}
          </div>
        )}
      </div>

      {/* QR Scanner Overlay */}
      <QRScannerOverlay
        open={showScanner}
        onClose={() => setShowScanner(false)}
        venues={venues}
        onVenueFound={(venueId) => {
          setShowScanner(false);
          onCheckIn(venueId);
        }}
      />
    </div>
  );
}
