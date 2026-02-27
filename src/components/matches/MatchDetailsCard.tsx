
import React, { useState } from 'react';
import { Phone, Instagram, Ghost, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ContactInfo {
  type: 'phone' | 'instagram' | 'snapchat' | 'custom';
  value: string;
  sharedBy?: string;
  sharedAt?: string;
}

interface MatchDetailsCardProps {
  match: {
    id: string;
    expiresAt: string;
    venueName?: string;
    contactShared?: boolean;
    contactInfo?: ContactInfo;
  };
  matchedUser: {
    id: string;
    name: string;
    photos: string[];
  };
  currentUser: {
    id: string;
  };
  onShareContact: (matchId: string, contactInfo: ContactInfo) => Promise<void>;
}

const MatchDetailsCard: React.FC<MatchDetailsCardProps> = ({ 
  match, 
  matchedUser, 
  currentUser,
  onShareContact
}) => {
  const [contactType, setContactType] = useState<'phone' | 'instagram' | 'snapchat' | 'custom'>('phone');
  const [contactValue, setContactValue] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactValue.trim()) return;
    
    setIsSharing(true);
    
    try {
      await onShareContact(match.id, {
        type: contactType,
        value: contactValue,
        sharedBy: currentUser.id,
        sharedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sharing contact:', error);
    } finally {
      setIsSharing(false);
    }
  };
  
  const getTimeRemaining = () => {
    const expiryTime = new Date(match.expiresAt).getTime();
    const now = Date.now();
    const diff = expiryTime - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={matchedUser.photos[0]} 
            alt={matchedUser.name} 
            className="w-16 h-16 rounded-full object-cover"
          />
          
          <div>
            <h2 className="text-xl font-semibold">{matchedUser.name}</h2>
            <p className="text-[#7B8794] text-sm">Matched at {match.venueName || 'a venue'}</p>
            {!match.contactShared && (
              <p className="text-[#F3643E] text-sm font-medium">
                Expires in {getTimeRemaining()}
              </p>
            )}
          </div>
        </div>
        
        {match.contactShared && match.contactInfo ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-[#212832] font-medium mb-2">Contact Information Shared</p>
            <div className="flex items-center">
              <div className="bg-[#F3643E]/10 text-[#F3643E] px-3 py-1 rounded-full text-sm font-medium">
                {match.contactInfo.type === 'phone' && '📱 Phone'}
                {match.contactInfo.type === 'instagram' && '📸 Instagram'}
                {match.contactInfo.type === 'snapchat' && '👻 Snapchat'}
                {match.contactInfo.type === 'custom' && '✨ Contact'}
              </div>
              <p className="ml-3 text-[#212832] font-medium">{match.contactInfo.value}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#212832] mb-1">
                Share your contact info
              </label>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center",
                    contactType === 'phone' 
                      ? "bg-[#F3643E] text-white" 
                      : "bg-gray-100 text-[#212832]"
                  )}
                >
                  <Phone className="w-4 h-4 mr-1.5" /> Phone
                </button>
                
                <button
                  type="button"
                  onClick={() => setContactType('instagram')}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center",
                    contactType === 'instagram' 
                      ? "bg-[#F3643E] text-white" 
                      : "bg-gray-100 text-[#212832]"
                  )}
                >
                  <Instagram className="w-4 h-4 mr-1.5" /> Instagram
                </button>
                
                <button
                  type="button"
                  onClick={() => setContactType('snapchat')}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center",
                    contactType === 'snapchat' 
                      ? "bg-[#F3643E] text-white" 
                      : "bg-gray-100 text-[#212832]"
                  )}
                >
                  <Ghost className="w-4 h-4 mr-1.5" /> Snapchat
                </button>
                
                <button
                  type="button"
                  onClick={() => setContactType('custom')}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center",
                    contactType === 'custom' 
                      ? "bg-[#F3643E] text-white" 
                      : "bg-gray-100 text-[#212832]"
                  )}
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Other
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
            
            <Button
              type="submit"
              disabled={isSharing || !contactValue.trim()}
              className="w-full py-6 bg-[#F3643E] hover:bg-[#F3643E]/80 text-white rounded-full font-medium disabled:opacity-50"
            >
              {isSharing ? 'Sharing...' : 'Share Contact Info'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MatchDetailsCard;
