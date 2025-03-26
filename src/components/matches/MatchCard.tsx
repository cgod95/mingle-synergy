
import React, { useState } from 'react';
import { Phone, Instagram, Send, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OptimizedImage from '@/components/shared/OptimizedImage';
import { MatchCardProps, ContactInfo } from '@/types/match.types';
import { trackContactShared } from '@/services/appAnalytics';

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  user, 
  onShareContact,
  onReconnectRequest,
  onWeMetClick
}) => {
  const [contactType, setContactType] = useState<'phone' | 'instagram' | 'snapchat' | 'custom'>('phone');
  const [contactValue, setContactValue] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // Adding the requested state variables for messaging
  const [message, setMessage] = useState('');
  const [sentMessage, setSentMessage] = useState(localStorage.getItem(`sent_message_${match.id}`) || '');
  const [receivedMessage, setReceivedMessage] = useState(localStorage.getItem(`received_message_${match.id}`) || '');
  const [showMessageForm, setShowMessageForm] = useState(false);
  
  const isExpired = match.expiresAt <= Date.now() || !match.isActive;
  
  const getTimeRemaining = () => {
    if (isExpired) return 'Expired';
    
    const diff = match.expiresAt - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };
  
  // Adding the requested message sending function
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // In a real app, this would send to Firebase
    localStorage.setItem(`sent_message_${match.id}`, message);
    setSentMessage(message);
    setMessage('');
    setShowMessageForm(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add strict validation to prevent empty submissions
    if (!contactValue || contactValue.trim() === '') {
      setValidationError('Please enter your contact information');
      return;
    }
    
    setValidationError(''); // Clear any previous errors
    setIsSharing(true);
    
    try {
      const contactInfo: ContactInfo = {
        type: contactType,
        value: contactValue.trim(),
        sharedBy: match.userId,
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
      console.error('Error sharing contact:', error);
      setValidationError('Failed to share contact info. Please try again.');
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
          {/* Replaced image with the requested code to fix squashed photos */}
          <div className="aspect-square w-full h-full overflow-hidden">
            <img 
              src={user.photos[0]} 
              alt={user.name} 
              className="w-full h-full object-cover rounded-full"
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
        {!match.contactShared && !isExpired && (
          <p className="text-brand-primary text-sm font-medium mb-3">
            Expires in {getTimeRemaining()}
          </p>
        )}
        
        {/* Added the requested messaging UI */}
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
