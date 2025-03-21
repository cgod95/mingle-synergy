
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { User, Venue } from '@/types';
import { venues, getUsersAtVenue } from '@/data/mockData';
import { Users, Heart, ArrowLeft, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const SimpleVenueView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [usersAtVenue, setUsersAtVenue] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({});
  
  // Load venue and users
  useEffect(() => {
    if (!id) return;
    
    // Find venue
    const foundVenue = venues.find(v => v.id === id);
    setVenue(foundVenue || null);
    
    // Get users at this venue - all 12 users will be at each venue
    const users = getUsersAtVenue(id);
    setUsersAtVenue(users);
    
    // Initialize image loading state
    const initialLoadingState: {[key: string]: boolean} = {};
    users.forEach(user => {
      initialLoadingState[user.id] = false;
    });
    setImagesLoaded(initialLoadingState);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 300);
    
  }, [id]);
  
  const handleLikeUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Animation on heart click
    const target = e.currentTarget;
    target.classList.add('scale-120');
    setTimeout(() => {
      target.classList.remove('scale-120');
    }, 120);
    
    if (likedUsers.includes(userId)) {
      setLikedUsers(prev => prev.filter(id => id !== userId));
      toast({
        title: "Interest removed",
        description: "You've removed your interest",
      });
    } else {
      setLikedUsers(prev => [...prev, userId]);
      toast({
        title: "Interest sent",
        description: "They'll be notified of your interest",
      });
    }
  };
  
  const handleImageLoad = (userId: string) => {
    setImagesLoaded(prev => ({
      ...prev,
      [userId]: true
    }));
  };
  
  const formatExpiryTime = () => {
    if (!venue) return '';
    
    const now = new Date();
    const expiryDate = new Date(now.getTime() + venue.expiryTime * 60 * 1000);
    
    // Format as "4:37 PM"
    return expiryDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#202020] pt-16 pb-24">
      <Header />
      
      <main className="container mx-auto px-4 mt-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-[#F1F5F9] rounded w-2/3"></div>
            <div className="h-16 bg-[#F1F5F9] rounded w-full"></div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[5/7] bg-[#F1F5F9] rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : venue ? (
          <div className="animate-fade-in">
            {/* Venue Header - max 120px height */}
            <div className="bg-white rounded-xl border border-[#F1F5F9] p-4 mb-6 shadow-[0px_2px_8px_rgba(0,0,0,0.05)] max-h-[120px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={() => navigate('/venues')}
                    className="mr-3 text-[#505050] hover:text-[#202020]"
                    aria-label="Back"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h1 className="text-[18px] font-semibold text-[#202020] truncate">{venue.name}</h1>
                    <p className="text-[14px] text-[#505050] truncate">{venue.address}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => navigate('/venues')}
                  className="text-[14px] text-[#EF4444] hover:text-[#EF4444]/80 transition-colors"
                >
                  Check Out
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center text-[#3A86FF] text-[14px]">
                  <Users size={16} className="mr-1.5" />
                  <span>{venue.checkInCount} people</span>
                </div>
                
                <div className="flex items-center text-[#505050] text-[14px]">
                  <Clock size={16} className="mr-1.5" />
                  <span>Expires {formatExpiryTime()}</span>
                </div>
              </div>
            </div>
            
            {/* People Here Section */}
            <div>
              <h2 className="text-[20px] font-semibold mb-4 text-[#202020]">People Here</h2>
              
              {usersAtVenue.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 pb-16">
                  {usersAtVenue.map((user) => (
                    <div 
                      key={user.id}
                      className="relative w-[100px] h-[140px] overflow-hidden rounded-xl bg-white border border-[#F1F5F9] shadow-[0px_2px_8px_rgba(0,0,0,0.05)] transition-opacity duration-100 hover:opacity-80 active:opacity-80"
                    >
                      <div className="w-full h-full relative">
                        {!imagesLoaded[user.id] && (
                          <div className="absolute inset-0 bg-[#F1F5F9] flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#3A86FF] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <img 
                          src={user.photos[0] + "?auto=format&fit=crop&w=300&q=80"} 
                          alt={user.name}
                          className={`w-full h-full object-cover ${!imagesLoaded[user.id] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                          loading="lazy"
                          onLoad={() => handleImageLoad(user.id)}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-[#202020]/80 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <div className="flex items-end justify-between">
                            <div className="overflow-hidden">
                              <h3 className="text-[14px] font-medium text-white truncate">{user.name}</h3>
                              <p className="text-[12px] text-white/80 truncate">{user.age}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Heart button */}
                        <button
                          onClick={(e) => handleLikeUser(user.id, e)}
                          className={`absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-120 transform ${
                            likedUsers.includes(user.id) 
                              ? "bg-[#3A86FF]"
                              : "bg-white/50 backdrop-blur-sm hover:bg-white/70"
                          }`}
                          aria-label={likedUsers.includes(user.id) ? "Remove Interest" : "Express Interest"}
                        >
                          <Heart 
                            size={14} 
                            className={likedUsers.includes(user.id) ? "fill-white text-white" : "text-white"} 
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 mt-10 bg-white rounded-xl border border-[#F1F5F9] shadow-[0px_2px_8px_rgba(0,0,0,0.05)]">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                    {/* Silhouette placeholder */}
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32 32C38.6274 32 44 26.6274 44 20C44 13.3726 38.6274 8 32 8C25.3726 8 20 13.3726 20 20C20 26.6274 25.3726 32 32 32Z" fill="#F1F5F9"/>
                      <path d="M54 56C54 42.7452 44.2548 32 32 32C19.7452 32 10 42.7452 10 56" stroke="#F1F5F9" strokeWidth="4"/>
                    </svg>
                  </div>
                  <p className="text-[16px] text-[#505050]">No one here yet. Be the first.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F1F5F9] mb-4">
              <Users className="w-8 h-8 text-[#505050]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#202020]">Venue not found</h3>
            <p className="text-[#505050] mb-4">
              The venue you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate('/venues')}
              className="py-2 px-4 bg-[#3A86FF] text-white rounded-lg hover:bg-[#3A86FF]/90 transition-colors shadow-[0_2px_10px_rgba(58,134,255,0.2)]"
            >
              Back
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SimpleVenueView;
