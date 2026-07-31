import { useEffect, useRef, useCallback } from 'react';

/**
 * useRefreshOnVisible
 *
 * Calls `onRefresh` whenever the user returns to this browser tab or the
 * window regains focus, but NOT on the initial mount (mount triggers are
 * already covered by the component's own useEffect(fn, [])).
 *
 * Rules:
 * - Reference data (dropdown lists, lookup tables) is always re-fetched.
 * - User-entered state (filters, search text, form fields) is NEVER touched
 *   by this hook — that's the component's own responsibility.
 * - A minimum interval of `minIntervalMs` (default 10 s) is enforced so that
 *   very rapid focus/blur cycles don't hammer the API.
 *
 * Usage:
 *   useRefreshOnVisible(() => {
 *     fetchOrganisations();
 *     fetchVariants();
 *     fetchTickets();   // data list — ok to refresh, filters stay in state
 *   });
 */
export const useRefreshOnVisible = (
  onRefresh: () => void,
  minIntervalMs = 10_000,
): void => {
  const lastRefreshRef = useRef<number>(Date.now());
  const onRefreshRef = useRef(onRefresh);

  // Keep the callback ref up to date without causing effect re-runs
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  const maybeRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshRef.current >= minIntervalMs) {
      lastRefreshRef.current = now;
      onRefreshRef.current();
    }
  }, [minIntervalMs]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        maybeRefresh();
      }
    };

    const handleFocus = () => {
      maybeRefresh();
    };

    const handleCustomTabFocus = () => {
      maybeRefresh();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('geeksman-tab-focused', handleCustomTabFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('geeksman-tab-focused', handleCustomTabFocus);
    };
  }, [maybeRefresh]);
};
