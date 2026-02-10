import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to detect iOS keyboard height and update CSS variable + body class.
 * Uses Capacitor Keyboard plugin on native, visualViewport API on web.
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const updateHeight = useCallback((height: number) => {
    setKeyboardHeight(height);
    document.documentElement.style.setProperty('--keyboard-height', `${height}px`);
    if (height > 0) {
      document.body.classList.add('keyboard-visible');
    } else {
      document.body.classList.remove('keyboard-visible');
    }
  }, []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (Capacitor.isNativePlatform()) {
      // Native: use Capacitor Keyboard plugin
      let showListener: any;
      let hideListener: any;
      
      import('@capacitor/keyboard').then(({ Keyboard }) => {
        showListener = Keyboard.addListener('keyboardWillShow', (info) => {
          updateHeight(info.keyboardHeight);
        });
        hideListener = Keyboard.addListener('keyboardWillHide', () => {
          updateHeight(0);
        });
      }).catch(() => {
        // Keyboard plugin not available, fall through to web fallback
        setupWebFallback();
      });

      cleanup = () => {
        if (showListener) showListener.remove?.();
        if (hideListener) hideListener.remove?.();
      };
    } else {
      setupWebFallback();
    }

    function setupWebFallback() {
      const vv = window.visualViewport;
      if (!vv) return;

      const onResize = () => {
        // On iOS Safari, when keyboard opens, visualViewport.height shrinks
        const kbHeight = Math.max(0, window.innerHeight - vv.height);
        // Only treat as keyboard if height difference is significant (> 100px)
        updateHeight(kbHeight > 100 ? kbHeight : 0);
      };

      vv.addEventListener('resize', onResize);
      vv.addEventListener('scroll', onResize);
      cleanup = () => {
        vv.removeEventListener('resize', onResize);
        vv.removeEventListener('scroll', onResize);
      };
    }

    return () => {
      cleanup?.();
      // Reset on unmount
      updateHeight(0);
    };
  }, [updateHeight]);

  return keyboardHeight;
}
