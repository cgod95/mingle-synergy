
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import VenueCard from '@/components/VenueCard';
import ToggleButton from '@/components/ToggleButton';
import { venues } from '@/data/mockData';
import { MapPin, Search, TrendingUp } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-8">
      <Header />
      
      <main className="container mx-auto px-4 mt-6">
        <div className="flex flex-col gap-6">
          <section>
            <h1 className="text-3xl font-semibold mb-6 animate-fade-in">Discover</h1>
            
            <div className="relative w-full mb-6 animate-slide-up">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search venues..."
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <ToggleButton 
              isVisible={isVisible} 
              onToggle={toggleVisibility}
              className="mb-6 w-full animate-slide-up" 
            />
            
            <div className="flex items-center justify-between mb-4 animate-slide-up">
              <h2 className="text-lg font-medium">Popular Nearby</h2>
              <button className="text-primary text-sm font-medium">See All</button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {venues.slice(0, 2).map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            )}
          </section>
          
          <section className="mt-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Trending in Sydney</h2>
              <button className="text-primary text-sm font-medium">See All</button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {venues.slice(2, 5).map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            )}
          </section>
          
          <section className="mt-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recently Visited</h2>
              <button className="text-primary text-sm font-medium">See History</button>
            </div>
            
            {loading ? (
              <div className="overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-64 flex-shrink-0 rounded-xl bg-card shadow-sm border border-border/50 animate-pulse"
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
              </div>
            ) : (
              <div className="overflow-x-auto pb-4 -mx-4 px-4">
                <div className="flex space-x-4">
                  {venues.map((venue) => (
                    <VenueCard 
                      key={venue.id} 
                      venue={venue} 
                      className="w-64 flex-shrink-0" 
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
