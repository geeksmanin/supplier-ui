import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

export type DirtyGuardCheck = () => boolean;

interface DirtyGuardEntry {
  path: string;
  isDirty: DirtyGuardCheck;
  message?: string;
}

const dirtyGuardRegistry = new Map<string, DirtyGuardEntry>();

/**
 * Normalize a route/tab path so query strings and hash prefixes match consistently.
 */
function normalizeGuardPath(path: string): string {
  const withoutHash = path.replace(/^#/, '');
  const [pathname] = withoutHash.split('?');
  return pathname || '/';
}

/**
 * Register a tab/form dirty predicate in the global Layout tab-close guard registry.
 * Returns an unregister cleanup function.
 */
export function registerTabDirtyGuard(
  id: string,
  path: string,
  isDirty: DirtyGuardCheck,
  message?: string
): () => void {
  dirtyGuardRegistry.set(id, {
    path: normalizeGuardPath(path),
    isDirty,
    message,
  });
  return () => {
    dirtyGuardRegistry.delete(id);
  };
}

/**
 * Check whether a specific tab path currently has an active dirty form guard.
 */
export function hasDirtyTabGuard(path: string): { dirty: boolean; message?: string } {
  const target = normalizeGuardPath(path);
  for (const entry of dirtyGuardRegistry.values()) {
    if (entry.path === target && entry.isDirty()) {
      return { dirty: true, message: entry.message };
    }
  }
  return { dirty: false };
}

/**
 * Check whether any of the provided tab paths (or any registered guard) is currently dirty.
 */
export function checkDirtyTabs(paths?: string[]): { dirty: boolean; message?: string } {
  const normalizedTargets = paths ? new Set(paths.map(normalizeGuardPath)) : null;
  for (const entry of dirtyGuardRegistry.values()) {
    if (normalizedTargets && !normalizedTargets.has(entry.path)) {
      continue;
    }
    if (entry.isDirty()) {
      return { dirty: true, message: entry.message };
    }
  }
  return { dirty: false };
}

export interface UseUnsavedChangesGuardOptions {
  /** Whether the form currently has user-entered unsaved changes. */
  isDirty: boolean;
  /** Optional explicit route/tab path; defaults to current hash route pathname. */
  path?: string;
  /** Confirmation prompt title. */
  title?: string;
  /** Confirmation prompt message. */
  message?: string;
}

export interface UnsavedConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export interface UseUnsavedChangesGuardResult {
  /** Wrap any leave/cancel action: exits immediately when clean, prompts via ConfirmModal when dirty. */
  requestLeave: (onProceed: () => void) => void;
  /** Props spread directly into `<ConfirmModal {...confirmModalProps} />`. */
  confirmModalProps: UnsavedConfirmModalProps;
  /** Whether leave confirmation modal is currently open. */
  isConfirmOpen: boolean;
  /** Close confirmation modal without leaving. */
  cancelLeave: () => void;
  /** Confirm leaving and execute the deferred exit action. */
  confirmLeave: () => void;
}

const DEFAULT_TITLE = 'Discard unsaved changes?';
const DEFAULT_MESSAGE = 'You have unsaved changes. Are you sure you want to leave without saving?';

function getCurrentHashPath(): string {
  if (typeof window === 'undefined') return '/';
  const raw = window.location.hash ? window.location.hash.slice(1) : window.location.pathname;
  return normalizeGuardPath(raw || '/');
}

/**
 * Shared dirty-only exit guard hook for forms and fast vouchers.
 * - Registers with Layout's tab-close dirty guard registry so closing tabs prompts only when dirty.
 * - Attaches browser `beforeunload` warning only while `isDirty` is true.
 * - Provides `requestLeave(onProceed)` + `confirmModalProps` for non-blocking ConfirmModal UX.
 */
export function useUnsavedChangesGuard(
  options: UseUnsavedChangesGuardOptions
): UseUnsavedChangesGuardResult {
  const {
    isDirty,
    path,
    title = DEFAULT_TITLE,
    message = DEFAULT_MESSAGE,
  } = options;

  const guardId = useId();
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  const pendingLeaveRef = useRef<(() => void) | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const resolvedPath = path ? normalizeGuardPath(path) : getCurrentHashPath();

  useEffect(() => {
    return registerTabDirtyGuard(
      guardId,
      resolvedPath,
      () => isDirtyRef.current,
      message
    );
  }, [guardId, resolvedPath, message]);

  useEffect(() => {
    if (!isDirty || typeof window === 'undefined') return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const cancelLeave = useCallback(() => {
    pendingLeaveRef.current = null;
    setIsConfirmOpen(false);
  }, []);

  const confirmLeave = useCallback(() => {
    const action = pendingLeaveRef.current;
    pendingLeaveRef.current = null;
    setIsConfirmOpen(false);
    if (action) {
      action();
    }
  }, []);

  const requestLeave = useCallback((onProceed: () => void) => {
    if (!isDirtyRef.current) {
      onProceed();
      return;
    }
    pendingLeaveRef.current = onProceed;
    setIsConfirmOpen(true);
  }, []);

  const confirmModalProps = useMemo<UnsavedConfirmModalProps>(
    () => ({
      isOpen: isConfirmOpen,
      title,
      message,
      confirmText: 'Leave Without Saving',
      cancelText: 'Stay',
      variant: 'danger',
      onConfirm: confirmLeave,
      onCancel: cancelLeave,
    }),
    [isConfirmOpen, title, message, confirmLeave, cancelLeave]
  );

  return {
    requestLeave,
    confirmModalProps,
    isConfirmOpen,
    cancelLeave,
    confirmLeave,
  };
}
