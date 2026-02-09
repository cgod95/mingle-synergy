import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  UserX, 
  CheckCircle, 
  Flag, 
  Camera, 
  Phone, 
  MapPin,
  Clock,
  Users,
  Settings,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/services/analytics';

interface SafetyFeaturesProps {
  className?: string;
}

interface ReportReason {
  id: string;
  label: string;
  description: string;
  category: 'inappropriate' | 'spam' | 'fake' | 'harassment' | 'other';
}

interface SafetyTip {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'block' | 'verify' | 'tips'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');

  const reportReasons: ReportReason[] = [
    {
      id: 'inappropriate_content',
      label: 'Inappropriate Content',
      description: 'Explicit, offensive, or inappropriate photos or messages',
      category: 'inappropriate'
    },
    {
      id: 'spam',
      label: 'Spam or Scam',
      description: 'Promotional content, fake profiles, or suspicious behavior',
      category: 'spam'
    },
    {
      id: 'fake_profile',
      label: 'Fake Profile',
      description: 'Using fake photos, impersonating someone, or false information',
      category: 'fake'
    },
    {
      id: 'harassment',
      label: 'Harassment',
      description: 'Bullying, threats, or unwanted persistent contact',
      category: 'harassment'
    },
    {
      id: 'underage',
      label: 'Underage User',
      description: 'User appears to be under 18 years old',
      category: 'other'
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Other safety concerns not listed above',
      category: 'other'
    }
  ];

  const safetyTips: SafetyTip[] = [
    {
      id: 'meet_public',
      title: 'Meet in Public Places',
      description: 'Always meet in well-lit, public locations for your first few dates',
      icon: MapPin
    },
    {
      id: 'share_location',
      title: 'Share Your Location',
      description: 'Let a friend or family member know where you\'re going',
      icon: Users
    },
    {
      id: 'trust_instincts',
      title: 'Trust Your Instincts',
      description: 'If something feels off, don\'t hesitate to leave or block',
      icon: AlertTriangle
    },
    {
      id: 'verify_identity',
      title: 'Verify Identity',
      description: 'Use video calls to verify the person matches their profile',
      icon: Camera
    },
    {
      id: 'personal_info',
      title: 'Protect Personal Info',
      description: 'Don\'t share sensitive information like address or financial details',
      icon: Shield
    },
    {
      id: 'report_concerns',
      title: 'Report Concerns',
      description: 'Report any suspicious or inappropriate behavior immediately',
      icon: Flag
    }
  ];

  const handleReport = async () => {
    if (!selectedReason) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      analytics.track('user_reported', {
        reason: selectedReason,
        has_description: !!reportDescription
      });

      setShowReportModal(false);
      setSelectedReason('');
      setReportDescription('');
      
      // Show success message
      // In a real app, you'd use a toast notification
      console.log('Report submitted successfully');
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const handleBlock = (userId: string) => {
    analytics.track('user_blocked', { blocked_user_id: userId });
    // In a real app, this would call the blocking service
    console.log('User blocked:', userId);
  };

  const handleVerify = () => {
    analytics.track('verification_started');
    // In a real app, this would open the verification flow
    console.log('Starting verification process');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'report', label: 'Report', icon: Flag },
    { id: 'block', label: 'Block', icon: UserX },
    { id: 'verify', label: 'Verify', icon: CheckCircle },
    { id: 'tips', label: 'Safety Tips', icon: HelpCircle }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Safety & Trust
        </h2>
        <p className="text-neutral-400 max-w-md mx-auto">
          Your safety is our priority. Use these tools to stay safe and report any concerns.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'report' | 'block' | 'verify' | 'tips')}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                activeTab === tab.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-50 text-neutral-400 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Flag className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-white">Report Issues</h3>
                </div>
                <p className="text-neutral-400 mb-4">
                  Report inappropriate behavior, fake profiles, or safety concerns.
                </p>
                <button
                  onClick={() => setActiveTab('report')}
                  className="w-full bg-red-50 text-red-700 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Report Someone
                </button>
              </div>

              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <UserX className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="font-semibold text-white">Block Users</h3>
                </div>
                <p className="text-neutral-400 mb-4">
                  Block users you don't want to interact with anymore.
                </p>
                <button
                  onClick={() => setActiveTab('block')}
                  className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Manage Blocks
                </button>
              </div>

              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-white">Verify Profile</h3>
                </div>
                <p className="text-neutral-400 mb-4">
                  Get verified to show others you're a real person.
                </p>
                <button
                  onClick={() => setActiveTab('verify')}
                  className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Get Verified
                </button>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Report a User
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Report
                    </label>
                    <div className="space-y-2">
                      {reportReasons.map((reason) => (
                        <label
                          key={reason.id}
                          className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="reportReason"
                            value={reason.id}
                            checked={selectedReason === reason.id}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-white">{reason.label}</div>
                            <div className="text-sm text-neutral-400">{reason.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Please provide any additional context about the issue..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleReport}
                      disabled={!selectedReason}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Report
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReason('');
                        setReportDescription('');
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'block' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Blocked Users
                </h3>
                
                <div className="text-center py-8 text-gray-500">
                  <UserX className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No blocked users yet</p>
                  <p className="text-sm">When you block someone, they won't be able to see your profile or contact you.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verify' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Verify Your Profile
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    Get a verification badge to show others you're a real person. This helps build trust and increases your matches.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-white">Take a Selfie</h4>
                      <p className="text-sm text-neutral-400">We'll compare it to your profile photos</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-white">Get Verified</h4>
                      <p className="text-sm text-neutral-400">Receive your verification badge</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleVerify}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start Verification
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {safetyTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">{tip.title}</h3>
                        <p className="text-neutral-400 text-sm">{tip.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SafetyFeatures; 