import { useEffect } from 'react';

export interface UseMobileBottomNavOptions {
  hidden?: boolean;
}

/**
 * Hook to dynamically control mobile bottom navigation visibility from any child page/component.
 * When component unmounts, it automatically restores bottom nav visibility.
 */
export function useMobileBottomNav(options: UseMobileBottomNavOptions = { hidden: false }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('set_mobile_bottom_nav', {
          detail: { hidden: Boolean(options.hidden) },
        })
      );
    }

    return () => {
      if (typeof window !== 'undefined' && options.hidden) {
        window.dispatchEvent(
          new CustomEvent('set_mobile_bottom_nav', {
            detail: { hidden: false },
          })
        );
      }
    };
  }, [options.hidden]);
}

/**
 * Utility function to imperatively show or hide the mobile bottom navigation bar.
 */
export function setMobileBottomNavVisibility(hidden: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('set_mobile_bottom_nav', {
        detail: { hidden },
      })
    );
  }
}
