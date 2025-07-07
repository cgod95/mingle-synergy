import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Camera, 
  Ban, 
  Flag, 
  Phone, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  MessageCircle,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { analytics } from '@/services/analytics';

interface SafetyFeaturesProps {
  userId?: string;
  userName?: string;
  userPhoto?: string;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string, reason: string) => void;
  onVerify?: (userId: string) => void;
}

interface SafetyTip {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'meeting' | 'online' | 'general';
}

const safetyTips: SafetyTip[] = [
  {
    id: 'meet-public',
    title: 'Meet in Public Places',
    description: 'Always meet in well-lit, public venues for your first few dates.',
    icon: <MapPin className="w-5 h-5" />,
    category: 'meeting'
  },
  {
    id: 'trust-instincts',
    title: 'Trust Your Instincts',
    description: 'If something feels off, don\'t hesitate to end the conversation or date.',
    icon: <AlertTriangle className="w-5 h-5" />,
    category: 'general'
  },
  {
    id: 'share-location',
    title: 'Share Your Location',
    description: 'Let a friend know where you\'re going and when you expect to return.',
    icon: <MapPin className="w-5 h-5" />,
    category: 'meeting'
  },
  {
    id: 'verify-photos',
    title: 'Verify Profile Photos',
    description: 'Look for verified profiles and recent photos to ensure authenticity.',
    icon: <Camera className="w-5 h-5" />,
    category: 'online'
  },
  {
    id: 'take-time',
    title: 'Take Your Time',
    description: 'Don\'t rush into meeting someone. Get to know them through messaging first.',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'online'
  },
  {
    id: 'emergency-contacts',
    title: 'Set Up Emergency Contacts',
    description: 'Add trusted friends or family as emergency contacts in your profile.',
    icon: <Phone className="w-5 h-5" />,
    category: 'general'
  }
];

export default function SafetyFeatures({ 
  userId, 
  userName, 
  userPhoto, 
  onBlock, 
  onReport, 
  onVerify 
}: SafetyFeaturesProps) {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified' | 'failed'>('none');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handlePhotoVerification = async () => {
    if (!userId) return;
    
    setIsVerifying(true);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isVerified = Math.random() > 0.3; // 70% success rate
      
      if (isVerified) {
        setVerificationStatus('verified');
        toast({
          title: "✅ Profile Verified!",
          description: "This profile has been verified as authentic.",
        });
        
        analytics.track('profile_verified', {
          user_id: userId,
          verification_method: 'photo'
        });
      } else {
        setVerificationStatus('failed');
        toast({
          title: "⚠️ Verification Failed",
          description: "Unable to verify this profile. Proceed with caution.",
          variant: 'destructive'
        });
      }
    } catch (error) {
      setVerificationStatus('failed');
      toast({
        title: "Error",
        description: "Failed to verify profile. Please try again.",
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBlock = () => {
    if (!userId) return;
    
    onBlock?.(userId);
    toast({
      title: "User Blocked",
      description: `${userName || 'This user'} has been blocked and can no longer contact you.`,
    });
    
    analytics.track('user_blocked', {
      blocked_user_id: userId,
      reason: 'user_initiated'
    });
  };

  const handleReport = () => {
    if (!userId || !reportReason.trim()) return;
    
    onReport?.(userId, reportReason);
    setShowReportModal(false);
    setReportReason('');
    
    toast({
      title: "Report Submitted",
      description: "Thank you for your report. We'll review it within 24 hours.",
    });
    
    analytics.track('user_reported', {
      reported_user_id: userId,
      reason: reportReason
    });
  };

  return (
    <div className="space-y-6">
      {/* Safety Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Shield className="w-6 h-6 mr-2" />
            Safety & Trust
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 text-sm">
            Your safety is our top priority. Use these tools to stay safe and report any concerns.
          </p>
        </CardContent>
      </Card>

      {/* Profile Verification */}
      {userId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Profile Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={userPhoto} alt={userName} />
                <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold">{userName}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {verificationStatus === 'verified' ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : verificationStatus === 'failed' ? (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <User className="w-3 h-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>
              </div>
              
              <Button
                onClick={handlePhotoVerification}
                disabled={isVerifying || verificationStatus === 'verified'}
                size="sm"
                variant={verificationStatus === 'verified' ? 'outline' : 'default'}
              >
                {isVerifying ? 'Verifying...' : verificationStatus === 'verified' ? 'Verified' : 'Verify Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Safety Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 mt-1">
                    {tip.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                    <p className="text-xs text-gray-600">{tip.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {userId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleBlock}
                variant="outline"
                className="flex-1"
              >
                <Ban className="w-4 h-4 mr-2" />
                Block User
              </Button>
              
              <Button
                onClick={() => setShowReportModal(true)}
                variant="outline"
                className="flex-1"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Report User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Please describe the issue..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none"
                rows={4}
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowReportModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportReason.trim()}
                  className="flex-1"
                >
                  Submit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 