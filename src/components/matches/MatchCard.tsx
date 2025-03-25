
import React, { useState } from 'react';
import { Match, User } from '@/types';
import { trackContactShared } from '@/services/appAnalytics';
import { Phone, Instagram, Send, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/shared/OptimizedImage';

interface MatchCardProps {
  match: Match;
  user: User;
  onShareContact: (matchId: string, contactInfo: any) => Promise<boolean>;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, user, onShareContact }) => {
  const [contactType, setContactType] = useState<'phone' | 'instagram' | 'snapchat' | 'custom'>('phone');
  const [contactValue, setContactValue] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const isExpired = match.expiresAt <= Date.now() || !match.isActive;
  
  const getTimeRemaining = () => {
    if (isExpired) return 'Expired';
    
    const diff = match.expiresAt - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactValue.trim()) return;
    
    setIsSharing(true);
    
    try {
      const success = await onShareContact(match.id, {
        type: contactType,
        value: contactValue,
        sharedBy: match.userId,
        sharedAt: new Date().toISOString()
      });
      
      if (success) {
        trackContactShared(match.id);
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error sharing contact:', error);
    } finally {
      setIsSharing(false);
    }
  };
  
  const getVenueName = () => {
    // Extract name from venue ID or use provided name
    if (match.venueName) return match.venueName;
    
    if (match.venueId?.includes('-')) {
      return match.venueId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return 'a venue';
  };
  
  return (
    <Card className="overflow-hidden animate-scale-in">
      <CardHeader className="p-0">
        <div className="relative">
          <OptimizedImage
            src={user.photos[0]}
            alt={user.name || ''}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
            <div className="absolute bottom-3 left-3 text-white">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-white/80">
                Matched at {getVenueName()}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {!match.contactShared && !isExpired && (
          <p className="text-brand-primary text-sm font-medium mb-3">
            Expires in {getTimeRemaining()}
          </p>
        )}
        
        {match.contactShared ? (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-muted-foreground font-medium mb-2">Contact Information</p>
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
                {match.contactInfo?.type === 'phone' && '📱 Phone'}
                {match.contactInfo?.type === 'instagram' && '📸 Instagram'}
                {match.contactInfo?.type === 'snapchat' && '👻 Snapchat'}
                {match.contactInfo?.type === 'custom' && '✨ Contact'}
              </span>
              <p className="ml-3 font-medium">{match.contactInfo?.value}</p>
            </div>
          </div>
        ) : isExpired ? (
          <p className="text-muted-foreground text-sm italic">This match has expired</p>
        ) : showForm ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Share your contact info
              </label>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    contactType === 'phone' 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Phone size={16} className="inline mr-2" /> Phone
                </button>
                
                <button
                  type="button"
                  onClick={() => setContactType('instagram')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    contactType === 'instagram' 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Instagram size={16} className="inline mr-2" /> Instagram
                </button>
                
                <button
                  type="button"
                  onClick={() => setContactType('snapchat')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    contactType === 'snapchat' 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  👻 Snapchat
                </button>
                
                <button
                  type="button"
                  onClick={() => setContactType('custom')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    contactType === 'custom' 
                      ? 'bg-brand-primary text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  ✨ Other
                </button>
              </div>
              
              <Input
                type={contactType === 'phone' ? 'tel' : 'text'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={
                  contactType === 'phone' ? 'Your phone number' :
                  contactType === 'instagram' ? 'Your Instagram username' :
                  contactType === 'snapchat' ? 'Your Snapchat username' :
                  'Your contact info'
                }
                className="w-full"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                <X size={16} className="mr-2" /> Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isSharing || !contactValue.trim()}
                className="flex-1"
              >
                {isSharing ? 'Sharing...' : <><Send size={16} className="mr-2" /> Share</>}
              </Button>
            </div>
          </form>
        ) : (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full"
          >
            Share Contact Info
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchCard;
