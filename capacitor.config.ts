import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mingleapp.app',
  appName: 'Mingle',
  webDir: 'dist',
  
  // iOS-specific configuration
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true,
    backgroundColor: '#171717',
  },
  
  // Prevent white flash behind WebView
  backgroundColor: '#171717',
  
  // Plugin configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#171717',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#171717',
    },
    Haptics: {
      // Haptics enabled by default
    },
  },
  
  server: {
    cleartext: true,
    hostname: 'app.mingleapp.com',
    iosScheme: 'https',
  },
};

export default config;
