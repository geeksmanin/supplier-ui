import React, { useState, useMemo } from 'react';
import { Search, X, Filter, RefreshCw, Plus, Layers, ChevronDown } from 'lucide-react';
import { MobileSearchBar } from './Mobile/MobileSearchBar';
import { MobileBottomBanner } from './Mobile/MobileBottomBanner';
import { MobileFAB } from './Mobile/MobileFAB';

export interface CardDataListMobileProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;

  // Header & Search
  title?: string;
  searchPlaceholder?: string;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;

  // Filter Drawer
  filterDrawerContent?: React.ReactNode;
  activeFilterCount?: number;
  onResetFilters?: () => void;
  onApplyFilters?: () => void;

  // Inline Quick Filter Slot (e.g. branch dropdown pill)
  quickFilterSlot?: React.ReactNode;

  // Pagination (Load More or Stepper)
  totalItems?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;

  // FAB (Floating Action Button)
  onFabClick?: () => void;
  fabLabel?: string;
  fabIcon?: React.ReactNode;

  // States & Skeleton Customization
  loading?: boolean;
  skeletonCount?: number;
  renderSkeletonCard?: (index: number) => React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;

  // Layout
  columns?: 1 | 2;
  gap?: string;
  paddingBottom?: string;
}

export function CardDataListMobile<T>({
  items,
  renderCard,
  keyExtractor,
  title,
  searchPlaceholder = 'Search items...',
  searchTerm: controlledSearch,
  onSearchChange,
  filterDrawerContent,
  activeFilterCount = 0,
  onResetFilters,
  onApplyFilters,
  quickFilterSlot,
  totalItems: controlledTotal,
  page = 1,
  pageSize = 10,
  onPageChange,
  onLoadMore,
  hasMore,
  loadingMore = false,
  onFabClick,
  fabLabel = 'Create New',
  fabIcon,
  loading = false,
  skeletonCount = 4,
  renderSkeletonCard,
  emptyTitle = 'No items found',
  emptyMessage = 'Try adjusting your search query or filters.',
  emptyAction,
  onRefresh,
  isRefreshing = false,
  columns = 1,
  gap = '0.875rem',
  paddingBottom = '6rem',
}: CardDataListMobileProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [internalVisibleCount, setInternalVisibleCount] = useState(pageSize);

  const activeSearch = controlledSearch !== undefined ? controlledSearch : internalSearch;

  const handleSearchChange = (val: string) => {
    if (controlledSearch === undefined) {
      setInternalSearch(val);
    }
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const totalCount = controlledTotal !== undefined ? controlledTotal : items.length;

  // Client-side vs Server-side Load More
  const isServerPaginated = onLoadMore !== undefined || onPageChange !== undefined;

  const displayedItems = useMemo(() => {
    if (isServerPaginated) {
      return items;
    }
    return items.slice(0, internalVisibleCount);
  }, [items, isServerPaginated, internalVisibleCount]);

  const canLoadMore =
    hasMore !== undefined
      ? hasMore
      : isServerPaginated
      ? displayedItems.length < totalCount
      : internalVisibleCount < items.length;

  const remainingCount = Math.max(0, totalCount - displayedItems.length);

  const handleLoadMoreClick = () => {
    if (onLoadMore) {
      onLoadMore();
    } else if (onPageChange) {
      onPageChange(page + 1);
    } else {
      setInternalVisibleCount((prev) => prev + pageSize);
    }
  };

  // Default Mobile Skeleton Card
  const renderDefaultSkeletonCard = (index: number) => (
    <div
      key={`mobile-skeleton-${index}`}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Header skeleton */}
      <div
        style={{
          padding: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div className="card-shimmer-pulse" style={{ width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
            <div className="card-shimmer-pulse" style={{ width: '30%', height: '12px' }} />
            <div className="card-shimmer-pulse" style={{ width: '65%', height: '16px' }} />
          </div>
        </div>
        <div className="card-shimmer-pulse" style={{ width: '40px', height: '20px', borderRadius: '6px' }} />
      </div>

      {/* Body skeleton */}
      <div style={{ padding: '0.75rem 0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="card-shimmer-pulse" style={{ width: '90%', height: '13px' }} />
        <div className="card-shimmer-pulse" style={{ width: '60%', height: '13px' }} />
      </div>

      {/* Footer skeleton */}
      <div
        style={{
          padding: '0.625rem 0.875rem',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="card-shimmer-pulse" style={{ width: '75px', height: '26px', borderRadius: '6px' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          <div className="card-shimmer-pulse" style={{ width: '65px', height: '26px', borderRadius: '6px' }} />
          <div className="card-shimmer-pulse" style={{ width: '30px', height: '26px', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', paddingBottom }}>
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

      {/* Top Header / Title (if provided) */}
      {title && (
        <div style={{ padding: '0.75rem 1rem 0.25rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{title}</h2>
        </div>
      )}

      {/* Top Mobile Search Bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, backgroundColor: '#ffffff' }}>
        <MobileSearchBar
          value={activeSearch}
          onChange={handleSearchChange}
          onClear={() => handleSearchChange('')}
          placeholder={searchPlaceholder}
          onFilterClick={filterDrawerContent ? () => setIsFilterDrawerOpen(true) : undefined}
          activeFilterCount={activeFilterCount}
          rightAction={
            onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing || loading}
                title="Refresh"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  cursor: isRefreshing || loading ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={15} className={isRefreshing || loading ? 'animate-spin' : ''} />
              </button>
            ) : undefined
          }
        />

        {/* Quick Filter Slot below search bar (e.g., Branch pill, status chips) */}
        {quickFilterSlot && (
          <div
            style={{
              padding: '0.5rem 0.875rem',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
            }}
          >
            {quickFilterSlot}
          </div>
        )}

        {/* Top Activity Progress Bar during background re-fetch */}
        {loading && displayedItems.length > 0 && (
          <div style={{ height: '3px', width: '100%', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
            <div
              style={{
                height: '100%',
                width: '50%',
                background: 'linear-gradient(90deg, transparent, #0284c7, #6366f1, transparent)',
                animation: 'antigravity-indeterminate-bar 1.2s infinite ease-in-out',
              }}
            />
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet Drawer */}
      {filterDrawerContent && (
        <MobileBottomBanner
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          title="Filter Results"
          height="auto"
          maxHeight="80vh"
        >
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filterDrawerContent}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {onResetFilters && (
                <button
                  type="button"
                  onClick={() => {
                    onResetFilters();
                    setIsFilterDrawerOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (onApplyFilters) onApplyFilters();
                  setIsFilterDrawerOpen(false);
                }}
                style={{
                  flex: 2,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </MobileBottomBanner>
      )}

      {/* Main Content Area */}
      <div style={{ padding: '0.875rem', boxSizing: 'border-box' }}>
        {loading && displayedItems.length === 0 ? (
          /* Shimmer Skeleton Cards */
          <div
            style={{
              display: columns === 2 ? 'grid' : 'flex',
              gridTemplateColumns: columns === 2 ? 'repeat(2, 1fr)' : undefined,
              flexDirection: columns === 1 ? 'column' : undefined,
              gap,
            }}
          >
            {Array.from({ length: skeletonCount }).map((_, idx) =>
              renderSkeletonCard ? renderSkeletonCard(idx) : renderDefaultSkeletonCard(idx)
            )}
          </div>
        ) : displayedItems.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
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
            <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#64748b', maxWidth: '320px' }}>{emptyMessage}</p>
            {emptyAction}
          </div>
        ) : (
          <div
            style={{
              display: columns === 2 ? 'grid' : 'flex',
              gridTemplateColumns: columns === 2 ? 'repeat(2, 1fr)' : undefined,
              flexDirection: columns === 1 ? 'column' : undefined,
              gap,
              transition: 'opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
              opacity: loading && displayedItems.length > 0 ? 0.65 : 1,
              pointerEvents: loading && displayedItems.length > 0 ? 'none' : 'auto',
            }}
          >
            {displayedItems.map((item, idx) => {
              const key = keyExtractor ? keyExtractor(item, idx) : (item as any)?.id ?? idx;
              return (
                <div key={key} style={{ width: '100%', boxSizing: 'border-box' }}>
                  {renderCard(item, idx)}
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Pagination Section */}
        {totalCount > 0 && (
          <div style={{ marginTop: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing <strong>{displayedItems.length}</strong> of <strong>{totalCount}</strong> items
            </span>

            {canLoadMore && (
              <button
                type="button"
                onClick={handleLoadMoreClick}
                disabled={loadingMore}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '0.6875rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {loadingMore ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>Load More {remainingCount > 0 ? `(${remainingCount} remaining)` : ''}</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {onFabClick && (
        <MobileFAB
          onClick={onFabClick}
          label={fabLabel}
          icon={fabIcon || <Plus size={22} />}
        />
      )}
    </div>
  );
}
