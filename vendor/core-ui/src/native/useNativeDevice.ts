import { useEffect, useCallback } from 'react';
import { getCapacitor, isNativePlatform, getNativePlatform } from './usePushNotifications';

export interface UseNativeDeviceOptions {
  statusBarColor?: string;
  onBackPressed?: () => boolean | void; // return true to prevent default back behavior
}

export const useNativeDevice = (options?: UseNativeDeviceOptions) => {
  const { statusBarColor = '#ffffff', onBackPressed } = options || {};

  // 1. Android Hardware Back Button Handling
  useEffect(() => {
    if (!isNativePlatform() || getNativePlatform() !== 'android') return;

    const cap = getCapacitor();
    const App = cap?.Plugins?.App;
    if (!App) return;

    const backListener = App.addListener('backButton', (data: { canGoBack: boolean }) => {
      // 1. Check custom handler
      if (onBackPressed) {
        const handled = onBackPressed();
        if (handled === true) return;
      }

      // 2. Check if any open modal / drawer exists in DOM
      const activeModal = document.querySelector('.modal-overlay, [role="dialog"], .ant-modal, .chakra-modal__content');
      if (activeModal) {
        const closeBtn = activeModal.querySelector('button[aria-label="Close"], button.modal-close, button.close-button') as HTMLButtonElement;
        if (closeBtn) {
          closeBtn.click();
          return;
        }
      }

      // 3. Fallback to standard browser history back
      if (data?.canGoBack && window.location.hash !== '#/' && window.location.hash !== '#/dashboard') {
        window.history.back();
      } else {
        // At root dashboard, exit app or minimize
        App.exitApp?.();
      }
    });

    return () => {
      backListener?.remove?.();
    };
  }, [onBackPressed]);

  // 2. Android / iOS Status Bar Coloring
  useEffect(() => {
    if (!isNativePlatform()) return;

    const cap = getCapacitor();
    const StatusBar = cap?.Plugins?.StatusBar;
    if (!StatusBar) return;

    try {
      StatusBar.setBackgroundColor({ color: statusBarColor }).catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    } catch {
      // Ignore on unsupported platforms
    }
  }, [statusBarColor]);

  const hideKeyboard = useCallback(() => {
    if (!isNativePlatform()) return;
    const cap = getCapacitor();
    cap?.Plugins?.Keyboard?.hide?.().catch?.(() => {});
  }, []);

  return {
    isNative: isNativePlatform(),
    platform: getNativePlatform(),
    hideKeyboard,
  };
};
