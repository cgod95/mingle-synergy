import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mingleapp.app',
  appName: 'Mingle',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0f0a1a', // Dark theme background
    preferredContentMode: 'mobile',
    scrollEnabled: true,
  },
  server: {
    // Allow loading from localhost in development
    allowNavigation: ['*.firebaseapp.com', '*.googleapis.com', '*.firebaseio.com'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f0a1a',
      showSpinner: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0f0a1a',
    },
  },
};

export default config;
