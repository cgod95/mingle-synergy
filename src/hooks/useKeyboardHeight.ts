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
      // Native: use Capacitor Keyboard plugin. Listeners can be plugin handles
      // or PluginListenerHandle promises depending on version - normalize.
      type ListenerHandle = { remove: () => Promise<void> };
      let showListener: ListenerHandle | Promise<ListenerHandle> | undefined;
      let hideListener: ListenerHandle | Promise<ListenerHandle> | undefined;

      import('@capacitor/keyboard').then(({ Keyboard }) => {
        showListener = Keyboard.addListener('keyboardWillShow', (info) => {
          updateHeight(info.keyboardHeight);
        });
        hideListener = Keyboard.addListener('keyboardWillHide', () => {
          updateHeight(0);
        });
      }).catch(() => {
        setupWebFallback();
      });

      cleanup = () => {
        const removeHandle = (h: typeof showListener) => {
          if (!h) return;
          if (h instanceof Promise) {
            h.then((handle) => handle.remove()).catch(() => undefined);
          } else {
            h.remove();
          }
        };
        removeHandle(showListener);
        removeHandle(hideListener);
      };
    } else {
      setupWebFallback();
    }

    function setupWebFallback() {
      const vv = window.visualViewport;
      if (!vv) return;

      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      const DEBOUNCE_MS = 80;

      const onResize = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          // On iOS Safari, when keyboard opens, visualViewport.height shrinks
          const kbHeight = Math.max(0, window.innerHeight - vv.height);
          // Lower threshold (50px) to catch smaller keyboards
          updateHeight(kbHeight > 50 ? kbHeight : 0);
        }, DEBOUNCE_MS);
      };

      vv.addEventListener('resize', onResize);
      vv.addEventListener('scroll', onResize);
      cleanup = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
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
