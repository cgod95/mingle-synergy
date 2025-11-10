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
import { subscriptionService } from '@/services';
import { analytics } from '@/services/analytics';
import { notificationService } from '@/services/notificationService';
import { realtimeService } from '@/services/realtimeService';
import PremiumUpgradeModal from '@/components/ui/PremiumUpgradeModal';
import Layout from '@/components/Layout';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isVisible, setIsVisible] = useState(true);

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
      setIsVisible(preferences.isVisible ?? true);
      setEmailNotificationsEnabled(preferences.emailNotifications ?? true);
      setSoundEnabled(preferences.sound ?? true);
      setVibrationEnabled(preferences.vibration ?? true);
      setLanguage(preferences.language ?? 'en');
    }

    // Load subscription info
    const loadSubscription = async () => {
      try {
        if (currentUser?.uid) {
          // Try getUserSubscription if it exists
          if ('getUserSubscription' in subscriptionService && typeof subscriptionService.getUserSubscription === 'function') {
            const sub = subscriptionService.getUserSubscription(currentUser.uid);
            setUserSubscription(sub);
            if (sub) {
              // Try to get plan details
              if ('getTier' in subscriptionService && typeof subscriptionService.getTier === 'function') {
                const tier = subscriptionService.getTier(sub.tierId);
                setCurrentPlan(tier || { id: 'free', name: 'Free' });
              } else if ('getPlans' in subscriptionService && typeof subscriptionService.getPlans === 'function') {
                const plans = await subscriptionService.getPlans();
                const plan = plans.find((p: any) => p.id === sub.tierId);
                setCurrentPlan(plan || { id: 'free', name: 'Free' });
              } else {
                setCurrentPlan({ id: 'free', name: 'Free' });
              }
            } else {
              setCurrentPlan({ id: 'free', name: 'Free' });
            }
          } else {
            setCurrentPlan({ id: 'free', name: 'Free' });
          }
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
        setCurrentPlan({ id: 'free', name: 'Free' });
      }
    };
    loadSubscription();

    // Track page view
    analytics.trackPageView('/settings');
  }, [currentUser]);

  const savePreferences = () => {
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
          await userService.updateUserProfile(currentUser.uid, { isVisible });
        }
      } catch (error) {
        console.error('Error syncing visibility:', error);
      }
    };
    syncVisibility();
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
          description: 'Share your location for venue discovery',
          action: () => setLocationSharing(!locationSharing),
          icon: locationSharing ? Wifi : WifiOff,
          toggle: locationSharing,
          onToggle: setLocationSharing
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
                onClick={async () => {
                  await signOut();
                  navigate('/');
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