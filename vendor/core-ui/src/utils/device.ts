export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i.test(ua.toLowerCase());
};
