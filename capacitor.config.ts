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
      resize: 'native',
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
  
  // Server configuration (for development)
  server: {
    // Enable cleartext for local development
    cleartext: true,
  },
};

export default config;
