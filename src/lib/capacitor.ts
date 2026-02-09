/**
 * Capacitor iOS/Android initialization
 * Handles status bar, keyboard, splash screen, and platform-specific setup
 */

import { Capacitor } from '@capacitor/core';

export const isNativePlatform = Capacitor.isNativePlatform();
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isAndroid = Capacitor.getPlatform() === 'android';

/**
 * Initialize Capacitor plugins for native platforms
 */
export async function initCapacitor() {
  if (!isNativePlatform) return;

  try {
    // Configure status bar
    if (isIOS || isAndroid) {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Dark });
      if (isAndroid) {
        await StatusBar.setBackgroundColor({ color: '#171717' });
      }
    }

    // Configure keyboard behavior
    const { Keyboard } = await import('@capacitor/keyboard');
    
    // Handle keyboard show/hide (use both Will and Did for reliability across iOS versions)
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      document.body.classList.add('keyboard-visible');
    });

    Keyboard.addListener('keyboardDidShow', (info) => {
      // Fallback: ensure keyboard height is set even if WillShow didn't fire
      document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      document.body.classList.add('keyboard-visible');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-visible');
    });

    Keyboard.addListener('keyboardDidHide', () => {
      // Fallback: ensure keyboard height is cleared even if WillHide didn't fire
      document.documentElement.style.setProperty('--keyboard-height', '0px');
      document.body.classList.remove('keyboard-visible');
    });

    // iOS-specific keyboard settings
    if (isIOS) {
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
      await Keyboard.setScroll({ isDisabled: false });
    }

    // Hide splash screen with fade
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 300 });

    console.log('✅ Capacitor initialized for', Capacitor.getPlatform());
  } catch (error) {
    console.warn('Capacitor initialization warning:', error);
  }
}

/**
 * Check if app is running in Capacitor
 */
export function isCapacitor(): boolean {
  return isNativePlatform;
}

/**
 * Get current platform
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (isIOS) return 'ios';
  if (isAndroid) return 'android';
  return 'web';
}
