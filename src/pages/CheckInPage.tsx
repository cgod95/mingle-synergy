import React, { useEffect, useState, useRef, useCallback, lazy, Suspense, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, QrCode, Users, ChevronDown, Sparkles, Search, X } from "lucide-react";
import { getVenues } from "../lib/api";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import config from "@/config";
import { NetworkErrorBanner } from "@/components/ui/NetworkErrorBanner";
import { retryWithMessage, isNetworkError } from "@/utils/retry";
import { logError } from "@/utils/errorHandler";
import { calculateDistance } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";
import venueService from "@/services/firebase/venueService";
import { getLocationPermissionStatus } from "@/utils/locationPermission";

// Lazy load QR scanner
const QRCodeScanner = lazy(() => import("@/components/QRCodeScanner"));

const PENDING_VENUE_CHECKIN_KEY = 'pendingVenueCheckIn';

import { getCheckedVenueId, checkInAt } from "@/lib/checkinStore";

interface VenueWithDistance {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  checkInCount?: number;
  image?: string;
  distanceKm?: number;
}

export default function CheckInPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [venues, setVenues] = useState<VenueWithDistance[]>([]);
  const [checked, setChecked] = useState<boolean>(() => !!getCheckedVenueId());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState<Error | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [locationAvailable, setLocationAvailable] = useState<boolean | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(true); // Show by default
  const [searchQuery, setSearchQuery] = useState('');
  
  const loadingRef = useRef(false);
  const lastLoadKeyRef = useRef<string>("");

  const qrVenueId = params.get("venueId");
  const source = params.get("source");

  // Calculate total people at venues
  const totalPeopleNearby = venues.reduce((sum, v) => sum + (v.checkInCount || 0), 0);

  const onCheckIn = async (id: string) => {
    if (isCheckingIn) return;
    setIsCheckingIn(true);
    
    checkInAt(id);
    setChecked(true);
    
    if (!config.DEMO_MODE && currentUser?.uid) {
      try {
        await venueService.checkInToVenue(currentUser.uid, id);
      } catch (error) {
        logError(error instanceof Error ? error : new Error('Failed to sync check-in'), {
          context: 'CheckInPage.onCheckIn',
          venueId: id
        });
      }
    }
    
    try {
      const { trackUserCheckedIn } = await import("@/services/specAnalytics");
      const venue = venues.find(v => v.id === id);
      trackUserCheckedIn(id, venue?.name || id);
    } catch (error) {
      // Non-critical
    }
    
    navigate(`/venues/${id}`);
  };

  const handleImHere = async () => {
    setIsCheckingIn(true);
    try {
      const { requestLocationPermission } = await import("@/utils/locationPermission");
      const granted = await requestLocationPermission();
      
      if (granted) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        
        let closestVenue: VenueWithDistance | null = null;
        let minDistance = Infinity;
        
        for (const venue of venues) {
          if (venue.latitude && venue.longitude) {
            const dist = calculateDistance(
              { latitude: position.coords.latitude, longitude: position.coords.longitude },
              { latitude: venue.latitude, longitude: venue.longitude }
            );
            if (dist < minDistance) {
              minDistance = dist;
              closestVenue = venue;
            }
          }
        }
        
        if (closestVenue && minDistance < 0.5) {
          await onCheckIn(closestVenue.id);
          toast({
            title: "Checked in!",
            description: `You're now at ${closestVenue.name}`,
          });
        } else {
          toast({
            title: "No venue nearby",
            description: "You need to be within 500m of a venue. Try scanning the QR code instead.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Location needed",
          description: "Enable location to auto check-in, or scan the QR code at the venue.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Couldn't detect location",
        description: "Try scanning the QR code instead.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const loadVenues = useCallback(async () => {
    const loadKey = `${qrVenueId || ''}-${source || ''}-${currentUser?.uid || 'none'}`;
    
    if (loadingRef.current || lastLoadKeyRef.current === loadKey) return;
    
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
      
      const permissionStatus = getLocationPermissionStatus();
      
      if (navigator.geolocation && permissionStatus !== 'denied') {
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
          setLocationAvailable(true);
        } catch {
          setLocationAvailable(false);
        }
      } else {
        setLocationAvailable(permissionStatus === 'denied' ? false : null);
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
      
      if (userLat !== null && userLng !== null) {
        venuesWithDistance.sort((a, b) => {
          if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
            return a.distanceKm - b.distanceKm;
          }
          if (a.distanceKm !== undefined) return -1;
          if (b.distanceKm !== undefined) return 1;
          return (b.checkInCount || 0) - (a.checkInCount || 0);
        });
      } else {
        venuesWithDistance.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      setVenues(venuesWithDistance);
      
      // Handle QR deep link
      if (qrVenueId && source === "qr") {
        if (!currentUser) {
          sessionStorage.setItem(PENDING_VENUE_CHECKIN_KEY, qrVenueId);
          toast({
            title: "Sign in to check in",
            description: "Please sign in to check in to this venue.",
          });
          navigate('/login');
          return;
        }
        
        const venue = loadedVenues.find((v: any) => v.id === qrVenueId);
        const alreadyChecked = !!getCheckedVenueId();
        
        if (venue && !alreadyChecked) {
          setTimeout(() => {
            checkInAt(qrVenueId);
            setChecked(true);
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
  }, [qrVenueId, source, currentUser?.uid, navigate, toast]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const formatDistance = (km?: number) => {
    if (km === undefined) return null;
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
  };

  // Filter venues by search query
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues;
    const query = searchQuery.toLowerCase();
    return venues.filter(v => 
      v.name.toLowerCase().includes(query) ||
      v.address?.toLowerCase().includes(query)
    );
  }, [venues, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      <NetworkErrorBanner error={venueError} onRetry={loadVenues} />
      
      {/* Hero Section - QR Code Focus with gradient background */}
      <div className="relative overflow-hidden">
        {/* Gradient background - matches website */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15)_0%,_transparent_50%)]" />
        
        <div className="relative px-6 pt-10 pb-6">
          {/* Logo with gradient text */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-lg shadow-[#7C3AED]/30">
                <span className="text-white font-bold text-base">M</span>
              </div>
              <span className="text-gradient font-bold text-xl">Mingle</span>
            </div>
          </div>
          
          {/* Main QR Action */}
          <button
            onClick={() => setShowQRScanner(true)}
            className="w-full max-w-sm mx-auto block group"
          >
            <div className="bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] rounded-3xl p-7 shadow-2xl shadow-[#7C3AED]/25 group-hover:shadow-[#7C3AED]/40 group-hover:scale-[1.02] transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white text-center mb-1.5">
                Scan QR to Check In
              </h1>
              <p className="text-[#C4B5FD] text-center text-sm">
                Find the QR code at your venue
              </p>
            </div>
          </button>
          
          {/* Secondary: I'm Here */}
          <div className="text-center mt-5">
            <button
              onClick={handleImHere}
              disabled={isCheckingIn}
              className="inline-flex items-center gap-2 text-[#A78BFA] hover:text-[#C4B5FD] transition-colors disabled:opacity-50"
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isCheckingIn ? "Detecting location..." : "I'm already here"}
              </span>
            </button>
          </div>

          {/* Social Proof / Urgency */}
          {totalPeopleNearby > 0 && (
            <div className="mt-5 text-center">
              <div className="inline-flex items-center gap-2 bg-[#7C3AED]/20 border border-[#7C3AED]/30 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-sm text-[#C4B5FD]">
                  <strong className="text-white">{totalPeopleNearby}</strong> people at venues nearby
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works - Expandable */}
      <div className="px-4 mt-2">
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="w-full flex items-center justify-between py-3 text-left"
        >
          <span className="text-sm font-medium text-[#9CA3AF]">How does it work?</span>
          <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform ${showHowItWorks ? 'rotate-180' : ''}`} />
        </button>
        
        {showHowItWorks && (
          <div className="bg-[#1A1A24] rounded-2xl p-4 mb-4 border border-[#2D2D3A]">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#A78BFA]">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Check in at a venue</p>
                  <p className="text-xs text-[#6B7280]">Scan QR or tap "I'm here"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#A78BFA]">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">See who else is there</p>
                  <p className="text-xs text-[#6B7280]">Browse profiles of people at the same venue</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#A78BFA]">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Match & meet in person</p>
                  <p className="text-xs text-[#6B7280]">If you both like each other, say hi!</p>
                </div>
              </div>
              {/* Restrictions note */}
              <div className="mt-4 pt-3 border-t border-[#2D2D3A]">
                <p className="text-xs text-[#6B7280]">
                  <span className="text-[#A78BFA]">💡</span> Matches last 24 hours with 10 messages — designed to encourage meeting in person!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Venues Section */}
      <div className="px-4 mt-2">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A24] border border-[#2D2D3A] rounded-xl py-2.5 pl-10 pr-10 text-white placeholder:text-[#6B7280] text-sm focus:outline-none focus:border-[#7C3AED] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">
            {searchQuery 
              ? `Results (${filteredVenues.length})`
              : locationAvailable 
                ? "Nearby Venues" 
                : "All Venues"
            }
          </h2>
          {!locationAvailable && !searchQuery && (
            <span className="text-xs text-[#6B7280]">A-Z</span>
          )}
        </div>

        {/* Loading State */}
        {loadingVenues && venues.length === 0 && !venueError && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#1A1A24] rounded-2xl overflow-hidden animate-pulse border border-[#2D2D3A]">
                <div className="aspect-[4/3] bg-[#2D2D3A]" />
                <div className="p-3">
                  <div className="h-4 bg-[#2D2D3A] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#2D2D3A] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {venueError && venues.length === 0 && (
          <div className="bg-[#1A1A24] rounded-2xl p-8 text-center border border-[#2D2D3A]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Couldn't load venues</h3>
            <p className="text-[#9CA3AF] text-sm mb-4">
              {isNetworkError(venueError) ? 'Check your connection' : 'Something went wrong'}
            </p>
            <button
              onClick={() => loadVenues()}
              className="text-[#A78BFA] hover:text-[#C4B5FD] text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingVenues && !venueError && venues.length === 0 && (
          <div className="bg-[#1A1A24] rounded-2xl p-8 text-center border border-[#2D2D3A]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-[#A78BFA]" />
            </div>
            <h3 className="text-white font-semibold mb-2">No venues found</h3>
            <p className="text-[#9CA3AF] text-sm">
              Try scanning a QR code at a venue
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!loadingVenues && venues.length > 0 && filteredVenues.length === 0 && searchQuery && (
          <div className="bg-[#1A1A24] rounded-2xl p-8 text-center border border-[#2D2D3A]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
              <Search className="w-7 h-7 text-[#A78BFA]" />
            </div>
            <h3 className="text-white font-semibold mb-2">No venues found</h3>
            <p className="text-[#9CA3AF] text-sm">
              Try a different search or scan a QR code
            </p>
          </div>
        )}

        {/* Venue Cards Grid */}
        {!loadingVenues && filteredVenues.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {filteredVenues.map((venue) => (
              <button
                key={venue.id}
                onClick={() => onCheckIn(venue.id)}
                className="bg-[#1A1A24] rounded-2xl overflow-hidden text-left hover:bg-[#22222e] hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] border border-[#2D2D3A] hover:border-[#7C3AED]/50"
              >
                {/* Venue Image */}
                <div className="aspect-[4/3] relative bg-[#2D2D3A]">
                  {venue.image ? (
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C3AED]/30 to-[#6D28D9]/20">
                      <MapPin className="w-8 h-8 text-[#A78BFA]/50" />
                    </div>
                  )}
                  
                  {/* Distance Badge */}
                  {venue.distanceKm !== undefined && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                        {formatDistance(venue.distanceKm)}
                      </span>
                    </div>
                  )}
                  
                  {/* People Count - Enhanced */}
                  {venue.checkInCount !== undefined && venue.checkInCount > 0 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-[#7C3AED] backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        {venue.checkInCount} here
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Venue Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {venue.name}
                  </h3>
                  {venue.address && (
                    <p className="text-[#6B7280] text-xs truncate mt-0.5">
                      {venue.address}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
      
      {/* QR Scanner Modal */}
      {showQRScanner && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#7C3AED] border-t-transparent" />
          </div>
        }>
          <QRCodeScanner
            onScanSuccess={(venueId) => {
              setShowQRScanner(false);
              onCheckIn(venueId);
            }}
            onClose={() => setShowQRScanner(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
