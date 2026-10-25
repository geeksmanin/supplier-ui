import React, { useState, useMemo } from 'react';
import { Search, X, ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, RefreshCw, Layers } from 'lucide-react';
import { Select } from './Select';

export interface CardDataListProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  renderListItem?: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;

  // Header & Search
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;

  // View Mode
  enableViewModeToggle?: boolean;
  defaultViewMode?: 'grid' | 'list';

  // Pagination (Server or Client)
  totalItems?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];

  // Styling & Layout
  minCardWidth?: string;
  gap?: string;
  className?: string;

  // States & Skeleton Customization
  loading?: boolean;
  skeletonCount?: number;
  renderSkeletonCard?: (index: number) => React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CardDataList<T>({
  items,
  renderCard,
  renderListItem,
  keyExtractor,
  title,
  subtitle,
  searchPlaceholder = 'Search items...',
  searchTerm: controlledSearch,
  onSearchChange,
  filterSlot,
  actionSlot,
  enableViewModeToggle = false,
  defaultViewMode = 'grid',
  totalItems: controlledTotal,
  page = 1,
  pageSize = 12,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 48, 96],
  minCardWidth = '320px',
  gap = '1.25rem',
  loading = false,
  skeletonCount = 6,
  renderSkeletonCard,
  emptyTitle = 'No items found',
  emptyMessage = 'Try adjusting your search query or filters.',
  emptyAction,
  onRefresh,
  isRefreshing = false,
}: CardDataListProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultViewMode);

  const activeSearch = controlledSearch !== undefined ? controlledSearch : internalSearch;

  const handleSearchChange = (val: string) => {
    if (controlledSearch === undefined) {
      setInternalSearch(val);
    }
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  // Determine if client-side pagination applies
  const isServerPaginated = onPageChange !== undefined;
  const totalCount = controlledTotal !== undefined ? controlledTotal : items.length;

  const displayedItems = useMemo(() => {
    if (isServerPaginated) {
      return items;
    }
    // Client-side slicing
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, isServerPaginated, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  // Default Apple Skeleton Card
  const renderDefaultSkeletonCard = (index: number) => (
    <div
      key={`skeleton-card-${index}`}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        minHeight: '220px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div className="card-shimmer-pulse" style={{ width: '56px', height: '56px', borderRadius: '12px', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div className="card-shimmer-pulse" style={{ width: '35%', height: '12px' }} />
          <div className="card-shimmer-pulse" style={{ width: '70%', height: '18px' }} />
        </div>
      </div>

      {/* Body lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0.5rem 0', flex: 1 }}>
        <div className="card-shimmer-pulse" style={{ width: '85%', height: '14px' }} />
        <div className="card-shimmer-pulse" style={{ width: '55%', height: '14px' }} />
      </div>

      {/* Footer skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f8fafc',
          gap: '0.5rem',
        }}
      >
        <div className="card-shimmer-pulse" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          <div className="card-shimmer-pulse" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <div className="card-shimmer-pulse" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );

  // Default Apple Skeleton List Row
  const renderDefaultSkeletonList = (index: number) => (
    <div
      key={`skeleton-list-${index}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.25rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #f1f5f9',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1 }}>
        <div className="card-shimmer-pulse" style={{ width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div className="card-shimmer-pulse" style={{ width: '30%', height: '12px' }} />
          <div className="card-shimmer-pulse" style={{ width: '60%', height: '16px' }} />
        </div>
      </div>
      <div className="card-shimmer-pulse" style={{ width: '130px', height: '24px', borderRadius: '12px' }} />
      <div className="card-shimmer-pulse" style={{ width: '80px', height: '30px', borderRadius: '8px' }} />
    </div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Global Shimmer Keyframes */}
      <style>{`
        @keyframes antigravity-card-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .card-shimmer-pulse {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: antigravity-card-shimmer 1.5s infinite linear;
          border-radius: 6px;
        }
        @keyframes antigravity-indeterminate-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Top Header Ribbon & Integrated Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* Left: Title or Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          {title && (
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
              {subtitle && <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</p>}
            </div>
          )}

          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <input
              type="text"
              value={activeSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: '100%',
                padding: '0.5625rem 2rem 0.5625rem 2.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            />
            <Search
              size={16}
              color="#64748b"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            {activeSearch && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  color: '#94a3b8',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Custom Filters (Picklists, Dropdowns, Toggles) */}
          {filterSlot && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{filterSlot}</div>}
        </div>

        {/* Right: Actions, Refresh, View Toggle, and Metric Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing || loading}
              title="Refresh Data"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: isRefreshing || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={15} className={isRefreshing || loading ? 'animate-spin' : ''} />
            </button>
          )}

          {enableViewModeToggle && renderListItem && (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: '2px',
                borderRadius: '8px',
                gap: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Card Grid View"
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="List View"
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                  color: viewMode === 'list' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ListIcon size={15} />
              </button>
            </div>
          )}

          {actionSlot}
        </div>
      </div>

      {/* Top Activity Progress Bar during background re-fetch */}
      {loading && displayedItems.length > 0 && (
        <div style={{ height: '3px', width: '100%', overflow: 'hidden', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '-0.5rem' }}>
          <div
            style={{
              height: '100%',
              width: '50%',
              background: 'linear-gradient(90deg, transparent, #2563eb, #7c3aed, transparent)',
              animation: 'antigravity-indeterminate-bar 1.2s infinite ease-in-out',
            }}
          />
        </div>
      )}

      {/* Main Content Area */}
      {loading && displayedItems.length === 0 ? (
        /* Shimmer Skeleton Cards/Rows */
        viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`,
              gap,
              width: '100%',
            }}
          >
            {Array.from({ length: skeletonCount }).map((_, idx) =>
              renderSkeletonCard ? renderSkeletonCard(idx) : renderDefaultSkeletonCard(idx)
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {Array.from({ length: Math.min(5, skeletonCount) }).map((_, idx) =>
              renderDefaultSkeletonList(idx)
            )}
          </div>
        )
      ) : displayedItems.length === 0 ? (
        <div
          style={{
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px dashed #cbd5e1',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: '0.75rem',
            }}
          >
            <Layers size={22} />
          </div>
          <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>{emptyTitle}</h4>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#64748b', maxWidth: '360px' }}>{emptyMessage}</p>
          {emptyAction}
        </div>
      ) : (
        <div
          style={{
            transition: 'opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            opacity: loading && displayedItems.length > 0 ? 0.65 : 1,
            pointerEvents: loading && displayedItems.length > 0 ? 'none' : 'auto',
          }}
        >
          {viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`,
                gap,
                width: '100%',
              }}
            >
              {displayedItems.map((item, idx) => {
                const key = keyExtractor ? keyExtractor(item, idx) : (item as any)?.id ?? idx;
                return (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                    {renderCard(item, idx)}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                width: '100%',
              }}
            >
              {displayedItems.map((item, idx) => {
                const key = keyExtractor ? keyExtractor(item, idx) : (item as any)?.id ?? idx;
                return (
                  <div key={key}>
                    {renderListItem ? renderListItem(item, idx) : renderCard(item, idx)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination Footer */}
      {totalCount > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '0.8125rem',
            color: '#64748b',
            gap: '0.75rem',
          }}
        >
          {/* Item count text */}
          <div>
            Showing <strong style={{ color: '#0f172a' }}>{startItem}</strong> -{' '}
            <strong style={{ color: '#0f172a' }}>{endItem}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{totalCount}</strong> items
          </div>

          {/* Page controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onPageSizeChange && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8125rem',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  {pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => onPageChange && onPageChange(page - 1)}
                disabled={page <= 1}
                title="Previous Page"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: page <= 1 ? '#f8fafc' : '#ffffff',
                  color: page <= 1 ? '#cbd5e1' : '#334155',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ padding: '0 8px', fontWeight: 600, color: '#0f172a' }}>
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange && onPageChange(page + 1)}
                disabled={page >= totalPages}
                title="Next Page"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: page >= totalPages ? '#f8fafc' : '#ffffff',
                  color: page >= totalPages ? '#cbd5e1' : '#334155',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
