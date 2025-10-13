import React, { useState, useEffect } from 'react';
import { Phone, Instagram, Send, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { trackContactShared } from '@/services/appAnalytics';
import matchService, { removeLikeBetweenUsers } from '@/services/firebase/matchService';
import { useToast } from '@/components/ui/toast/ToastContext';
import { useUser } from '@/context/UserContext';
import { FirestoreMatch } from '@/types/match';
import { useNavigate } from 'react-router-dom';
import logger from '@/utils/Logger';

// Define ContactInfo type
export type ContactInfo = {
  type: 'phone' | 'instagram' | 'snapchat' | 'custom';
  value: string;
  sharedBy?: string;
  sharedAt?: string;
};

// Extended match type with additional properties
export type ExtendedMatch = FirestoreMatch & {
  expiresAt?: number;
  isActive?: boolean;
  contactShared?: boolean;
  contactInfo?: ContactInfo;
  venueName?: string;
};

// Define MatchCardProps type
export type MatchCardProps = {
  match: ExtendedMatch;
  user: {
    id: string;
    name: string;
    photos: string[];
  };
  onShareContact: (matchId: string, contactInfo: ContactInfo) => Promise<boolean>;
  onReconnectRequest?: () => void;
  onWeMetClick?: () => void;
};

// Helper function to calculate time remaining
const getTimeRemaining = (timestamp: number) => {
  const now = Date.now();
  const expiresAt = timestamp + 3 * 60 * 60 * 1000;
  const diff = expiresAt - now;
  return diff > 0 ? diff : 0;
};

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  user, 
  onShareContact,
  onReconnectRequest,
  onWeMetClick
}) => {
  const { showToast } = useToast();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [contactType, setContactType] = useState<'phone' | 'instagram' | 'snapchat' | 'custom'>('phone');
  const [contactValue, setContactValue] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const [message, setMessage] = useState('');
  const [sentMessage, setSentMessage] = useState(localStorage.getItem(`sent_message_${match.id}`) || '');
  const [receivedMessage, setReceivedMessage] = useState(localStorage.getItem(`received_message_${match.id}`) || '');
  const [showMessageForm, setShowMessageForm] = useState(false);
  
  // Initialize remaining time state
  const [remaining, setRemaining] = useState(() =>
    getTimeRemaining(match.timestamp)
  );

  // Countdown timer effect
  useEffect(() => {
    if (!remaining) return;
    const interval = setInterval(() => {
      const timeLeft = getTimeRemaining(match.timestamp);
      setRemaining(timeLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [match.timestamp, remaining]);
  
  // Calculate if match is expired
  const isExpired = remaining === 0;
  
  // Get the other user's ID
  const otherUserId = match.userId1 === currentUser?.id ? match.userId2 : match.userId1;

  // Function to remove likes between users (optional: fully reset like state)
  const handleRemoveLikeBetweenUsers = async (userId1: string, userId2: string) => {
    try {
      // Call the actual function from the match service
      await removeLikeBetweenUsers(userId1, userId2);
      return true;
    } catch (error) {
      logger.error('Error removing like between users:', error);
      return false;
    }
  };

  const handleReconnect = async () => {
    if (!match?.id || !currentUser?.id) return;
    
    try {
      // Delete the expired match
      await matchService.deleteMatch(match.id);
      
      // Reset like state between users
      await handleRemoveLikeBetweenUsers(currentUser.id, otherUserId);
      
      // Show success message and navigate to /matches
      showToast("Match expired. You can now like each other again.", "success");
      navigate('/matches');
      onReconnectRequest?.();
    } catch (error) {
      logger.error('Error reconnecting:', error);
      showToast("Failed to reconnect. Please try again.", "error");
      navigate('/venues');
    }
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    localStorage.setItem(`sent_message_${match.id}`, message);
    setSentMessage(message);
    setMessage('');
    setShowMessageForm(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactValue || contactValue.trim() === '') {
      setValidationError('Please enter your contact information');
      return;
    }
    
    setValidationError('');
    setIsSharing(true);
    
    try {
      const contactInfo: ContactInfo = {
        type: contactType,
        value: contactValue.trim(),
        sharedBy: match.userId1, // Use userId1 as the default
        sharedAt: new Date().toISOString()
      };
      
      const success = await onShareContact(match.id, contactInfo);
      
      if (success) {
        trackContactShared(match.id);
        setShowForm(false);
      } else {
        setValidationError('Something went wrong. Please try again.');
      }
    } catch (error) {
      logger.error('Error sharing contact:', error);
      setValidationError('Failed to share contact info. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };
  
  const getVenueName = () => {
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
          <div className="aspect-square w-full overflow-hidden">
            <img 
              src={user.photos[0]} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
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
        {/* Countdown or Reconnect button */}
        {!match.contactShared && (
          remaining > 0 ? (
            <p className="text-xs text-gray-500 mb-3">
              Match expires in {Math.floor(remaining / 60000)} min
            </p>
          ) : (
            <button
              className="text-sm text-blue-600 underline mb-3"
              onClick={handleReconnect}
            >
              Reconnect
            </button>
          )
        )}
        
        {/* Messaging section - now featured prominently at the top */}
        <div className="mt-3 mb-4">
          {!sentMessage ? (
            <>
              {!showMessageForm ? (
                <button
                  onClick={() => setShowMessageForm(true)}
                  className="w-full py-2 bg-coral-500 text-white rounded-lg font-medium"
                >
                  Send Message
                </button>
              ) : (
                <div className="mt-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowMessageForm(false)}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="flex-1 py-2 bg-coral-500 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Your message:</p>
              <p className="text-sm">{sentMessage}</p>
            </div>
          )}
          
          {receivedMessage && (
            <div className="bg-coral-50 p-3 rounded-lg mt-3">
              <p className="text-sm font-medium mb-1">Their message:</p>
              <p className="text-sm">{receivedMessage}</p>
            </div>
          )}
        </div>
        
        {/* Contact sharing section - moved below messaging */}
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
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm italic">This match has expired</p>
            <button
              className="text-sm text-blue-600 underline"
              onClick={handleReconnect}
            >
              Reconnect
            </button>
          </div>
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
                className={`w-full ${validationError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                required
              />
              
              {validationError && (
                <p className="text-red-500 text-sm mt-1">{validationError}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setValidationError('');
                }}
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
