import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getAppConfig } from '../config';
import { getWorkspaceFromUrl } from '../api/client';

export interface SelectOption {
  value: string;
  label: string;
  /** optional extra data available in renderOption */
  meta?: Record<string, unknown>;
}

// ─── Async fetch config ─────────────────────────────────────────────────────
export interface SelectAsyncConfig {
  /**
   * Base URL to query.  The search term is appended as a query parameter.
   * Example: "/api/v1/products"
   */
  url: string;
  /** Query-string key for the search term.  Defaults to "search". */
  searchParam?: string;
  /** Additional static query params merged on every request. */
  params?: Record<string, string | number>;
  /**
   * Debounce delay (ms) before a network request fires.
   * Defaults to 300 ms.
   */
  debounceMs?: number;
  /**
   * Transform the raw API response into SelectOption[].
   * Called with the full response body.
   */
  transform: (data: unknown) => SelectOption[];
  /**
   * Minimum search term length before a request is sent.
   * Defaults to 0 (load immediately on open).
   */
  minSearchLength?: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────
export interface SelectProps {
  // ----- value / selection -----
  value: string | string[];
  onChange: (value: string | string[]) => void;
  /** Allow selecting multiple values. */
  multi?: boolean;

  // ----- option source (one of these is required) -----
  /** Static list of options — used when NOT in async mode. */
  options?: SelectOption[];
  /**
   * When provided, the component fetches options from the backend.
   * The `options` prop is ignored while async mode is active.
   */
  async?: SelectAsyncConfig;

  // ----- display -----
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  /** Custom renderer for each option row. */
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  /** Max dropdown height in pixels. Defaults to 260. */
  maxHeight?: number;
  /** Label shown above selected chips in multi mode. */
  noOptionsText?: string;
  /** Text shown when no search results match. */
  noMatchText?: string;
  // ----- creation -----
  /** Callback fired when the user clicks the custom create option button. */
  onCreateOption?: (searchTerm: string) => void;
  /** Custom label for the create option button. Defaults to 'Create new'. */
  createOptionText?: string | ((searchTerm: string) => string);
  /** Whether the dropdown should open automatically on mount. */
  defaultOpen?: boolean;
  /** Optional callback to refresh the options (for static list refresh buttons). */
  onRefresh?: () => void;
  /** When provided, shows a Scan button on the trigger that opens a barcode/QR scanner. */
  onScanClick?: () => void;
  /** Hide the search input inside the dropdown panel. */
  hideDropdownSearch?: boolean;
  /** Show a clear (×) button when a value is selected. */
  clearable?: boolean;
}

// ─── Spinner helper ──────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--primary, #6d28d9)"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'select-spin 0.7s linear infinite', display: 'block' }}
  >
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// keyframe injection (once)
if (typeof document !== 'undefined' && !document.getElementById('__select-keyframes__')) {
  const style = document.createElement('style');
  style.id = '__select-keyframes__';
  style.textContent = `@keyframes select-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

// ─── Component ───────────────────────────────────────────────────────────────
export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  multi = false,
  options: staticOptions = [],
  async: asyncConfig,
  placeholder = 'Select...',
  style,
  disabled = false,
  leftIcon,
  renderOption,
  maxHeight = 260,
  noOptionsText = 'No options available',
  noMatchText = 'No matches found',
  onCreateOption,
  createOptionText,
  defaultOpen = false,
  onRefresh,
  onScanClick,
  hideDropdownSearch = false,
  clearable = false,
}) => {
  const isAsync = Boolean(asyncConfig);
  const hasRefresh = isAsync || Boolean(onRefresh);

  // normalise value to always be string[]
  const selectedValues: string[] = Array.isArray(value) ? value : value ? [value] : [];

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<SelectOption[]>([]);
  const [asyncCache, setAsyncCache] = useState<Record<string, SelectOption>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Filtered options (async & local modes) ──────────────────────────────
  const displayOptions: SelectOption[] = isAsync
    ? asyncOptions
    : staticOptions.filter((opt) =>
        String(opt?.label || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Reset highlighted index when options length, search term, or dropdown state changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [displayOptions.length, searchTerm, isOpen]);

  // Scroll active option into view during keyboard navigation
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const children = container.children;
    if (highlightedIndex < children.length) {
      const child = children[highlightedIndex] as HTMLElement;
      if (!child) return;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const childTop = child.offsetTop;
      const childBottom = childTop + child.clientHeight;

      if (childTop < containerTop) {
        container.scrollTop = childTop;
      } else if (childBottom > containerBottom) {
        container.scrollTop = childBottom - container.clientHeight;
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (!isOpen) return;

    const hasCreateNew = Boolean(onCreateOption);
    const totalCount = displayOptions.length + (hasCreateNew ? 1 : 0);

    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) =>
        prev < totalCount - 1 ? prev + 1 : 0
      );
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : totalCount - 1
      );
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
        handleSelect(displayOptions[highlightedIndex].value);
        e.preventDefault();
        e.stopPropagation();
      } else if (hasCreateNew && highlightedIndex === displayOptions.length) {
        if (onCreateOption) {
          onCreateOption(searchTerm);
          setIsOpen(false);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Attach global keydown listener when dropdown is open so keyboard navigation works reliably
  useEffect(() => {
    if (!isOpen) return;

    const windowKeyDownHandler = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      // Handle keydown if active element is inside this Select container/dropdown or search input
      if (
        containerRef.current?.contains(activeEl) ||
        activeEl === searchRef.current ||
        activeEl?.closest('[data-select-dropdown]')
      ) {
        const hasCreateNew = Boolean(onCreateOption);
        const totalCount = displayOptions.length + (hasCreateNew ? 1 : 0);

        if (e.key === 'ArrowDown') {
          setHighlightedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === 'ArrowUp') {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === 'Enter') {
          setHighlightedIndex((currentHighlight) => {
            if (currentHighlight >= 0 && currentHighlight < displayOptions.length) {
              const selectedValue = displayOptions[currentHighlight].value;
              queueMicrotask(() => {
                handleSelect(selectedValue);
              });
            } else if (hasCreateNew && currentHighlight === displayOptions.length) {
              if (onCreateOption) {
                queueMicrotask(() => {
                  onCreateOption(searchTerm);
                  setIsOpen(false);
                });
              }
            }
            return currentHighlight;
          });
          e.preventDefault();
          e.stopPropagation();
        } else if (e.key === 'Escape') {
          setIsOpen(false);
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    window.addEventListener('keydown', windowKeyDownHandler, true);
    return () => window.removeEventListener('keydown', windowKeyDownHandler, true);
  }, [isOpen, displayOptions, onCreateOption, searchTerm]);

  // ── Auto close dropdown when clicking or tapping outside ──────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = Boolean(
        (target as HTMLElement).closest?.('[data-select-dropdown]')
      );

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isOpen]);

  // ── Reset state when closing ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      if (!isAsync) return;
      // cancel in-flight request
      abortController.current?.abort();
      setAsyncOptions([]);
      setIsLoading(false);
      setFetchError(null);
    } else {
      // auto-focus input on open
      if (!multi) {
        setTimeout(() => inputRef.current?.focus(), 50);
      } else {
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      // if async & minSearchLength === 0 → load immediately
      if (isAsync && (asyncConfig?.minSearchLength ?? 0) === 0) {
        fetchAsync('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Async fetch ─────────────────────────────────────────────────────────
  const fetchAsync = useCallback(
    async (term: string) => {
      if (!asyncConfig) return;
      const minLen = asyncConfig.minSearchLength ?? 0;
      if (term.length < minLen) {
        setAsyncOptions([]);
        return;
      }

      // cancel previous request
      abortController.current?.abort();
      const ctrl = new AbortController();
      abortController.current = ctrl;

      setIsLoading(true);
      setFetchError(null);

      try {
        const searchKey = asyncConfig.searchParam ?? 'search';
        const baseParams: Record<string, string | number> = {
          ...(asyncConfig.params ?? {}),
          [searchKey]: term,
        };
        const qs = new URLSearchParams(
          Object.entries(baseParams).map(([k, v]) => [k, String(v)])
        ).toString();

        // derive base URL — same source as apiClient
        const baseUrl =
          getAppConfig().apiBaseUrl ||
          (typeof window !== 'undefined' && (window as Window & { runtimeConfig?: { apiBaseUrl?: string } }).runtimeConfig?.apiBaseUrl) ||
          '';

        const fullUrl = asyncConfig.url.startsWith('http')
          ? `${asyncConfig.url}?${qs}`
          : `${baseUrl.replace(/\/$/, '')}${asyncConfig.url.startsWith('/') ? '' : '/'}${asyncConfig.url}?${qs}`;

        const resp = await fetch(fullUrl, {
          signal: ctrl.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Code': getWorkspaceFromUrl(),
            ...(localStorage.getItem('token')
              ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
              : {}),
          },
        });

        if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
        const data = await resp.json();
        const transformed = asyncConfig.transform(data) || [];
        setAsyncOptions(transformed);
        setAsyncCache((prev) => {
          const next = { ...prev };
          (transformed || []).forEach((o: SelectOption) => {
            if (o && o.value) next[o.value] = o;
          });
          return next;
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setFetchError('Failed to load options');
      } finally {
        setIsLoading(false);
      }
    },
    [asyncConfig]
  );

  // ── Debounced search handler ────────────────────────────────────────────
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (!isAsync) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const delay = asyncConfig?.debounceMs ?? 300;
    debounceTimer.current = setTimeout(() => fetchAsync(term), delay);
  };

  // ── Selection helpers ───────────────────────────────────────────────────
  const isSelected = (val: string) => selectedValues.includes(val);

  const handleSelect = (val: string) => {
    // Cache selected option if present in current display list
    const found = displayOptions.find((o) => o.value === val);
    if (found) {
      setAsyncCache((prev) => ({ ...prev, [val]: found }));
    }
    if (multi) {
      const next = isSelected(val)
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val];
      onChange(next);
    } else {
      onChange(val);
      setIsOpen(false);
    }
  };

  const removeChip = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selectedValues.filter((v) => v !== val);
    onChange(next);
  };

  // ── Resolve label for a value (from static or cached set) ──────────────
  const allKnownOptions = [...asyncOptions, ...staticOptions, ...Object.values(asyncCache)];
  const getLabel = (val: string) =>
    allKnownOptions.find((o) => o.value === val)?.label ?? val;

  // ── Trigger display text ────────────────────────────────────────────────
  const renderTrigger = () => {
    if (multi) {
      if (selectedValues.length === 0)
        return <span style={{ color: 'var(--text-secondary, #9ca3af)' }}>{placeholder}</span>;
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1 }}>
          {selectedValues.map((v) => (
            <span
              key={v}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                background: '#ede9fe',
                color: '#5b21b6',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 600,
                lineHeight: '1.4',
              }}
            >
              {getLabel(v)}
              <span
                onClick={(e) => removeChip(v, e)}
                style={{ cursor: 'pointer', lineHeight: 1, opacity: 0.7 }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
      );
    }
    const opt = staticOptions.find((o) => o.value === selectedValues[0]) ||
                asyncOptions.find((o) => o.value === selectedValues[0]) ||
                asyncCache[selectedValues[0]];
    const selectedLabel = opt?.label ?? (selectedValues[0] ? getLabel(selectedValues[0]) : '');

    return (
      <input
        ref={inputRef}
        type="text"
        value={isOpen ? searchTerm : selectedLabel}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => {
          if (!disabled) {
            setIsFocused(true);
            setIsOpen(true);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled && !isOpen) setIsOpen(true);
        }}
        placeholder={isOpen && selectedLabel ? selectedLabel : placeholder}
        disabled={disabled}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          width: '100%',
          fontSize: 'inherit',
          color: !selectedValues[0] && !isOpen ? 'var(--text-secondary, #9ca3af)' : 'var(--text-primary, #111827)',
          fontFamily: 'inherit',
          padding: 0,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      />
    );
  };

  // ── Styles ──────────────────────────────────────────────────────────────
  const customHeight = style?.height ? (typeof style.height === 'number' ? `${style.height}px` : style.height) : undefined;
  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: customHeight ? '0.2rem 0.55rem' : '0.6rem 0.75rem',
    paddingLeft: leftIcon ? '2.75rem' : (customHeight ? '0.55rem' : '0.75rem'),
    border: isOpen || isFocused ? '1px solid #4f46e5' : '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
    fontSize: style?.fontSize || (customHeight ? '0.8rem' : '0.9rem'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none' as const,
    boxSizing: 'border-box' as const,
    transition: 'all 0.15s ease',
    boxShadow: isOpen || isFocused ? '0 0 0 3px rgba(79, 70, 229, 0.25)' : 'none',
    minHeight: customHeight || '38px',
    maxHeight: customHeight || '38px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    outline: 'none',
  };

  return (
    <div ref={containerRef} data-select-container="true" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', minWidth: 0, boxSizing: 'border-box', ...style }}>
      {/* The dropdown itself */}
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {/* Left icon badge */}
      {leftIcon && (
        <div
          style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          {leftIcon}
        </div>
      )}

      {/* Trigger */}
      <div
        className="select-trigger"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        tabIndex={disabled ? -1 : 0}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (!isOpen) {
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              setIsOpen(true);
              e.preventDefault();
              e.stopPropagation();
            }
          } else {
            handleKeyDown(e);
          }
        }}
        style={triggerStyle}
      >
        <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center' }}>{renderTrigger()}</div>
        {onRefresh && (
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation();
              setIsRefreshing(true);
              try {
                await onRefresh();
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            title="Refresh options"
            style={{
              flexShrink: 0,
              width: '24px',
              height: '24px',
              border: 'none',
              background: 'transparent',
              color: isRefreshing ? '#10b981' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              marginRight: '2px',
              outline: 'none',
              padding: 0
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: isRefreshing ? 'select-spin 0.8s linear infinite' : 'none',
              }}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}
        {onScanClick && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onScanClick();
            }}
            title="Scan Barcode / QR Code"
            style={{
              flexShrink: 0,
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              color: '#2563eb',
              cursor: 'pointer',
              padding: '0.2rem 0.5rem',
              marginRight: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="7" y1="7" x2="7" y2="17" />
              <line x1="10" y1="7" x2="10" y2="17" />
              <line x1="17" y1="7" x2="17" y2="17" />
            </svg>
            <span>Scan</span>
          </button>
        )}
        {clearable && !disabled && selectedValues.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(multi ? [] : '');
              setSearchTerm('');
            }}
            title="Clear selection"
            style={{
              flexShrink: 0,
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '0 4px',
              marginRight: '2px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
            }}
          >
            ×
          </button>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4b5563"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          data-select-dropdown="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            minWidth: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search input (only in multi-chip mode where input is not in the top bar) */}
          {multi && !hideDropdownSearch && (
          <div
            style={{
              padding: '8px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#ffffff',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ position: 'relative' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder={isAsync ? (asyncConfig?.minSearchLength ? `Type ${asyncConfig.minSearchLength}+ chars…` : 'Search…') : 'Search…'}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: hasRefresh ? '0.42rem 2.8rem 0.42rem 2rem' : '0.42rem 0.6rem 0.42rem 2rem',
                  fontSize: '0.82rem',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '7px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                  color: '#1e293b',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--primary, #6d28d9)')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
               {hasRefresh && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (isAsync) {
                      fetchAsync(searchTerm);
                    }
                    if (onRefresh) {
                      setIsRefreshing(true);
                      try {
                        await onRefresh();
                      } finally {
                        setIsRefreshing(false);
                      }
                    }
                  }}
                  disabled={isLoading || isRefreshing}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: (isLoading || isRefreshing) ? '#ecfdf5' : '#f8fafc',
                    border: '1px solid',
                    borderColor: (isLoading || isRefreshing) ? '#10b981' : '#cbd5e1',
                    cursor: (isLoading || isRefreshing) ? 'not-allowed' : 'pointer',
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: (isLoading || isRefreshing) ? '#10b981' : '#475569',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isRefreshing) {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#94a3b8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && !isRefreshing) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  title="Refresh options"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      animation: (isLoading || isRefreshing) ? 'select-spin 1s linear infinite' : 'none',
                    }}
                  >
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
              )}
              {isLoading && (
                <div style={{ position: 'absolute', right: hasRefresh ? '32px' : '9px', top: '50%', transform: 'translateY(-50%)' }}>
                  <Spinner />
                </div>
              )}
            </div>
          </div>
          )}

          {/* Options list */}
          <div ref={listRef} style={{ maxHeight: `${maxHeight}px`, overflowY: 'auto', padding: '4px' }}>
            {fetchError ? (
              <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#ef4444', textAlign: 'center' }}>
                ⚠ {fetchError}
              </div>
            ) : isLoading && displayOptions.length === 0 ? (
              <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
                Loading…
              </div>
            ) : displayOptions.length === 0 ? (
              <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center' }}>
                {isAsync && searchTerm.length < (asyncConfig?.minSearchLength ?? 0)
                  ? `Type at least ${asyncConfig?.minSearchLength} character(s) to search`
                  : staticOptions.length > 0 || isAsync
                  ? noMatchText
                  : noOptionsText}
              </div>
            ) : (
              displayOptions.map((opt, index) => {
                const sel = isSelected(opt.value);
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={opt.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.9rem',
                      color: sel || isHighlighted ? 'var(--primary, #6d28d9)' : 'var(--text-primary, #111827)',
                      fontWeight: sel || isHighlighted ? 600 : 400,
                      backgroundColor: sel ? '#ede9fe' : (isHighlighted ? '#f5f3ff' : 'transparent'),
                      borderRadius: '7px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'background-color 0.1s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!sel && !isHighlighted) e.currentTarget.style.backgroundColor = '#f5f3ff';
                    }}
                    onMouseLeave={(e) => {
                      if (!sel && !isHighlighted) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {renderOption ? renderOption(opt, sel) : <span>{opt.label}</span>}
                    {/* checkmark for multi */}
                    {multi && (
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          border: sel ? '2px solid var(--primary, #6d28d9)' : '1.5px solid #d1d5db',
                          backgroundColor: sel ? 'var(--primary, #6d28d9)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {sel && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="2 6 5 9 10 3" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Create option footer */}
          {onCreateOption && (
            <div
              onClick={() => {
                onCreateOption(searchTerm);
                setIsOpen(false);
              }}
              style={{
                padding: '8px 12px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: highlightedIndex === displayOptions.length ? '#f5f3ff' : '#ffffff',
                fontSize: '0.85rem',
                color: 'var(--primary, #6d28d9)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <span>+ {typeof createOptionText === 'function' ? createOptionText(searchTerm) : (createOptionText || 'Create new')}</span>
            </div>
          )}

          {/* Multi footer */}
          {multi && selectedValues.length > 0 && (
            <div
              style={{
                padding: '6px 10px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: '#fafafa',
                fontSize: '0.75rem',
                color: '#6b7280',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{selectedValues.length} selected</span>
              <span
                onClick={() => onChange([])}
                style={{ color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear all
              </span>
            </div>
          )}
        </div>
      )}
    </div>{/* inner dropdown wrapper */}
    </div>
  );
};
