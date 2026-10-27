import React from 'react';
import { Search, X, RefreshCw, MessageSquare } from 'lucide-react';
import { WhatsAppDataListProps, WhatsAppListItemData } from './WhatsAppDataList.types';
import { WhatsAppListItem } from './WhatsAppListItem';

export function WhatsAppDataListMobile<T = any>({
  items,
  renderItem,
  onItemClick,
  selectedId,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  searchPlaceholder = 'Search...',
  searchQuery,
  onSearchChange,
  filterPills,
  activeFilter,
  onFilterChange,
  headerTitle,
  headerActions,
  emptyIcon,
  emptyTitle = 'No conversations',
  emptySubtitle = 'No matching items found.',
  style,
  className,
}: WhatsAppDataListProps<T>) {
  const [internalSearch, setInternalSearch] = React.useState('');
  const currentSearch = searchQuery !== undefined ? searchQuery : internalSearch;

  const handleSearchChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const displayItems: WhatsAppListItemData[] = React.useMemo(() => {
    return items.map((item, index) => {
      if (renderItem) {
        return renderItem(item, index);
      }
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
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* 1. Mobile Search & Filter Header */}
      <div
        style={{
          padding: '8px 12px 6px 12px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #F0F2F5',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {headerTitle && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '17px',
                fontWeight: 700,
                color: '#111B21',
              }}
            >
              {headerTitle}
            </h2>
            {headerActions && <div>{headerActions}</div>}
          </div>
        )}

        {/* WhatsApp Mobile Rounded Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F0F2F5',
              borderRadius: '24px',
              padding: '6px 12px',
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
                fontSize: '14px',
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
                border: 'none',
                backgroundColor: '#F0F2F5',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#008069',
                flexShrink: 0,
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
                }}
              />
            </button>
          )}

          {!headerTitle && headerActions && (
            <div style={{ display: 'flex', alignItems: 'center' }}>{headerActions}</div>
          )}
        </div>

        {/* Horizontal Scrolling Filter Pills */}
        {filterPills && filterPills.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
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
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? '#E7FCE3' : '#F0F2F5',
                    color: isActive ? '#008069' : '#54656F',
                    cursor: 'pointer',
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
                        padding: '1px 5px',
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

      {/* 3. Items Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          backgroundColor: '#FFFFFF',
        }}
      >
        {displayItems.length === 0 && !isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60%',
              padding: '32px 16px',
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
          displayItems.map((item, index) => {
            const rawItem = items[index];
            const isSelected = selectedId !== undefined ? selectedId === item.id : false;
            return (
              <WhatsAppListItem
                key={item.id}
                data={item}
                isSelected={isSelected}
                isMobile={true}
                onClick={() => onItemClick(rawItem)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
