import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Normalizes a search query or target string by converting to lowercase
 * and removing non-alphanumeric characters (dots, spaces, hyphens, slashes, etc.).
 * Enables symmetric matching e.g. "RWA" <-> "R.W.A".
 */
export const normalizeSearchToken = (str: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Injected style to eliminate inner input outline and ensure outer shell receives highlight
if (typeof document !== 'undefined' && !document.getElementById('__searchable-entity-select-styles__')) {
  const styleEl = document.createElement('style');
  styleEl.id = '__searchable-entity-select-styles__';
  styleEl.textContent = `
    .searchable-entity-select-input,
    .searchable-entity-select-input:focus,
    .searchable-entity-select-input:focus-visible,
    .searchable-entity-select-input:active {
      outline: none !important;
      box-shadow: none !important;
      border: none !important;
      background: transparent !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      appearance: none !important;
    }
  `;
  document.head.appendChild(styleEl);
}

export interface SearchableEntitySelectProps<T> {
  /** Selected ID (single) or array of IDs (multi) */
  value: string | string[];
  /** Callback when selection changes */
  onChange: (value: any, entity?: T | T[] | null) => void;
  /** Multi-select mode */
  multi?: boolean;
  /** Static options list */
  options?: T[];
  /** Async search fetch function */
  fetchEntities?: (searchTerm: string) => Promise<T[]>;
  /** Initial or preloaded entity to display before async fetch */
  selectedEntity?: T | null;
  /** Preloaded entities for multi-select */
  selectedEntities?: T[];
  /** Extracts the unique string ID for an entity (default: e.id || e.value) */
  getEntityId?: (entity: T) => string;
  /** Extracts the primary label for an entity (default: e.name || e.label || e.title) */
  getEntityLabel?: (entity: T) => string;
  /** Optional secondary subtitle or description line in dropdown option */
  getEntitySubtext?: (entity: T) => React.ReactNode;
  /** Additional search tokens to match against during fuzzy search */
  getEntitySearchTokens?: (entity: T) => string[];
  /** Input placeholder */
  placeholder?: string;
  /** Visual variant: 'form' (shows preview card on selection) or 'filter' (compact toolbar picker) */
  variant?: 'form' | 'filter';
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Clearable button */
  clearable?: boolean;
  /** Left icon inside trigger */
  leftIcon?: React.ReactNode;
  /** Custom trigger/container CSS style */
  style?: React.CSSProperties;
  /** Custom dropdown popover CSS style */
  dropdownStyle?: React.CSSProperties;
  /** Custom preview card CSS style */
  previewStyle?: React.CSSProperties;
  /** Custom renderer for dropdown option items */
  renderOption?: (entity: T, isSelected: boolean) => React.ReactNode;
  /** Custom renderer for the preview card ("small box") */
  renderPreview?: (entity: T, onClear: () => void) => React.ReactNode;
  /** Custom renderer for multi-select chips */
  renderChip?: (entity: T, onRemove: () => void) => React.ReactNode;
  /** Debounce delay for async fetching in milliseconds (default: 300) */
  debounceMs?: number;
  /** Text when no items are available */
  noOptionsText?: string;
  /** Text when no matches match search query */
  noMatchText?: string;
  /** Loading text */
  loadingText?: string;
  /** Create new option handler */
  onCreateNew?: (searchTerm: string) => void;
  /** Create new option button text */
  createNewText?: string | ((searchTerm: string) => string);
  /** Refresh callback */
  onRefresh?: () => void;
}

export function SearchableEntitySelect<T = any>({
  value,
  onChange,
  multi = false,
  options: staticOptions = [],
  fetchEntities,
  selectedEntity,
  selectedEntities,
  getEntityId = (e: any) => e?.id ?? e?.value ?? '',
  getEntityLabel = (e: any) => e?.name ?? e?.label ?? e?.title ?? '',
  getEntitySubtext,
  getEntitySearchTokens,
  placeholder = 'Select...',
  variant = 'form',
  disabled = false,
  required = false,
  clearable = true,
  leftIcon,
  style,
  dropdownStyle,
  previewStyle,
  renderOption,
  renderPreview,
  renderChip,
  debounceMs = 300,
  noOptionsText = 'No records available',
  noMatchText = 'No matches found',
  loadingText = 'Searching...',
  onCreateNew,
  createNewText = 'Create new',
  onRefresh,
}: SearchableEntitySelectProps<T>) {
  const isAsync = Boolean(fetchEntities);
  const selectedValues: string[] = Array.isArray(value) ? value : value ? [value] : [];

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState<T[]>([]);
  const [entityCache, setEntityCache] = useState<Record<string, T>>(() => {
    const initial: Record<string, T> = {};
    if (selectedEntity) {
      const id = getEntityId(selectedEntity);
      if (id) initial[id] = selectedEntity;
    }
    if (selectedEntities && Array.isArray(selectedEntities)) {
      selectedEntities.forEach((e) => {
        const id = getEntityId(e);
        if (id) initial[id] = e;
      });
    }
    staticOptions.forEach((e) => {
      const id = getEntityId(e);
      if (id) initial[id] = e;
    });
    return initial;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync incoming selectedEntity/selectedEntities into local cache
  useEffect(() => {
    if (selectedEntity) {
      const id = getEntityId(selectedEntity);
      if (id) {
        setEntityCache((prev) => ({ ...prev, [id]: selectedEntity }));
      }
    }
    if (selectedEntities && Array.isArray(selectedEntities)) {
      setEntityCache((prev) => {
        const next = { ...prev };
        selectedEntities.forEach((e) => {
          const id = getEntityId(e);
          if (id) next[id] = e;
        });
        return next;
      });
    }
  }, [selectedEntity, selectedEntities, getEntityId]);

  // Combine static and cached options for base pool
  const allKnownEntities = React.useMemo(() => {
    const map = new Map<string, T>();
    staticOptions.forEach((e) => {
      const id = getEntityId(e);
      if (id) map.set(id, e);
    });
    Object.entries(entityCache).forEach(([id, e]) => {
      if (id && e) map.set(id, e);
    });
    return Array.from(map.values());
  }, [staticOptions, entityCache, getEntityId]);

  // Find currently selected entity object for single-select mode
  const currentSelectedEntity: T | null = React.useMemo(() => {
    if (multi || selectedValues.length === 0) return null;
    const id = selectedValues[0];
    return entityCache[id] || selectedEntity || null;
  }, [multi, selectedValues, entityCache, selectedEntity]);

  // Fuzzy filter logic: matches normal string containment OR normalized punctuation-stripped tokens
  const filterEntityByFuzzy = useCallback(
    (entity: T, term: string): boolean => {
      const trimmed = term.trim().toLowerCase();
      if (!trimmed) return true;

      const label = (getEntityLabel(entity) || '').toLowerCase();
      const id = (getEntityId(entity) || '').toLowerCase();

      // Direct substring match
      if (label.includes(trimmed) || id.includes(trimmed)) return true;

      // Symmetric token matching (e.g. "RWA" <-> "R.W.A")
      const normQuery = normalizeSearchToken(trimmed);
      if (normQuery.length >= 2) {
        const normLabel = normalizeSearchToken(label);
        if (normLabel.includes(normQuery) || normQuery.includes(normLabel)) return true;

        if (getEntitySearchTokens) {
          const tokens = getEntitySearchTokens(entity) || [];
          for (const token of tokens) {
            const normToken = normalizeSearchToken(token);
            if (normToken.includes(normQuery) || normQuery.includes(normToken)) return true;
          }
        }
      }

      return false;
    },
    [getEntityLabel, getEntityId, getEntitySearchTokens]
  );

  // Filter display options
  const displayOptions: T[] = React.useMemo(() => {
    if (isAsync) {
      if (searchTerm.trim()) {
        return asyncOptions;
      }
      return asyncOptions.length > 0 ? asyncOptions : allKnownEntities;
    }
    // Local / static filtering
    return allKnownEntities.filter((item) => filterEntityByFuzzy(item, searchTerm));
  }, [isAsync, searchTerm, asyncOptions, allKnownEntities, filterEntityByFuzzy]);

  // Perform async search
  const performFetch = useCallback(
    async (term: string) => {
      if (!fetchEntities) return;
      setIsLoading(true);
      setFetchError(null);
      try {
        const results = await fetchEntities(term);
        const safeResults = Array.isArray(results) ? results : [];
        setAsyncOptions(safeResults);
        setEntityCache((prev) => {
          const next = { ...prev };
          safeResults.forEach((e) => {
            const id = getEntityId(e);
            if (id) next[id] = e;
          });
          return next;
        });
      } catch (err: any) {
        if (err?.name === 'AbortError' || err?.name === 'CanceledError') return;
        setFetchError('Failed to load search results');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchEntities, getEntityId]
  );

  // Debounce search input
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (!isOpen) setIsOpen(true);
    if (!isAsync) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      performFetch(term);
    }, debounceMs);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Reset highlight index on options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [displayOptions.length, searchTerm, isOpen]);

  // Scroll highlighted item into view
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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const hasCreateNew = Boolean(onCreateNew && searchTerm.trim());
    const totalCount = displayOptions.length + (hasCreateNew ? 1 : 0);

    if (e.key === 'ArrowDown') {
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0));
      }
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1));
        e.preventDefault();
      }
    } else if (e.key === 'Enter') {
      if (isOpen) {
        if (highlightedIndex >= 0 && highlightedIndex < displayOptions.length) {
          const item = displayOptions[highlightedIndex];
          handleSelect(item);
          e.preventDefault();
        } else if (hasCreateNew && highlightedIndex === displayOptions.length && onCreateNew) {
          onCreateNew(searchTerm);
          setIsOpen(false);
          setSearchTerm('');
          e.preventDefault();
        }
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        setIsOpen(false);
        setSearchTerm('');
        e.preventDefault();
      }
    }
  };

  // Selection handlers
  const isSelected = (id: string) => selectedValues.includes(id);

  const handleSelect = (entity: T) => {
    const id = getEntityId(entity);
    if (!id) return;

    setEntityCache((prev) => ({ ...prev, [id]: entity }));

    if (multi) {
      const next = isSelected(id) ? selectedValues.filter((v) => v !== id) : [...selectedValues, id];
      const entities = next.map((v) => entityCache[v] || (v === id ? entity : null)).filter(Boolean) as T[];
      onChange(next, entities);
      setSearchTerm('');
      inputRef.current?.focus();
    } else {
      onChange(id, entity);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClearSingle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(multi ? [] : '', null);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemoveChip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selectedValues.filter((v) => v !== id);
    const entities = next.map((v) => entityCache[v]).filter(Boolean) as T[];
    onChange(next, entities);
  };

  // Trigger initial fetch when opened
  const handleOpenDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
      if (isAsync && asyncOptions.length === 0) {
        performFetch('');
      }
    }
  };

  // Value displayed in the single input
  const getInputValue = () => {
    if (multi) return searchTerm;
    if (isOpen) {
      return searchTerm;
    }
    return currentSelectedEntity ? getEntityLabel(currentSelectedEntity) : '';
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Single Unified Trigger / Search Bar */}
      <div
        aria-required={required}
        onClick={() => {
          if (!disabled) {
            handleOpenDropdown();
            inputRef.current?.focus();
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: '36px',
          padding: '0.25rem 0.5rem',
          borderRadius: '7px',
          border: `1.5px solid ${isOpen || isFocused ? 'var(--primary, #2563eb)' : '#cbd5e1'}`,
          backgroundColor: disabled ? '#f8fafc' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'text',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isOpen || isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : 'none',
          gap: '0.4rem',
        }}
      >
        {leftIcon && <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', flexShrink: 0 }}>{leftIcon}</div>}

        {/* Multi-select chips */}
        {multi && selectedValues.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
            {selectedValues.map((id) => {
              const entity = entityCache[id];
              if (renderChip && entity) {
                return (
                  <React.Fragment key={id}>
                    {renderChip(entity, () => handleRemoveChip(id, { stopPropagation: () => {} } as any))}
                  </React.Fragment>
                );
              }
              const label = entity ? getEntityLabel(entity) : id;
              return (
                <span
                  key={id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{label}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveChip(id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: '#3b82f6',
                        fontSize: '0.85rem',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        )}

        {/* Single Direct Search Input */}
        <input
          ref={inputRef}
          className="searchable-entity-select-input"
          type="text"
          value={getInputValue()}
          placeholder={currentSelectedEntity && !isOpen && !multi ? getEntityLabel(currentSelectedEntity) : placeholder}
          disabled={disabled}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={(e) => {
            e.currentTarget.style.outline = 'none';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.border = 'none';
            setIsFocused(true);
            handleOpenDropdown();
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            minWidth: '120px',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            fontSize: '0.82rem',
            backgroundColor: 'transparent',
            color: '#1e293b',
            fontWeight: !multi && currentSelectedEntity && !isOpen ? 600 : 400,
            padding: '2px 0',
          }}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ animation: 'select-spin 0.7s linear infinite', display: 'block' }}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        )}

        {/* Refresh Button */}
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
            disabled={isLoading || isRefreshing}
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoading || isRefreshing ? 'not-allowed' : 'pointer',
              color: isRefreshing ? '#10b981' : '#94a3b8',
              padding: '0 2px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
            title="Refresh"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: isRefreshing ? 'select-spin 0.8s linear infinite' : 'none' }}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        )}

        {/* Clear Button */}
        {clearable && !disabled && (selectedValues.length > 0 || searchTerm) && (
          <button
            type="button"
            onClick={handleClearSingle}
            title="Clear selection"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '1.1rem',
              lineHeight: 1,
              padding: '0 3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}

        {/* Dropdown Chevron */}
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: '0 2px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#64748b',
            flexShrink: 0,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Pure Dropdown Results Popover (No Duplicate Extended Search Bar!) */}
      {isOpen && (
        <div
          data-select-dropdown="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            minWidth: '240px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...dropdownStyle,
          }}
        >
          {/* Options List directly */}
          <div ref={listRef} style={{ maxHeight: '240px', overflowY: 'auto', padding: '4px' }}>
            {fetchError ? (
              <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: '#ef4444', textAlign: 'center' }}>
                ⚠ {fetchError}
              </div>
            ) : isLoading && displayOptions.length === 0 ? (
              <div style={{ padding: '1rem', fontSize: '0.82rem', color: '#64748b', textAlign: 'center' }}>
                {loadingText}
              </div>
            ) : displayOptions.length === 0 ? (
              <div style={{ padding: '0.75rem', fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>
                {allKnownEntities.length > 0 || isAsync ? noMatchText : noOptionsText}
              </div>
            ) : (
              displayOptions.map((entity, index) => {
                const id = getEntityId(entity);
                const label = getEntityLabel(entity);
                const subtext = getEntitySubtext ? getEntitySubtext(entity) : null;
                const sel = isSelected(id);
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${id}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(entity);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isHighlighted ? '#f1f5f9' : sel ? '#eff6ff' : 'transparent',
                      transition: 'background-color 0.1s ease',
                      gap: '0.5rem',
                    }}
                  >
                    {renderOption ? (
                      renderOption(entity, sel)
                    ) : (
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: sel ? 700 : 500,
                            color: sel ? '#1d4ed8' : '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {label}
                        </div>
                        {subtext && (
                          <div
                            style={{
                              fontSize: '0.73rem',
                              color: '#64748b',
                              marginTop: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {subtext}
                          </div>
                        )}
                      </div>
                    )}

                    {sel && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}

            {/* Create New Option */}
            {onCreateNew && searchTerm.trim() && (
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  onCreateNew(searchTerm);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '0.5rem 0.65rem',
                  borderTop: '1px solid #f1f5f9',
                  backgroundColor: highlightedIndex === displayOptions.length ? '#eff6ff' : '#f8fafc',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>+</span>
                <span>
                  {typeof createNewText === 'function' ? createNewText(searchTerm) : `${createNewText} "${searchTerm}"`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Small Box Metadata Preview (Variant 'form' only when renderPreview is provided) */}
      {variant === 'form' && currentSelectedEntity && renderPreview && (
        <div style={{ marginTop: '0.35rem', ...previewStyle }}>
          {renderPreview(currentSelectedEntity, handleClearSingle)}
        </div>
      )}
    </div>
  );
}
