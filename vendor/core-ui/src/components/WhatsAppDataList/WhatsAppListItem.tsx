import React from 'react';
import { CheckCheck } from 'lucide-react';
import { WhatsAppListItemData } from './WhatsAppDataList.types';

export interface WhatsAppListItemProps {
  data: WhatsAppListItemData;
  isSelected?: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

export const WhatsAppListItem: React.FC<WhatsAppListItemProps> = ({
  data,
  isSelected = false,
  onClick,
  isMobile = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const isHighlighted = isSelected;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setIsActive(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '10px 14px' : '10px 16px',
        backgroundColor: isHighlighted
          ? '#F0F2F5'
          : isHovered
          ? '#F5F6F6'
          : '#FFFFFF',
        cursor: 'pointer',
        borderLeft: isHighlighted && !isMobile ? '4px solid #008069' : '4px solid transparent',
        transition: 'background-color 0.12s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.08s ease',
        transform: isActive && isMobile ? 'scale(0.99)' : 'none',
        userSelect: 'none',
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* 1. Left Avatar */}
      <div style={{ position: 'relative', flexShrink: 0, marginRight: '14px' }}>
        <div
          style={{
            width: isMobile ? '46px' : '48px',
            height: isMobile ? '46px' : '48px',
            borderRadius: '50%',
            backgroundColor: data.avatarBg || '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#111B21',
            fontWeight: 700,
            fontSize: isMobile ? '15px' : '16px',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          {data.avatarIcon ? (
            data.avatarIcon
          ) : (
            <span>{data.avatarText || data.title.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        {/* Verified Blue Tick badge if verified */}
        {data.isVerified && (
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              padding: '1px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="#007AFF"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 2. Middle & Right Info Area */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '3px',
          paddingBottom: '10px',
          borderBottom: '1px solid #F0F2F5',
        }}
      >
        {/* Line 1: Title + Badges + Timestamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              minWidth: 0,
              flex: 1,
            }}
          >
            <span
              style={{
                fontSize: isMobile ? '15px' : '15px',
                fontWeight: (data.unreadCount || 0) > 0 ? 700 : 600,
                color: '#111B21',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
              }}
            >
              {data.title}
            </span>

            {data.badgePill && (
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#007AFF',
                  backgroundColor: 'rgba(0, 122, 255, 0.08)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid rgba(0, 122, 255, 0.2)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  flexShrink: 0,
                }}
              >
                {data.badgePill}
              </span>
            )}
          </div>

          {data.timestamp && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: (data.unreadCount || 0) > 0 ? 600 : 400,
                color: (data.unreadCount || 0) > 0 ? '#25D366' : '#667781',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {data.timestamp}
            </span>
          )}
        </div>

        {/* Line 2: Subtitle / Snippet + Status / Priority Badge / Unread */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              flex: 1,
              gap: '4px',
            }}
          >
            {data.isRead && !data.isAgent && (
              <CheckCheck
                size={16}
                color="#53BDEB"
                style={{ flexShrink: 0, marginRight: '2px' }}
              />
            )}
            <span
              style={{
                fontSize: isMobile ? '13px' : '13px',
                color: '#667781',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
            >
              {data.subtitle || 'No recent messages'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {data.priorityBadge && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  color: data.priorityBadge.color || '#991B1B',
                  backgroundColor: data.priorityBadge.bg || '#FEE2E2',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.priorityBadge.label}
              </span>
            )}

            {data.statusBadge && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  color: data.statusBadge.color || '#0F5132',
                  backgroundColor: data.statusBadge.bg || '#D1E7DD',
                  whiteSpace: 'nowrap',
                }}
              >
                {data.statusBadge.label}
              </span>
            )}

            {(data.unreadCount || 0) > 0 && (
              <span
                style={{
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  minWidth: '18px',
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {data.unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Optional Line 3: Extra Metadata (e.g. ticket number, order reference, tags) */}
        {data.metadataLine && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: '#8696A0',
              marginTop: '1px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.metadataLine}
          </div>
        )}
      </div>
    </div>
  );
};
