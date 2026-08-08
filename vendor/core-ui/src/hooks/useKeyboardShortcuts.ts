import { useEffect, RefObject } from 'react';

export interface UseFormKeyboardShortcutsOptions {
  containerRef?: RefObject<HTMLElement>;
  onSave?: (e: any) => void;
  onCancel?: (e: any) => void;
  onAddLine?: () => void;
}

export interface UseListKeyboardShortcutsOptions {
  onCreateNew?: () => void;
  searchInputRef?: RefObject<HTMLInputElement>;
}

// Default settings
export const DEFAULT_SHORTCUTS = {
  saveForm: 'ctrl+s',
  cancelForm: 'escape',
  newItem: 'alt+n',
  focusSearch: '/',
  addLine: 'alt+a'
};

export function getShortcutBindings() {
  if (typeof window === 'undefined') return DEFAULT_SHORTCUTS;
  try {
    const saved = localStorage.getItem('erp_keyboard_shortcuts');
    if (saved) {
      return { ...DEFAULT_SHORTCUTS, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Failed to parse shortcuts', err);
  }
  return DEFAULT_SHORTCUTS;
}

export function matchShortcut(shortcutStr: string, e: KeyboardEvent): boolean {
  if (!shortcutStr) return false;
  const parts = shortcutStr.toLowerCase().split('+');
  
  let needsCtrl = false;
  let needsAlt = false;
  let needsShift = false;
  let needsMeta = false;
  let targetKey = '';

  for (const part of parts) {
    if (part === 'ctrl') needsCtrl = true;
    else if (part === 'alt') needsAlt = true;
    else if (part === 'shift') needsShift = true;
    else if (part === 'meta' || part === 'cmd') needsMeta = true;
    else targetKey = part;
  }

  // Treat ctrl and cmd interchangeably for better cross-platform support
  const hasControlOrMeta = e.ctrlKey || e.metaKey;
  const expectedControlOrMeta = needsCtrl || needsMeta;

  if (expectedControlOrMeta && !hasControlOrMeta) return false;
  if (!expectedControlOrMeta && hasControlOrMeta) return false;
  
  if (needsAlt && !e.altKey) return false;
  if (!needsAlt && e.altKey) return false;

  if (needsShift && !e.shiftKey) return false;
  if (!needsShift && e.shiftKey) return false;

  if (!e || !e.key) return false;
  const pressedKey = e.key === ' ' ? 'space' : e.key.toLowerCase();
  return pressedKey === targetKey;
}

export function useFormKeyboardShortcuts({
  containerRef,
  onSave,
  onCancel,
  onAddLine
}: UseFormKeyboardShortcutsOptions) {
  // Focus first editable input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const container = containerRef?.current || document;
      const selector = 'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button.select-trigger, .select-trigger';
      const inputs = container.querySelectorAll(selector);
      let firstInput: HTMLElement | null = null;
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i] as HTMLElement;
        if (!input.closest('.desktop-search-container')) {
          firstInput = input;
          break;
        }
      }
      if (firstInput) {
        firstInput.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [containerRef]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept events while a Select dropdown is open
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.closest('[data-select-dropdown]') ||
        activeEl.closest('[data-select-container]')
      )) return;

      const bindings = getShortcutBindings();

      if (onSave && matchShortcut(bindings.saveForm, e)) {
        e.preventDefault();
        onSave(e);
      }
      if (onCancel && matchShortcut(bindings.cancelForm, e)) {
        e.preventDefault();
        onCancel(e);
      }
      if (onAddLine && matchShortcut(bindings.addLine, e)) {
        e.preventDefault();
        onAddLine();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onCancel, onAddLine]);
}

export function useListKeyboardShortcuts({
  onCreateNew,
  searchInputRef
}: UseListKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const bindings = getShortcutBindings();

      // Create new
      if (onCreateNew && matchShortcut(bindings.newItem, e)) {
        e.preventDefault();
        onCreateNew();
      }

      // Focus search box
      if (matchShortcut(bindings.focusSearch, e)) {
        const active = document.activeElement;
        const isInput = active && (
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.getAttribute('contenteditable') === 'true'
        );
        
        if (!isInput) {
          const searchInput = (searchInputRef?.current || document.querySelector('input[placeholder*="Search" i], input[type="search"]')) as HTMLElement;
          if (searchInput) {
            e.preventDefault();
            searchInput.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCreateNew, searchInputRef]);
}
