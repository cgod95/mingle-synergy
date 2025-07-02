import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  BarChart3, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Download,
  Trash2,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Star,
  Crown,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { subscriptionService } from '@/services/subscriptionService';
import { analytics } from '@/services/analytics';
import { notificationService } from '@/services/notificationService';
import { realtimeService } from '@/services/realtimeService';
import PremiumUpgradeModal from '@/components/ui/PremiumUpgradeModal';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';

const SettingsPage: React.FC = () => {
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(subscriptionService.getCurrentPlan());
  const [userSubscription, setUserSubscription] = useState(subscriptionService.getUserSubscription());

  useEffect(() => {
    // Load user preferences from localStorage
    const prefs = localStorage.getItem('user_preferences');
    if (prefs) {
      const preferences = JSON.parse(prefs);
      setNotificationsEnabled(preferences.notifications ?? true);
      setDarkMode(preferences.darkMode ?? false);
      setLocationSharing(preferences.locationSharing ?? true);
      setAnalyticsEnabled(preferences.analytics ?? true);
      setRealtimeEnabled(preferences.realtime ?? true);
    }

    // Track page view
    analytics.trackPageView('/settings');
  }, []);

  const savePreferences = () => {
    const preferences = {
      notifications: notificationsEnabled,
      darkMode,
      locationSharing,
      analytics: analyticsEnabled,
      realtime: realtimeEnabled
    };
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  };

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      notificationService.requestNotificationPermission();
    }
    savePreferences();
  };

  const handleAnalyticsToggle = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    if (enabled) {
      analytics.enable();
    } else {
      analytics.disable();
    }
    savePreferences();
  };

  const handleRealtimeToggle = (enabled: boolean) => {
    setRealtimeEnabled(enabled);
    if (enabled) {
      realtimeService.connect();
    } else {
      realtimeService.disconnect();
    }
    savePreferences();
  };

  const handleExportData = () => {
    const data = {
      analytics: analytics.exportData(),
      subscription: userSubscription,
      preferences: {
        notifications: notificationsEnabled,
        darkMode,
        locationSharing,
        analytics: analyticsEnabled,
        realtime: realtimeEnabled
      },
      timestamp: Date.now()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mingle-synergy-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    analytics.track('data_exported');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call your backend to delete the account
      localStorage.clear();
      window.location.href = '/';
      analytics.track('account_deleted');
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        {
          label: 'Profile Settings',
          description: 'Edit your profile information',
          action: () => window.location.href = '/profile/edit',
          icon: ChevronRight
        },
        {
          label: 'Privacy Settings',
          description: 'Control your privacy and visibility',
          action: () => window.location.href = '/privacy',
          icon: ChevronRight
        },
        {
          label: 'Verification',
          description: 'Verify your identity',
          action: () => window.location.href = '/verification',
          icon: ChevronRight
        }
      ]
    },
    {
      title: 'Subscription',
      icon: Crown,
      items: [
        {
          label: currentPlan?.name || 'Free Plan',
          description: currentPlan?.description || 'Basic features',
          action: () => setIsPremiumModalOpen(true),
          icon: currentPlan?.id === 'free' ? Star : Crown,
          badge: currentPlan?.id === 'free' ? 'Upgrade' : 'Active',
          badgeVariant: currentPlan?.id === 'free' ? 'secondary' : 'default'
        },
        {
          label: 'Billing & Payment',
          description: 'Manage your payment methods',
          action: () => window.location.href = '/billing',
          icon: CreditCard
        },
        {
          label: 'Usage Statistics',
          description: 'View your app usage',
          action: () => window.location.href = '/usage',
          icon: BarChart3
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          description: 'Receive notifications about matches and messages',
          action: () => handleNotificationToggle(!notificationsEnabled),
          icon: notificationsEnabled ? Bell : Bell,
          toggle: notificationsEnabled,
          onToggle: handleNotificationToggle
        },
        {
          label: 'Email Notifications',
          description: 'Receive email updates',
          action: () => {},
          icon: ChevronRight
        },
        {
          label: 'Sound & Vibration',
          description: 'Customize notification sounds',
          action: () => {},
          icon: ChevronRight
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Location Sharing',
          description: 'Share your location for venue discovery',
          action: () => setLocationSharing(!locationSharing),
          icon: locationSharing ? Wifi : WifiOff,
          toggle: locationSharing,
          onToggle: setLocationSharing
        },
        {
          label: 'Profile Visibility',
          description: 'Control who can see your profile',
          action: () => {},
          icon: Eye
        },
        {
          label: 'Data Collection',
          description: 'Control analytics and data collection',
          action: () => handleAnalyticsToggle(!analyticsEnabled),
          icon: analyticsEnabled ? BarChart3 : BarChart3,
          toggle: analyticsEnabled,
          onToggle: handleAnalyticsToggle
        }
      ]
    },
    {
      title: 'App Settings',
      icon: Settings,
      items: [
        {
          label: 'Dark Mode',
          description: 'Switch between light and dark themes',
          action: () => setDarkMode(!darkMode),
          icon: darkMode ? Moon : Sun,
          toggle: darkMode,
          onToggle: setDarkMode
        },
        {
          label: 'Real-time Updates',
          description: 'Enable live updates and notifications',
          action: () => handleRealtimeToggle(!realtimeEnabled),
          icon: realtimeEnabled ? Zap : Zap,
          toggle: realtimeEnabled,
          onToggle: handleRealtimeToggle
        },
        {
          label: 'Language',
          description: 'Change app language',
          action: () => {},
          icon: Globe
        }
      ]
    },
    {
      title: 'Data & Storage',
      icon: Download,
      items: [
        {
          label: 'Export Data',
          description: 'Download your data',
          action: handleExportData,
          icon: Download
        },
        {
          label: 'Clear Cache',
          description: 'Free up storage space',
          action: () => {
            localStorage.clear();
            window.location.reload();
          },
          icon: Trash2
        },
        {
          label: 'Delete Account',
          description: 'Permanently delete your account',
          action: handleDeleteAccount,
          icon: Trash2,
          danger: true
        }
      ]
    },
    {
      title: 'Support',
      icon: HelpCircle,
      items: [
        {
          label: 'Help Center',
          description: 'Get help and find answers',
          action: () => window.location.href = '/help',
          icon: HelpCircle
        },
        {
          label: 'Contact Support',
          description: 'Reach out to our support team',
          action: () => window.location.href = '/contact',
          icon: ChevronRight
        },
        {
          label: 'About',
          description: 'App version and information',
          action: () => window.location.href = '/about',
          icon: Info
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and app settings</p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingsSections.map((section, sectionIndex) => (
              <Card key={sectionIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <section.icon className="w-5 h-5 mr-2" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center flex-1">
                            <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className={`font-medium ${item.danger ? 'text-red-600' : 'text-gray-900'}`}>
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <Badge 
                                    variant={item.badgeVariant as 'default' | 'secondary' | 'destructive' | 'outline'} 
                                    className="ml-2"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            {item.toggle !== undefined ? (
                              <Switch
                                checked={item.toggle}
                                onCheckedChange={item.onToggle}
                              />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={item.action}
                                className={item.danger ? 'text-red-600 hover:text-red-700' : ''}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {itemIndex < section.items.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Logout Button */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Premium Upgrade Modal */}
        <PremiumUpgradeModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          trigger="manual"
        />
      </div>
      <BottomNav />
    </Layout>
  );
};

export default SettingsPage; 