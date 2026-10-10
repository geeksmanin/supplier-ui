// Safely resolve Capacitor from window / global
export const getCapacitor = () => {
  if (typeof window !== 'undefined') {
    if ((window as any).Capacitor) return (window as any).Capacitor;
  }
  return null;
};

// Wait for Capacitor bridge to inject on native platforms
export const waitForCapacitor = async (maxWaitMs = 2000): Promise<any> => {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const cap = getCapacitor();
    if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      return cap;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return getCapacitor();
};

export const isNativePlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cap = getCapacitor();
  if (cap && typeof cap.isNativePlatform === 'function') {
    return cap.isNativePlatform();
  }
  if (cap && typeof cap.getPlatform === 'function') {
    return cap.getPlatform() !== 'web';
  }
  // Check Capacitor/Cordova custom schemes
  if (
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'ionic:' ||
    window.location.protocol === 'file:'
  ) {
    return true;
  }
  // Check User-Agent for Capacitor, Android WebView (wv), or native wrapper
  const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || '';
  if (/Capacitor/i.test(ua)) return true;
  if (/Android/i.test(ua) && /wv/i.test(ua)) return true;
  if (/Android/i.test(ua) && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return true;
  }
  return false;
};

export const getNativePlatform = (): 'android' | 'ios' | 'web' => {
  const cap = getCapacitor();
  if (cap && typeof cap.getPlatform === 'function') {
    const p = cap.getPlatform();
    if (p === 'android' || p === 'ios') return p;
  }
  return 'web';
};
