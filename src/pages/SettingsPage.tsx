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
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { subscriptionService } from '@/services';
import { analytics } from '@/services/analytics';
import { notificationService } from '@/services/notificationService';
import { realtimeService } from '@/services/realtimeService';
import PremiumUpgradeModal from '@/components/ui/PremiumUpgradeModal';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logError } from '@/utils/errorHandler';

const SettingsPage: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [userSubscription, setUserSubscription] = useState<{ tierId?: string } | null>(null);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Load user preferences from localStorage
    try {
      const prefs = localStorage.getItem('user_preferences');
      if (prefs) {
        const preferences = JSON.parse(prefs);
        setNotificationsEnabled(preferences.notifications ?? true);
        setDarkMode(preferences.darkMode ?? false);
        setLocationSharing(preferences.locationSharing ?? true);
        setAnalyticsEnabled(preferences.analytics ?? true);
        setRealtimeEnabled(preferences.realtime ?? true);
        setIsVisible(preferences.isVisible ?? true);
        setEmailNotificationsEnabled(preferences.emailNotifications ?? true);
        setSoundEnabled(preferences.sound ?? true);
        setVibrationEnabled(preferences.vibration ?? true);
        setLanguage(preferences.language ?? 'en');
      }
    } catch (error) {
      // Failed to load preferences - use defaults
      // Silently fail - defaults are already set
    }

    // Load subscription info
    const loadSubscription = async () => {
      try {
        if (currentUser?.uid && subscriptionService) {
          // Try getUserSubscription if it exists
          if ('getUserSubscription' in subscriptionService && typeof subscriptionService.getUserSubscription === 'function') {
            try {
              const sub = subscriptionService.getUserSubscription(currentUser.uid);
              setUserSubscription(sub);
              if (sub) {
                // Try to get plan details
                if ('getTier' in subscriptionService && typeof subscriptionService.getTier === 'function') {
                  try {
                    const tier = subscriptionService.getTier(sub.tierId);
                    setCurrentPlan(tier || { id: 'free', name: 'Free' });
                  } catch {
                    setCurrentPlan({ id: 'free', name: 'Free' });
                  }
                } else if ('getPlans' in subscriptionService && typeof subscriptionService.getPlans === 'function') {
                  try {
                    const plans = await subscriptionService.getPlans();
                    const plan = plans.find((p: { id: string }) => p.id === sub.tierId);
                    setCurrentPlan(plan || { id: 'free', name: 'Free' });
                  } catch {
                    setCurrentPlan({ id: 'free', name: 'Free' });
                  }
                } else {
                  setCurrentPlan({ id: 'free', name: 'Free' });
                }
              } else {
                setCurrentPlan({ id: 'free', name: 'Free' });
              }
            } catch {
              setCurrentPlan({ id: 'free', name: 'Free' });
            }
          } else {
            setCurrentPlan({ id: 'free', name: 'Free' });
          }
        } else {
          setCurrentPlan({ id: 'free', name: 'Free' });
        }
      } catch (error) {
        // Error loading subscription - use free plan as default
        setCurrentPlan({ id: 'free', name: 'Free' });
      }
    };
    loadSubscription();

    // Track page view
    try {
      if (analytics && typeof analytics.trackPageView === 'function') {
        analytics.trackPageView('/settings');
      }
    } catch (error) {
      // Failed to track page view - non-critical, silently fail
    }
  }, [currentUser]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const savePreferences = () => {
    try {
      const preferences = {
        notifications: notificationsEnabled,
        darkMode,
        locationSharing,
        analytics: analyticsEnabled,
        realtime: realtimeEnabled,
        isVisible,
        emailNotifications: emailNotificationsEnabled,
        sound: soundEnabled,
        vibration: vibrationEnabled,
        language,
      };
      localStorage.setItem('user_preferences', JSON.stringify(preferences));
      
      // Sync visibility with userService
      const syncVisibility = async () => {
        try {
          if (currentUser?.uid) {
            const { userService } = await import('@/services');
            if (userService && typeof userService.updateUserProfile === 'function') {
              await userService.updateUserProfile(currentUser.uid, { isVisible });
            }
          }
        } catch (error) {
          // Error syncing visibility - silently fail, preference still saved locally
        }
      };
      syncVisibility();
    } catch (error) {
      // Failed to save preferences - silently fail, UI still works
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled && notificationService && typeof notificationService.requestPermission === 'function') {
      try {
        await notificationService.requestPermission();
      } catch (error) {
        // Failed to request permission - user can still toggle the setting
        // Silently fail - preference is still saved
      }
    }
    savePreferences();
  };

  const handleAnalyticsToggle = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    // Analytics service handles enable/disable internally via config
    // Just track the preference change
    try {
      if (analytics && typeof analytics.track === 'function') {
        if (enabled) {
          analytics.track('analytics_enabled');
        } else {
          analytics.track('analytics_disabled');
        }
      }
    } catch (error) {
      // Failed to track analytics toggle - non-critical, silently fail
    }
    savePreferences();
  };

  const handleRealtimeToggle = (enabled: boolean) => {
    setRealtimeEnabled(enabled);
    try {
      if (enabled && realtimeService && typeof realtimeService.connect === 'function') {
        realtimeService.connect();
      } else if (!enabled && realtimeService && typeof realtimeService.disconnect === 'function') {
        realtimeService.disconnect();
      }
    } catch (error) {
      // Failed to toggle realtime - silently fail, preference still saved
    }
    savePreferences();
  };

  const handleExportData = () => {
    try {
      const data = {
        subscription: userSubscription,
        preferences: {
          notifications: notificationsEnabled,
          darkMode,
          locationSharing,
          analytics: analyticsEnabled,
          realtime: realtimeEnabled,
          isVisible,
          emailNotifications: emailNotificationsEnabled,
          sound: soundEnabled,
          vibration: vibrationEnabled,
          language
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

      if (analytics && typeof analytics.track === 'function') {
        analytics.track('data_exported');
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), {
        source: 'SettingsPage',
        action: 'exportData'
      });
      toast({
        title: "Failed to export data",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // In a real app, this would call your backend to delete the account
        if (analytics && typeof analytics.track === 'function') {
          analytics.track('account_deleted');
        }
        localStorage.clear();
        navigate('/');
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          source: 'SettingsPage',
          action: 'deleteAccount'
        });
        toast({
          title: "Failed to delete account",
          description: "Please try again.",
          variant: "destructive",
        });
      }
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
          action: () => navigate('/profile/edit'),
          icon: ChevronRight
        },
        {
          label: 'Privacy Settings',
          description: 'Control your privacy and visibility',
          action: () => navigate('/privacy'),
          icon: ChevronRight
        },
        {
          label: 'Verification',
          description: 'Verify your identity',
          action: () => navigate('/verification'),
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
          action: () => navigate('/billing'),
          icon: CreditCard
        },
        {
          label: 'Usage Statistics',
          description: 'View your app usage',
          action: () => navigate('/usage'),
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
          action: () => setEmailNotificationsEnabled(!emailNotificationsEnabled),
          icon: ChevronRight,
          toggle: emailNotificationsEnabled,
          onToggle: (enabled: boolean) => {
            setEmailNotificationsEnabled(enabled);
            savePreferences();
          }
        },
        {
          label: 'Sound & Vibration',
          description: soundEnabled ? 'Sound enabled' : 'Sound disabled',
          action: () => {
            setSoundEnabled(!soundEnabled);
            savePreferences();
          },
          icon: soundEnabled ? Bell : Bell,
          toggle: soundEnabled,
          onToggle: (enabled: boolean) => {
            setSoundEnabled(enabled);
            savePreferences();
          }
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Location Sharing',
          description: locationSharing ? 'Location access enabled' : 'Enable location to check in and see people',
          action: async () => {
            const { requestLocationPermission } = await import('@/utils/locationPermission');
            const granted = await requestLocationPermission();
            if (granted) {
              setLocationSharing(true);
              savePreferences();
            } else {
              // Show error or explanation
              toast({
                title: "Location permission required",
                description: "Please enable location access in your browser settings to check in to venues and see people nearby.",
                variant: "destructive",
              });
            }
          },
          icon: locationSharing ? Wifi : WifiOff,
          toggle: locationSharing,
          onToggle: async (enabled: boolean) => {
            if (enabled) {
              const { requestLocationPermission } = await import('@/utils/locationPermission');
              const granted = await requestLocationPermission();
              if (granted) {
                setLocationSharing(true);
                savePreferences();
              } else {
                toast({
                  title: "Location permission required",
                  description: "Please enable location access in your browser settings.",
                  variant: "destructive",
                });
              }
            } else {
              setLocationSharing(false);
              savePreferences();
            }
          }
        },
        {
          label: 'Profile Visibility',
          description: 'Control who can see your profile',
          action: () => setIsVisible(!isVisible),
          icon: isVisible ? Eye : EyeOff,
          toggle: isVisible,
          onToggle: (enabled: boolean) => {
            setIsVisible(enabled);
            savePreferences();
          }
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
          description: language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : language,
          action: () => {
            // Cycle through available languages
            const languages = ['en', 'es', 'fr'];
            const currentIndex = languages.indexOf(language);
            const nextIndex = (currentIndex + 1) % languages.length;
            setLanguage(languages[nextIndex]);
            savePreferences();
          },
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
          action: () => navigate('/help'),
          icon: HelpCircle
        },
        {
          label: 'Send Feedback',
          description: 'Share your thoughts and suggestions',
          action: () => navigate('/feedback'),
          icon: ChevronRight
        },
        {
          label: 'Contact Support',
          description: 'Reach out to our support team',
          action: () => navigate('/contact'),
          icon: ChevronRight
        },
        {
          label: 'About',
          description: 'App version and information',
          action: () => navigate('/about'),
          icon: Info
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="hover:bg-indigo-900/30 text-indigo-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-neutral-300 mt-2">Manage your account preferences and app settings</p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-4">
            {settingsSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <Card className="border-2 border-neutral-700 bg-neutral-800 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-neutral-700">
                    <CardTitle className="flex items-center text-heading-3">
                      <section.icon className="w-5 h-5 mr-2 text-indigo-400" />
                      <span className="text-indigo-400 font-semibold">
                        {section.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-indigo-900/30 transition-colors">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className={`p-2 rounded-lg mr-3 ${
                                'danger' in item && item.danger
                                  ? 'bg-red-900/50 text-red-400' 
                                  : 'bg-indigo-900/50 text-indigo-400'
                              }`}>
                                <item.icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-semibold text-base ${
                                    'danger' in item && item.danger ? 'text-red-400' : 'text-white'
                                  }`}>
                                    {item.label}
                                  </span>
                                  {'badge' in item && item.badge && (
                                    <Badge 
                                      variant={('badgeVariant' in item && item.badgeVariant) as 'default' | 'secondary' | 'destructive' | 'outline'} 
                                      className={
                                        'badgeVariant' in item && item.badgeVariant === 'default' 
                                          ? 'bg-indigo-600 text-white border-0'
                                          : ''
                                      }
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-neutral-300 mt-0.5">{item.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center ml-4">
                              {'toggle' in item && item.toggle !== undefined && 'onToggle' in item && item.onToggle ? (
                                <Switch
                                  checked={item.toggle}
                                  onCheckedChange={item.onToggle}
                                />
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={item.action}
                                  className={`${
                                    'danger' in item && item.danger
                                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' 
                                      : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30'
                                  }`}
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {itemIndex < section.items.length - 1 && (
                            <Separator className="my-1 bg-neutral-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="mt-6">
            <Card className="border border-red-700 bg-red-900/30">
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (signOut && typeof signOut === 'function') {
                        await signOut();
                      }
                      navigate('/');
                    } catch (error) {
                      // Failed to sign out - still navigate to home
                      logError(error instanceof Error ? error : new Error(String(error)), {
                        source: 'SettingsPage',
                        action: 'signOut'
                      });
                      navigate('/');
                    }
                  }}
                  className="w-full text-red-400 border-red-700 hover:bg-red-900/50 hover:border-red-600 font-semibold"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>
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