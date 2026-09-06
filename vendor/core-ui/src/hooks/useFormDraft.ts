import React, { useEffect, useState, useRef, useCallback } from 'react';
import { saveFormDraft, getFormDraft, clearFormDraft } from '../utils/draftStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseFormDraftOptions<T> {
  /** Unique key identifying the form draft in IndexedDB (e.g. 'supplier-product-new') */
  formKey: string;
  /** Current live form data snapshot — watched for auto-save */
  formData: T;
  /** When true (edit mode), draft features are fully disabled */
  isEdit: boolean;
  /** Default: true. Set false to temporarily pause auto-save without unmounting */
  enabled?: boolean;
  /** Called when the user clicks "Restore Draft" in the banner */
  onRestore: (draftData: T) => void;
  /** Called after the form is fully reset to clear the IndexedDB draft too.
   *  Provided so the consumer can call clearDraft() after resetting local state. */
  onClear?: () => void;
}

export interface UseFormDraftReturn {
  /** True when a stored draft was found on mount and has not been dismissed */
  hasDraft: boolean;
  /** Human-readable time when the draft was last saved, e.g. "3:42:07 PM" */
  draftTime: string | null;
  /** User clicked "Restore Draft" — calls onRestore() and hides banner */
  handleRestoreDraft: () => void;
  /** User clicked "Dismiss" — hides banner without restoring or deleting draft */
  handleDismissDraft: () => void;
  /** Wipe draft from IndexedDB and hide banner (used by Clear Form and on save success) */
  handleClearDraft: () => Promise<void>;
  /** Wipe draft from IndexedDB, dispatch close_tab event, and navigate back */
  discardAndCloseTab: (options?: string | { navigateBack?: () => void | Promise<void>; path?: string; destination?: string }) => Promise<void>;

  // ── Legacy API aliases (kept for backward compat with contacts-ui, etc.) ──
  /** @deprecated Use hasDraft instead */
  draftRestored: boolean;
  /** @deprecated Use handleClearDraft instead */
  discardDraft: () => Promise<void>;
  /** @deprecated Use handleClearDraft instead */
  clearSavedDraft: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFormDraft<T extends Record<string, any>>({
  formKey,
  formData,
  isEdit,
  enabled = true,
  onRestore,
  onClear,
}: UseFormDraftOptions<T>): UseFormDraftReturn {
  const [hasDraft, setHasDraft] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<T | null>(null);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  // Prevent auto-save from firing on the very first render
  const isInitialMount = useRef(true);
  // Prevent triggering auto-save immediately after restoring draft
  const skipNextSave = useRef(false);

  // ── Detect draft on mount (create mode only) ──────────────────────────────
  useEffect(() => {
    if (!enabled || isEdit) return;
    getFormDraft<T>(formKey).then(saved => {
      if (saved?.data) {
        setPendingDraft(saved.data);
        setHasDraft(true);
        setDraftTime(new Date(saved.updatedAt).toLocaleTimeString());
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, isEdit, enabled]);

  // ── Debounced auto-save (500ms, create mode only) ─────────────────────────
  useEffect(() => {
    if (!enabled || isEdit) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveFormDraft(formKey, formData);
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, formData, isEdit, enabled]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleRestoreDraft = useCallback(() => {
    if (pendingDraft) {
      skipNextSave.current = true;
      onRestore(pendingDraft);
    }
    setHasDraft(false);
    setPendingDraft(null);
  }, [pendingDraft, onRestore]);

  const handleDismissDraft = useCallback(() => {
    // Hide banner — do NOT delete draft so user can still refresh and try again
    setHasDraft(false);
    setPendingDraft(null);
  }, []);

  const handleClearDraft = useCallback(async () => {
    await clearFormDraft(formKey);
    setHasDraft(false);
    setPendingDraft(null);
    if (onClear) onClear();
  }, [formKey, onClear]);

  const discardAndCloseTab = useCallback(async (options?: string | { navigateBack?: () => void | Promise<void>; path?: string; destination?: string }) => {
    await handleClearDraft();
    let targetPath = typeof options === 'string' ? options : options?.path;
    const navBack = typeof options === 'object' ? options?.navigateBack : undefined;
    const destination = typeof options === 'object' ? options?.destination : undefined;

    // Fallback if targetPath is missing or '/' (common in HashRouter environments)
    if (!targetPath || targetPath === '/') {
      if (typeof window !== 'undefined' && window.location.hash) {
        targetPath = window.location.hash.replace(/^#/, '').split('?')[0];
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('close_tab', {
        detail: {
          path: targetPath,
          destination: destination
        }
      }));
    }
    if (navBack && !destination) {
      navBack();
    }
  }, [handleClearDraft]);

  return {
    hasDraft,
    draftTime,
    handleRestoreDraft,
    handleDismissDraft,
    handleClearDraft,
    discardAndCloseTab,
    // Legacy aliases
    draftRestored: hasDraft,
    discardDraft: handleClearDraft,
    clearSavedDraft: handleClearDraft,
  };
}

export const discardFormAndCloseTab = async (options?: {
  clearDraft?: () => Promise<void> | void;
  navigateBack?: () => void;
  path?: string;
}) => {
  if (options?.clearDraft) {
    try {
      await options.clearDraft();
    } catch (_) {}
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('close_tab', {
      detail: { path: options?.path }
    }));
  }
  if (options?.navigateBack) {
    options.navigateBack();
  }
};

// ─── DraftBanner Component ────────────────────────────────────────────────────
// Defined in DraftBanner.tsx (requires JSX — cannot live in a .ts file)
export { DraftBanner } from '../components/DraftBanner';
export type { DraftBannerProps } from '../components/DraftBanner';
