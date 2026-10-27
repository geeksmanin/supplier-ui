import React from 'react';
import { Search, X, RefreshCw, MessageSquare } from 'lucide-react';
import { WhatsAppDataListProps, WhatsAppListItemData } from './WhatsAppDataList.types';
import { WhatsAppListItem } from './WhatsAppListItem';

export function WhatsAppDataListDesktop<T = any>({
  items,
  renderItem,
  onItemClick,
  selectedId,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  searchPlaceholder = 'Search conversations, tickets, orders...',
  searchQuery,
  onSearchChange,
  filterPills,
  activeFilter,
  onFilterChange,
  headerTitle,
  headerActions,
  emptyIcon,
  emptyTitle = 'No items found',
  emptySubtitle = 'There are no items matching your criteria.',
  style,
  className,
}: WhatsAppDataListProps<T>) {
  const [internalSearch, setInternalSearch] = React.useState('');
  const currentSearch = searchQuery !== undefined ? searchQuery : internalSearch;

  // Viewport windowing virtualization for 100,000+ items scale
  const ITEM_HEIGHT = 72;
  const OVERSCAN = 5;
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState(600);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setViewportHeight(el.clientHeight || 600);
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  // Convert raw items into standard WhatsAppListItemData
  const displayItems: WhatsAppListItemData[] = React.useMemo(() => {
    return items.map((item, index) => {
      if (renderItem) {
        return renderItem(item, index);
      }
      // Fallback if item already conforms to WhatsAppListItemData
      const anyItem = item as any;
      return {
        id: anyItem.id || String(index),
        title: anyItem.title || anyItem.name || 'Untitled',
        subtitle: anyItem.subtitle || anyItem.description || '',
        timestamp: anyItem.timestamp || anyItem.time,
        avatarText: anyItem.avatarText,
        avatarIcon: anyItem.avatarIcon,
        avatarBg: anyItem.avatarBg,
        isVerified: anyItem.isVerified,
        isAgent: anyItem.isAgent,
        badgePill: anyItem.badgePill,
        unreadCount: anyItem.unreadCount,
        isRead: anyItem.isRead,
        statusBadge: anyItem.statusBadge,
        priorityBadge: anyItem.priorityBadge,
        metadataLine: anyItem.metadataLine,
        raw: item,
      };
    });
  }, [items, renderItem]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E9EDEF',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* 1. Desktop Header Toolbar */}
      <div
        style={{
          padding: '12px 16px 8px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #F0F2F5',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        {headerTitle && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '2px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#111B21',
                letterSpacing: '-0.3px',
              }}
            >
              {headerTitle}
            </h2>
            {headerActions && <div>{headerActions}</div>}
          </div>
        )}

        {/* Search Bar + Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F0F2F5',
              borderRadius: '24px',
              padding: '6px 14px',
              gap: '8px',
            }}
          >
            <Search size={16} color="#667781" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '13.5px',
                color: '#111B21',
              }}
            />
            {currentSearch && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#667781',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="Refresh"
              style={{
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                borderRadius: '20px',
                padding: '7px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
                }}
              />
              <span>Refresh</span>
            </button>
          )}

          {!headerTitle && headerActions && (
            <div style={{ display: 'flex', alignItems: 'center' }}>{headerActions}</div>
          )}
        </div>

        {/* Filter Pills */}
        {filterPills && filterPills.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '2px',
            }}
          >
            {filterPills.map((pill) => {
              const isActive = activeFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => onFilterChange && onFilterChange(pill.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? '#E7FCE3' : '#F0F2F5',
                    color: isActive ? '#008069' : '#54656F',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {pill.icon}
                  <span>{pill.label}</span>
                  {typeof pill.count === 'number' && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isActive ? '#008069' : '#D1D5DB',
                        color: isActive ? '#FFFFFF' : '#374151',
                        borderRadius: '10px',
                        padding: '1px 6px',
                        lineHeight: 1.1,
                      }}
                    >
                      {pill.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Loading Bar */}
      {isLoading && (
        <div
          style={{
            height: '2px',
            width: '100%',
            backgroundColor: '#E2E8F0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#008069',
              width: '40%',
              position: 'absolute',
              animation: 'indeterminate-bar 1.2s infinite ease-in-out',
            }}
          />
        </div>
      )}

      {/* 3. Items List / Feed with Viewport Virtualization */}
      {(() => {
        const totalCount = displayItems.length;
        const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
        const endIndex = Math.min(totalCount, Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN);
        const topSpacerHeight = startIndex * ITEM_HEIGHT;
        const bottomSpacerHeight = Math.max(0, (totalCount - endIndex) * ITEM_HEIGHT);
        const visibleItems = displayItems.slice(startIndex, endIndex);

        return (
          <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              backgroundColor: '#FFFFFF',
              position: 'relative',
            }}
          >
            {totalCount === 0 && !isLoading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: '32px 20px',
                  textAlign: 'center',
                  color: '#667781',
                }}
              >
                {emptyIcon || <MessageSquare size={44} color="#94A3B8" style={{ marginBottom: '12px' }} />}
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', margin: '0 0 6px 0' }}>
                  {emptyTitle}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '280px' }}>
                  {emptySubtitle}
                </p>
              </div>
            ) : (
              <div style={{ width: '100%', position: 'relative' }}>
                {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px`, width: '100%' }} />}
                {visibleItems.map((item, visibleIdx) => {
                  const actualIndex = startIndex + visibleIdx;
                  const rawItem = items[actualIndex];
                  const isSelected = selectedId !== undefined ? selectedId === item.id : false;
                  return (
                    <WhatsAppListItem
                      key={item.id}
                      data={item}
                      isSelected={isSelected}
                      isMobile={false}
                      onClick={() => onItemClick(rawItem)}
                    />
                  );
                })}
                {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px`, width: '100%' }} />}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
