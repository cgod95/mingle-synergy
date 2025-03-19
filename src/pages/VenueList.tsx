
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VenueCard from '@/components/VenueCard';
import { venues } from '@/data/mockData';
import { Venue } from '@/types';
import { Search, Filter } from 'lucide-react';

const VenueList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>(venues);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Filter venues based on search and type filter
    let results = venues;
    
    if (searchQuery) {
      results = results.filter(venue => 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeFilter) {
      results = results.filter(venue => venue.type === activeFilter);
    }
    
    setFilteredVenues(results);
  }, [searchQuery, activeFilter]);
  
  const venueTypes = [
    { id: 'cafe', label: 'Cafes' },
    { id: 'bar', label: 'Bars' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'gym', label: 'Gyms' },
    { id: 'other', label: 'Other' }
  ];
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-8">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        <div className="flex flex-col gap-6">
          <section>
            <h1 className="text-3xl font-semibold mb-6 animate-fade-in">All Venues</h1>
            
            <div className="relative w-full mb-6 animate-slide-up">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search venues..."
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-2 mb-6 animate-slide-up">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-all ${
                  activeFilter === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All
              </button>
              
              {venueTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveFilter(type.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 transition-all ${
                    activeFilter === type.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className="rounded-xl bg-card shadow-sm border border-border/50 animate-pulse"
                  >
                    <div className="aspect-video w-full bg-muted"></div>
                    <div className="p-4">
                      <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVenues.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                {filteredVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No venues found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default VenueList;
