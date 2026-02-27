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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ListRow } from '@/components/ui/ListRow';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// These services are loaded lazily to prevent module-level crashes
let subscriptionService: any = null;
let analyticsService: any = null;
let notificationSvc: any = null;
let realtimeSvc: any = null;
import PremiumUpgradeModal from '@/components/ui/PremiumUpgradeModal';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
    const loadServices = async () => {
      try {
        const svcModule = await import('@/services');
        subscriptionService = svcModule.subscriptionService ?? null;
      } catch { /* non-critical */ }
      try {
        const analyticsModule = await import('@/services/analytics');
        analyticsService = analyticsModule.analytics ?? null;
      } catch { /* non-critical */ }
      try {
        const notifModule = await import('@/services/notificationService');
        notificationSvc = notifModule.notificationService ?? null;
      } catch { /* non-critical */ }
      try {
        const rtModule = await import('@/services/realtimeService');
        realtimeSvc = rtModule.realtimeService ?? null;
      } catch { /* non-critical */ }
    };
    loadServices();
  }, []);

  useEffect(() => {
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

    try {
      if (analyticsService && typeof analyticsService.trackPageView === 'function') {
        analyticsService.trackPageView('/settings');
      }
    } catch { /* non-critical */ }
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
    if (enabled && notificationSvc && typeof notificationSvc.requestPermission === 'function') {
      try {
        await notificationSvc.requestPermission();
      } catch { /* non-critical */ }
    }
    savePreferences();
  };

  const handleAnalyticsToggle = (enabled: boolean) => {
    setAnalyticsEnabled(enabled);
    // Analytics service handles enable/disable internally via config
    // Just track the preference change
    try {
      if (analyticsService && typeof analyticsService.track === 'function') {
        analyticsService.track(enabled ? 'analytics_enabled' : 'analytics_disabled');
      }
    } catch { /* non-critical */ }
    savePreferences();
  };

  const handleRealtimeToggle = (enabled: boolean) => {
    setRealtimeEnabled(enabled);
    try {
      if (enabled && realtimeSvc && typeof realtimeSvc.connect === 'function') {
        realtimeSvc.connect();
      } else if (!enabled && realtimeSvc && typeof realtimeSvc.disconnect === 'function') {
        realtimeSvc.disconnect();
      }
    } catch { /* non-critical */ }
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

      if (analyticsService && typeof analyticsService.track === 'function') {
        analyticsService.track('data_exported');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: "Failed to export data",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    if (!currentUser?.uid) {
      toast({ title: "Not signed in", description: "Please sign in to delete your account.", variant: "destructive" });
      return;
    }
    try {
      const { userService, authService } = await import('@/services');
      if (analyticsService && typeof analyticsService.track === 'function') {
        analyticsService.track('account_deleted');
      }
      await userService.deleteUser(currentUser.uid);
      await authService.deleteUser();
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
      const msg = error instanceof Error ? error.message : 'Please try again.';
      toast({
        title: "Failed to delete account",
        description: msg.includes('re-auth') || msg.includes('requires-recent-login')
          ? "For security, please sign out and sign back in, then try again."
          : "Please try again.",
        variant: "destructive",
      });
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
          label: 'How It Works',
          description: 'Learn how Mingle works',
          action: () => navigate('/about-mingle'),
          icon: Info
        },
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
    <div className="max-w-lg mx-auto">
          <PageHeader
            title="Settings"
            subtitle="Manage your account preferences and app settings"
            backTo="/profile"
            className="mb-6"
          />

          {/* Settings Sections */}
          <div className="space-y-4">
            {settingsSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <Card className="bg-neutral-800 shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className="bg-gradient-to-r from-violet-500/10 via-violet-500/10 to-pink-500/10 border-b border-neutral-700">
                    <CardTitle className="flex items-center text-heading-3">
                      <section.icon className="w-5 h-5 mr-2 text-violet-400" />
                      <span className="text-violet-400 font-semibold">
                        {section.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => {
                        const hasToggle = 'toggle' in item && item.toggle !== undefined && 'onToggle' in item && item.onToggle;
                        const hasBadge = 'badge' in item && item.badge;
                        const isDanger = 'danger' in item && item.danger;
                        return (
                          <div key={itemIndex}>
                            <ListRow
                              leading={
                                <div className={`p-2 rounded-lg ${
                                  isDanger ? 'bg-red-900/50 text-red-400' : 'bg-violet-900/50 text-violet-400'
                                }`}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                              }
                              title={item.label}
                              subtitle={item.description}
                              trailing={
                                <div className="flex items-center gap-2">
                                  {hasBadge && (
                                    <Badge
                                      variant={('badgeVariant' in item && item.badgeVariant) as 'default' | 'secondary' | 'destructive' | 'outline'}
                                      className={'badgeVariant' in item && item.badgeVariant === 'default' ? 'bg-violet-600 text-white border-0' : ''}
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                  {hasToggle ? (
                                    <Switch
                                      checked={item.toggle}
                                      onCheckedChange={item.onToggle}
                                      aria-label={item.label}
                                    />
                                  ) : (
                                    <ChevronRight className={`w-5 h-5 ${isDanger ? 'text-red-400' : 'text-violet-400'}`} />
                                  )}
                                </div>
                              }
                              onPress={hasToggle ? () => item.onToggle?.(!item.toggle) : item.action}
                              destructive={isDanger}
                            />
                            {itemIndex < section.items.length - 1 && (
                              <Separator className="my-1 bg-neutral-700" />
                            )}
                          </div>
                        );
                      })}
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
                      console.error('Failed to sign out:', error);
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

          {/* Premium Upgrade Modal */}
          <PremiumUpgradeModal
            isOpen={isPremiumModalOpen}
            onClose={() => setIsPremiumModalOpen(false)}
            trigger="manual"
          />
    </div>
  );
};

export default SettingsPage; 