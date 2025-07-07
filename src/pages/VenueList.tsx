import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockVenues } from '@/data/mock';
import ErrorBoundary from '../components/ErrorBoundary';
import BottomNav from '../components/BottomNav';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { GridSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Clock, Search, Filter, RefreshCw, HelpCircle } from 'lucide-react';
import VenueCard from '@/components/VenueCard';
import { LoadingOverlay, SkeletonCard } from '@/components/ui/EnhancedLoadingStates';
import { PulseLoader } from '@/components/ui/LoadingStates';
import { Venue } from '@/types/index';
import { analytics } from '@/services/analytics';
import { usePerformanceMonitoring } from '@/services/performanceMonitoring';
import { dataManagement } from '@/services/dataManagement';
import { advancedFeatures } from '@/services/advancedFeatures';
import QuickStartGuide from '@/components/QuickStartGuide';

export default function VenueList() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<Venue[]>([]);
  const [showQuickStart, setShowQuickStart] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recordMetric } = usePerformanceMonitoring();

  // Show quick start guide for first-time demo users
  useEffect(() => {
    const hasSeenQuickStart = localStorage.getItem('hasSeenQuickStart');
    if (!hasSeenQuickStart) {
      setShowQuickStart(true);
      localStorage.setItem('hasSeenQuickStart', 'true');
    }
  }, []);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      recordMetric({
        name: 'page_load',
        value: endTime - startTime,
        unit: 'ms',
        category: 'loading'
      });
    };
  }, [recordMetric]);

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      
      // Track analytics
      analytics.track('venue_list_viewed', {
        timestamp: Date.now(),
        source: 'venue_list_page'
      });

      // Check cache first
      const cachedVenues = dataManagement.get<Venue[]>('venues');
      if (cachedVenues) {
        setVenues(cachedVenues);
        setLoading(false);
        return;
      }

      // Use mock data directly in demo mode
      const venueData = mockVenues;
      
      // Cache the data
      dataManagement.set('venues', venueData, 5 * 60 * 1000); // 5 minutes
      setVenues(venueData);
      
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues');
      
      // Track error
      analytics.track('venue_list_error', {
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleCheckIn = async (venueId: string) => {
    try {
      setLoading(true);
      
      // Track analytics
      analytics.track('venue_check_in_attempted', {
        venueId,
        timestamp: Date.now()
      });

      // Performance monitoring
      const startTime = performance.now();
      
      // await venueService.checkIn(venueId); // REMOVE this line for demo
      
      // Track success
      analytics.track('venue_check_in_success', {
        venueId,
        timestamp: Date.now()
      });

      recordMetric({
        name: 'api_call',
        value: performance.now() - startTime,
        unit: 'ms',
        category: 'network'
      });
      
      // Show success toast
      toast({
        title: "Checked in! 🎉",
        description: "You're now visible to others at this venue.",
        duration: 3000,
      });
      
      navigate(`/venue/${venueId}`);
      
    } catch (error) {
      console.error('Check-in failed:', error);
      
      // Track error
      analytics.track('venue_check_in_error', {
        venueId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
      
      // Show error toast
      toast({
        title: "Check-in failed",
        description: "Please try again in a moment.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      // Track search analytics
      analytics.track('venue_search', {
        query,
        timestamp: Date.now()
      });

      // Use advanced search if available
      try {
        const results = await advancedFeatures.searchVenues(query, venues);
        setSearchResults(results);
      } catch (error) {
        console.error('Advanced search failed, falling back to basic search:', error);
        // Fallback to basic search
        const filtered = venues.filter(venue => 
          venue.name.toLowerCase().includes(query.toLowerCase()) ||
          venue.address.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } else {
      setSearchResults([]);
    }
  }, [venues]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Track refresh analytics
    analytics.track('venue_list_refresh', {
      timestamp: Date.now()
    });

    // Clear cache and refetch
    dataManagement.delete('venues');
    await fetchVenues();
    setIsRefreshing(false);
  };

  const displayVenues = searchQuery ? searchResults : venues;

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8 pb-24">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-neutral-900">Venues</h1>
            <p className="text-neutral-600">Find your next connection</p>
          </div>
          <GridSkeleton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-neutral-900">Venues</h1>
            <p className="text-neutral-600">Find your next connection</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickStart(true)}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
        </div>

        {/* Quick Start Guide */}
        {showQuickStart && (
          <QuickStartGuide 
            variant="modal" 
            onClose={() => setShowQuickStart(false)}
          />
        )}

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-600">
                {displayVenues.length} venue{displayVenues.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Venues Grid */}
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchVenues}>Try Again</Button>
          </div>
        ) : displayVenues.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {searchQuery ? 'No venues found' : 'No venues available'}
            </h3>
            <p className="text-neutral-600 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Check back later for new venues'
              }
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayVenues.map((venue, index) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onSelect={(venueId) => navigate(`/venue/${venueId}`)}
                onCheckIn={handleCheckIn}
                isCheckedIn={false}
                userCount={venue.checkInCount || 0}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
