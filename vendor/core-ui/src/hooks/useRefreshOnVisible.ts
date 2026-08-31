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

  const maybeRefresh = useCallback((source: string) => {
    const now = Date.now();
    const elapsed = now - lastRefreshRef.current;
    if (elapsed >= minIntervalMs) {
      console.debug(`[useRefreshOnVisible] ✅ refresh FIRED via "${source}" (elapsed ${elapsed}ms)`);
      lastRefreshRef.current = now;
      onRefreshRef.current();
    } else {
      console.debug(`[useRefreshOnVisible] ⏳ refresh SKIPPED via "${source}" (elapsed ${elapsed}ms < ${minIntervalMs}ms interval)`);
    }
  }, [minIntervalMs]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        maybeRefresh('visibilitychange');
      }
    };

    const handleFocus = () => {
      maybeRefresh('window:focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [maybeRefresh]);
};
