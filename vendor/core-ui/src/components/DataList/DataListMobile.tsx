import React, { useState, useEffect, useRef } from 'react';
import { MobileBottomBanner } from '../Mobile/MobileBottomBanner';

export interface DataListFilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface DataListCardProps {
  serialNumber?: number | string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: {
    label: string;
    color?: string;
    bg?: string;
  };
  tags?: Array<{ label: string; color?: string; bg?: string }>;
  attributes?: Array<{ label?: string; value: React.ReactNode }>;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: (e: React.MouseEvent) => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface DataListDetailSection {
  title?: string;
  properties: Array<{
    label: string;
    value: React.ReactNode;
    fullWidth?: boolean;
  }>;
}

export interface DataListDetailLineItem {
  title: string;
  subtitle?: string;
  quantity?: number | string;
  rate?: number | string;
  tax?: number | string;
  amount?: number | string;
}

export interface DataListDetailConfig {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  sections: DataListDetailSection[];
  lineItems?: {
    title?: string;
    items: DataListDetailLineItem[];
  };
  summary?: {
    title?: string;
    rows: Array<{
      label: string;
      value: React.ReactNode;
      isBold?: boolean;
      color?: string;
    }>;
  };
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    icon?: React.ReactNode;
  }>;
}

export interface DataListDateFilterOption {
  label: string;
  value: string;
}

export interface DataListDateFilterConfig {
  options?: DataListDateFilterOption[];
  selectedValue?: string;
  onChange?: (val: string) => void;
  customStartDate?: string;
  onCustomStartDateChange?: (val: string) => void;
  customEndDate?: string;
  onCustomEndDateChange?: (val: string) => void;
}

export interface DataListMobileProps<T> {
  title?: string;
  subtitle?: string;
  createButtonLabel?: string;
  onCreate?: () => void;
  items: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  filterOptions?: DataListFilterOption[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  dateFilter?: DataListDateFilterConfig;
  customFiltersContent?: React.ReactNode;
  keyExtractor: (item: T) => string;
  renderCard?: (item: T, openDetail: () => void, index: number) => React.ReactNode;
  cardProps?: (item: T, index: number) => DataListCardProps;
  detailConfig?: (item: T) => DataListDetailConfig;
  onItemClick?: (item: T) => void;
  emptyState?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  pagination?: {
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    hasMore?: boolean;
    onLoadMore?: () => void;
  };
}

const DEFAULT_DATE_PRESETS: DataListDateFilterOption[] = [
  { label: 'All Time', value: '' },
  { label: 'Today', value: '1day' },
  { label: 'Last 7 Days', value: '1week' },
  { label: 'Last 30 Days', value: '1month' },
  { label: 'Last 1 Year', value: '1year' },
  { label: 'Custom', value: 'custom' },
];

export function DataListMobile<T>({
  title,
  subtitle,
  createButtonLabel,
  onCreate,
  items,
  loading = false,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  filterOptions = [],
  selectedFilter,
  onFilterChange,
  dateFilter,
  customFiltersContent,
  keyExtractor,
  renderCard,
  cardProps,
  detailConfig,
  onItemClick,
  emptyState,
  pagination,
}: DataListMobileProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [filterBannerOpen, setFilterBannerOpen] = useState(false);


  const handleCardClick = (item: T) => {
    if (onItemClick) {
      onItemClick(item);
    }
    if (detailConfig) {
      setSelectedItem(item);
      setBannerOpen(true);
    }
  };

  const currentDetail = selectedItem && detailConfig ? detailConfig(selectedItem) : null;
  const hasActiveStatusFilter = Boolean(selectedFilter && selectedFilter !== '' && selectedFilter !== 'all');
  const hasActiveDateFilter = Boolean(dateFilter?.selectedValue && dateFilter.selectedValue !== '');
  const hasActiveFilter = hasActiveStatusFilter || hasActiveDateFilter;
  const activeOption = filterOptions.find((opt) => opt.value === selectedFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0.85rem' }}>
      {/* 1. Header with Title and Create Button (omitted if no title) */}
      {title && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>

          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                flexShrink: 0,
              }}
            >
              <span>{createButtonLabel || '+ Create'}</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Sticky Search, Filter Tabs & Date Filter Bar */}
      {(onSearchChange || filterOptions.length > 0 || dateFilter) && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 15,
          backgroundColor: '#f8fafc',
          paddingTop: '0.25rem',
          paddingBottom: '0.45rem',
          marginTop: '-0.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}>
          {/* Search & Filter Bar Row */}
          {(onSearchChange || filterOptions.length > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {onSearchChange && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '0.5rem 0.75rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.82rem',
                      color: '#1e293b',
                      backgroundColor: 'transparent',
                      padding: 0,
                    }}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        padding: '0 2px',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {/* Icon-Only Filter Trigger Button that opens Bottom Banner */}
              {filterOptions.length > 0 && (
                <button
                  type="button"
                  aria-label="Filter records"
                  onClick={() => setFilterBannerOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.55rem',
                    borderRadius: '10px',
                    backgroundColor: hasActiveFilter ? '#eff6ff' : '#ffffff',
                    border: hasActiveFilter ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    color: hasActiveFilter ? '#1d4ed8' : '#475569',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                    flexShrink: 0,
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  {hasActiveFilter && (
                    <span style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#2563eb',
                    }} />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Horizontal Status Filter Tab Line Bar with Counts */}
          {filterOptions.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
              padding: '0 0.1rem 0.2rem 0.1rem',
              margin: '-0.15rem 0 0 0',
            }}>
              {filterOptions.map((opt) => {
                const isSelected = selectedFilter === opt.value || (!selectedFilter && (opt.value === '' || opt.value === 'all'));
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onFilterChange?.(opt.value)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.32rem 0.65rem',
                      borderRadius: '20px',
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#64748b',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 700 : 500,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{opt.label}</span>
                    {typeof opt.count === 'number' && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        lineHeight: 1.2,
                      }}>
                        {opt.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Filter Pill Badges */}
          {((hasActiveStatusFilter && activeOption) || (hasActiveDateFilter)) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              {hasActiveStatusFilter && activeOption && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '20px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#1d4ed8',
                }}>
                  <span>Status: <strong>{activeOption.label}</strong></span>
                  <button
                    type="button"
                    onClick={() => onFilterChange?.('')}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#1d4ed8',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {hasActiveDateFilter && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '20px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#15803d',
                }}>
                  <span>
                    Date:{' '}
                    <strong>
                      {dateFilter?.selectedValue === 'custom'
                        ? (dateFilter.customStartDate && dateFilter.customEndDate
                            ? `${dateFilter.customStartDate} to ${dateFilter.customEndDate}`
                            : 'Custom')
                        : (DEFAULT_DATE_PRESETS.find(p => p.value === dateFilter?.selectedValue)?.label || dateFilter?.selectedValue)}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      dateFilter?.onChange?.('');
                      dateFilter?.onCustomStartDateChange?.('');
                      dateFilter?.onCustomEndDateChange?.('');
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#15803d',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. List Items Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.35rem' }}>
        {loading && items.length === 0 ? (
          // Skeleton Loading
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ height: '18px', width: '40%', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
              <div style={{ height: '14px', width: '70%', backgroundColor: '#f8fafc', borderRadius: '4px' }} />
              <div style={{ height: '14px', width: '30%', backgroundColor: '#f1f5f9', borderRadius: '4px' }} />
            </div>
          ))
        ) : items.length === 0 ? (
          // Empty State
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                {emptyState?.title || 'No records found'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                {emptyState?.description || 'Try changing search keywords or filters.'}
              </div>
            </div>
            {(emptyState?.onAction || onCreate) && (
              <button
                type="button"
                onClick={emptyState?.onAction || onCreate}
                style={{
                  marginTop: '0.25rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {emptyState?.actionLabel || createButtonLabel || '+ Create New'}
              </button>
            )}
          </div>
        ) : (
          // Items Cards
          items.map((item, index) => {
            const key = keyExtractor(item);

            if (renderCard) {
              return (
                <div key={key} onClick={() => handleCardClick(item)}>
                  {renderCard(item, () => {
                    setSelectedItem(item);
                    setBannerOpen(true);
                  }, index)}
                </div>
              );
            }

            const c = cardProps ? cardProps(item, index) : { title: String(key) };

            return (
              <div
                key={key}
                onClick={() => handleCardClick(item)}
                style={{
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '0.85rem 1rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  userSelect: 'none',
                }}
              >
                {/* Floating Serial Number Corner Badge */}
                {c.serialNumber !== undefined && c.serialNumber !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      left: '12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '0px 6px',
                      borderRadius: '6px',
                      height: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
                      fontVariantNumeric: 'tabular-nums',
                      zIndex: 2,
                      pointerEvents: 'none',
                    }}
                  >
                    #{c.serialNumber}
                  </div>
                )}

                {/* Card Top Row: Title, Status Badge, Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.title}
                    </span>
                    {c.badge && (
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        backgroundColor: c.badge.bg || '#eff6ff',
                        color: c.badge.color || '#2563eb',
                      }}>
                        {c.badge.label}
                      </span>
                    )}
                  </div>

                  {c.actions && c.actions.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      {c.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            act.onClick(e);
                          }}
                          style={{
                            padding: '3px 7px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: act.variant === 'primary' ? '#2563eb' : '#f8fafc',
                            color: act.variant === 'primary' ? '#ffffff' : '#475569',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          {act.icon}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitle / Entity label */}
                {c.subtitle && (
                  <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                    {c.subtitle}
                  </div>
                )}

                {/* Attributes List */}
                {c.attributes && c.attributes.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', marginTop: '0.1rem' }}>
                    {c.attributes.map((attr, attrIdx) => (
                      <div key={attrIdx} style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {attr.label && <span style={{ color: '#94a3b8' }}>{attr.label}:</span>}
                        <span style={{ fontWeight: 600, color: '#334155' }}>{attr.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tags Badges */}
                {c.tags && c.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {c.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: tag.bg || '#f1f5f9',
                          color: tag.color || '#475569',
                        }}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer: Date, Amount, Arrow indicator */}
                {(c.footerLeft || c.footerRight) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f8fafc',
                    paddingTop: '0.4rem',
                    marginTop: '0.2rem',
                    fontSize: '0.75rem',
                  }}>
                    <div style={{ color: '#64748b' }}>{c.footerLeft}</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.footerRight}</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Explicit Load More Button & Status Indicator */}
      {pagination && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0 1.25rem 0', gap: '0.5rem', width: '100%' }}>
          {pagination.hasMore ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', width: '100%' }}>
              <button
                type="button"
                disabled={loading}
                onClick={pagination.onLoadMore}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  maxWidth: '320px',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: loading ? '#f1f5f9' : '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: loading ? '#94a3b8' : '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    <span>Loading more records...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                    <span>Load More Records</span>
                  </>
                )}
              </button>
              {pagination.totalCount && pagination.totalCount > items.length && (
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Showing {items.length} of {pagination.totalCount} records
                </span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, padding: '0.25rem 0' }}>
              Showing all {pagination.totalCount || items.length} records
            </div>
          )}
        </div>
      )}

      {/* 6. Built-in Slide-Up Bottom Detail Drawer */}
      {currentDetail && (
        <MobileBottomBanner
          isOpen={bannerOpen}
          onClose={() => setBannerOpen(false)}
          title={currentDetail.title}
          subtitle={currentDetail.subtitle}
          badge={currentDetail.badge}
          height="85vh"
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            gap: '1.25rem',
          }}>
            {/* Properties Sections */}
            {currentDetail.sections.map((sec, sIdx) => (
              <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sec.title && (
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    letterSpacing: '0.05em',
                  }}>
                    {sec.title}
                  </div>
                )}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                  padding: '0.75rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.65rem 0.5rem',
                }}>
                  {sec.properties.map((prop, pIdx) => (
                    <div
                      key={pIdx}
                      style={{
                        gridColumn: prop.fullWidth ? 'span 2' : 'span 1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.15rem',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
                        {prop.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', wordBreak: 'break-word' }}>
                        {prop.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Line items section if available */}
            {currentDetail.lineItems && currentDetail.lineItems.items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.05em',
                }}>
                  {currentDetail.lineItems.title || 'Line Items'} ({currentDetail.lineItems.items.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentDetail.lineItems.items.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #f1f5f9',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
                            {line.title}
                          </div>
                          {line.subtitle && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                              {line.subtitle}
                            </div>
                          )}
                        </div>
                        {line.amount !== undefined && (
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
                            {line.amount}
                          </div>
                        )}
                      </div>

                      {/* Line metadata: Qty, Rate, Tax */}
                      {(line.quantity !== undefined || line.rate !== undefined || line.tax !== undefined) && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontSize: '0.7rem',
                          color: '#64748b',
                          borderTop: '1px dashed #e2e8f0',
                          paddingTop: '0.3rem',
                          marginTop: '0.15rem',
                        }}>
                          {line.quantity !== undefined && (
                            <span>Qty: <strong style={{ color: '#334155' }}>{line.quantity}</strong></span>
                          )}
                          {line.rate !== undefined && (
                            <span>Rate: <strong style={{ color: '#334155' }}>{line.rate}</strong></span>
                          )}
                          {line.tax !== undefined && (
                            <span>Tax: <strong style={{ color: '#334155' }}>{line.tax}</strong></span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary Block if available */}
            {currentDetail.summary && currentDetail.summary.rows.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {currentDetail.summary.title && (
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    letterSpacing: '0.05em',
                  }}>
                    {currentDetail.summary.title}
                  </div>
                )}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                }}>
                  {currentDetail.summary.rows.map((row, rIdx) => (
                    <div
                      key={rIdx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: row.isBold ? '0.85rem' : '0.75rem',
                        fontWeight: row.isBold ? 700 : 500,
                        color: row.color || (row.isBold ? '#0f172a' : '#475569'),
                        borderTop: row.isBold ? '1px solid #e2e8f0' : 'none',
                        paddingTop: row.isBold ? '0.4rem' : '0',
                        marginTop: row.isBold ? '0.2rem' : '0',
                      }}
                    >
                      <span>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Actions Footer */}
          {currentDetail.actions && currentDetail.actions.length > 0 && (
            <div style={{
              borderTop: '1px solid #e2e8f0',
              padding: '0.75rem 0.85rem',
              backgroundColor: '#ffffff',
              display: 'flex',
              gap: '0.45rem',
              width: '100%',
              boxSizing: 'border-box',
              alignItems: 'center',
            }}>
              {currentDetail.actions.map((act, actIdx) => (
                <button
                  key={actIdx}
                  type="button"
                  onClick={() => {
                    act.onClick();
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: '0.6rem 0.4rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    border: act.variant === 'primary' ? 'none' : '1px solid #e2e8f0',
                    backgroundColor: act.variant === 'primary' ? '#2563eb' : (act.variant === 'danger' ? '#ef4444' : '#ffffff'),
                    color: (act.variant === 'primary' || act.variant === 'danger') ? '#ffffff' : '#334155',
                    boxShadow: act.variant === 'primary' ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  {act.icon}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.label}</span>
                </button>
              ))}
            </div>
          )}
        </MobileBottomBanner>
      )}

      {/* 7. Slide-Up Filter Bottom Banner */}
      {(filterOptions.length > 0 || dateFilter || customFiltersContent) && (
        <MobileBottomBanner
          isOpen={filterBannerOpen}
          onClose={() => setFilterBannerOpen(false)}
          title="Filter Records"
          subtitle="Customize dates and status filters"
          height="auto"
          maxHeight="82vh"
          headerRight={
            hasActiveFilter ? (
              <button
                type="button"
                onClick={() => {
                  onFilterChange?.('');
                  if (dateFilter?.onChange) dateFilter.onChange('');
                  if (dateFilter?.onCustomStartDateChange) dateFilter.onCustomStartDateChange('');
                  if (dateFilter?.onCustomEndDateChange) dateFilter.onCustomEndDateChange('');
                  setFilterBannerOpen(false);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Clear All
              </button>
            ) : undefined
          }
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            padding: '1rem',
            overflowY: 'auto',
          }}>
            {/* 1. Date Range Filter Section */}
            {dateFilter && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Filter by Date Range
                </div>

                {/* Preset Chips Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.45rem',
                }}>
                  {(dateFilter.options || DEFAULT_DATE_PRESETS).map((preset) => {
                    const isSelected = dateFilter.selectedValue === preset.value || (!dateFilter.selectedValue && preset.value === '');
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => dateFilter.onChange?.(preset.value)}
                        style={{
                          padding: '0.5rem 0.4rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          color: isSelected ? '#1d4ed8' : '#475569',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'none',
                        }}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Range Inputs */}
                {dateFilter.selectedValue === 'custom' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    backgroundColor: '#f8fafc',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    marginTop: '0.25rem',
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.customStartDate || ''}
                        onChange={(e) => dateFilter.onCustomStartDateChange?.(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.55rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          color: '#1e293b',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateFilter.customEndDate || ''}
                        onChange={(e) => dateFilter.onCustomEndDateChange?.(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.45rem 0.55rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          color: '#1e293b',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Status Filter Section */}
            {filterOptions.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Filter by status
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {filterOptions.map((opt) => {
                    const isSelected = selectedFilter === opt.value || (!selectedFilter && (opt.value === '' || opt.value === 'all'));
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          onFilterChange?.(opt.value);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.85rem',
                          borderRadius: '10px',
                          border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: isSelected ? '4.5px solid #2563eb' : '2px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease',
                          }} />
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#1d4ed8' : '#1e293b',
                          }}>
                            {opt.label}
                          </span>
                        </div>

                        {typeof opt.count === 'number' && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '1px 7px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                            color: isSelected ? '#1e40af' : '#64748b',
                          }}>
                            {opt.count}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Custom Filters Content */}
            {customFiltersContent}

            {/* Apply Button */}
            <button
              type="button"
              onClick={() => setFilterBannerOpen(false)}
              style={{
                marginTop: '0.25rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
            >
              Apply Filters
            </button>
          </div>
        </MobileBottomBanner>
      )}

      {/* 8. Floating Action Button (FAB) for Create */}
      {onCreate && (
        <button
          type="button"
          aria-label={createButtonLabel || 'Create new'}
          onClick={onCreate}
          style={{
            position: 'fixed',
            bottom: '76px',
            right: '18px',
            zIndex: 10001,
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
