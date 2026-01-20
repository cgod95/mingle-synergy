/**
 * Capacitor iOS initialization
 * Handles status bar, keyboard, and platform-specific setup
 */

import { Capacitor } from '@capacitor/core';

// Only import Capacitor plugins when running natively
let StatusBar: any = null;
let Keyboard: any = null;
let SplashScreen: any = null;

export const isNativePlatform = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isAndroid = Capacitor.getPlatform() === 'android';

/**
 * Initialize Capacitor plugins for native platforms
 */
export async function initCapacitor() {
  if (!isNativePlatform) return;

  try {
    // Dynamic imports for native-only plugins
    if (isIOS || isAndroid) {
      const statusBarModule = await import('@capacitor/status-bar');
      StatusBar = statusBarModule.StatusBar;
      
      const keyboardModule = await import('@capacitor/keyboard');
      Keyboard = keyboardModule.Keyboard;
      
      const splashModule = await import('@capacitor/splash-screen');
      SplashScreen = splashModule.SplashScreen;
    }

    // Configure status bar for iOS
    if (StatusBar && isIOS) {
      await StatusBar.setStyle({ style: 'DARK' }); // Light text on dark background
      await StatusBar.setBackgroundColor({ color: '#171717' }); // neutral-900
    }

    // Configure keyboard behavior
    if (Keyboard) {
      // iOS: Adjust scroll when keyboard appears
      Keyboard.addListener('keyboardWillShow', (info: { keyboardHeight: number }) => {
        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
        document.body.classList.add('keyboard-visible');
      });

      Keyboard.addListener('keyboardWillHide', () => {
        document.documentElement.style.setProperty('--keyboard-height', '0px');
        document.body.classList.remove('keyboard-visible');
      });

      // Set keyboard accessory bar to auto
      if (isIOS) {
        Keyboard.setAccessoryBarVisible({ isVisible: true });
        Keyboard.setScroll({ isDisabled: false });
      }
    }

    // Hide splash screen after app is ready
    if (SplashScreen) {
      await SplashScreen.hide({ fadeOutDuration: 300 });
    }

    console.log('✅ Capacitor initialized for', Capacitor.getPlatform());
  } catch (error) {
    console.warn('Capacitor initialization error:', error);
  }
}

/**
 * Check if running in Capacitor native context
 */
export function isCapacitor(): boolean {
  return isNativePlatform;
}

/**
 * Get safe area insets (useful for programmatic positioning)
 */
export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
  };
}
