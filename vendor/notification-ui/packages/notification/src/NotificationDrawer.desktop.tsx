import React from 'react';
import { Notification } from './types';

interface NotificationDrawerDesktopProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  tabLimitExceeded: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  onNavigate?: (link: string) => void;
  sseActive: boolean;
  reconnectSSE: () => void;
  pushPermission: 'default' | 'granted' | 'denied';
  requestPushPermission: () => Promise<void>;
  unsubscribePush: () => Promise<void>;
}

export const NotificationDrawerDesktop: React.FC<NotificationDrawerDesktopProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  tabLimitExceeded,
  markAsRead,
  markAllAsRead,
  onNavigate,
  sseActive,
  reconnectSSE,
  pushPermission,
  requestPushPermission,
  unsubscribePush,
}) => {
  if (!isOpen) return null;

  const handleItemClick = (item: Notification) => {
    markAsRead(item.id);
    if (item.link && onNavigate) {
      onNavigate(item.link);
    } else if (item.link) {
      window.location.href = item.link;
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Notifications</h2>
            <p style={styles.subtitle}>You have {unreadCount} unread alerts</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: sseActive ? '#10b981' : '#f59e0b',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: '11px', color: '#888' }}>
                {sseActive ? 'Live Connected' : 'Disconnected'}
              </span>
              {!sseActive && (
                <button
                  onClick={reconnectSSE}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Push Notification Quick Settings Panel */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
            Push Notifications
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {pushPermission === 'granted' && (
              <>
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 500 }}>Active</span>
                <button
                  onClick={unsubscribePush}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Disable
                </button>
              </>
            )}
            {pushPermission === 'default' && (
              <button
                onClick={requestPushPermission}
                style={{
                  background: '#6366f1',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Enable / Subscribe
              </button>
            )}
            {pushPermission === 'denied' && (
              <span
                title="Browser notification permission is blocked. Reset permission in your browser address bar to enable."
                style={{ fontSize: '11px', color: '#ef4444', textDecoration: 'underline dotted', cursor: 'help' }}
              >
                Blocked
              </span>
            )}
          </div>
        </div>

        {/* Tab Ceiling Warning Banner */}
        {tabLimitExceeded && (
          <div style={styles.warningBanner}>
            <div style={styles.warningIcon}>⚠️</div>
            <div>
              <div style={styles.warningTitle}>Real-time updates paused</div>
              <div style={styles.warningText}>
                You have more than 5 tabs open. Close other tabs to resume live sync.
              </div>
            </div>
          </div>
        )}

        {/* Actions Row */}
        {notifications.length > 0 && (
          <div style={styles.actionsRow}>
            <button style={styles.actionLink} onClick={markAllAsRead}>
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div style={styles.listContainer}>
          {loading ? (
            <div style={styles.loader}>Loading your alerts...</div>
          ) : notifications.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔔</div>
              <h3>All caught up!</h3>
              <p style={{ color: '#888', marginTop: 4 }}>
                No notifications received yet.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  ...styles.item,
                  backgroundColor: item.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                }}
                onClick={() => handleItemClick(item)}
              >
                {!item.is_read && <div style={styles.unreadDot} />}
                <div style={styles.itemContent}>
                  <div style={styles.itemTitle}>{item.title}</div>
                  <div style={styles.itemBody}>{item.body}</div>
                  <div style={styles.itemTime}>
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  drawer: {
    width: '400px',
    height: '100%',
    backgroundColor: '#121214',
    color: '#e1e1e6',
    boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 600,
    background: 'linear-gradient(90deg, #ff7b00, #ffae00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#888',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: '28px',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  warningBanner: {
    backgroundColor: 'rgba(255, 123, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 123, 0, 0.25)',
    padding: '12px 16px',
    display: 'flex',
    gap: '12px',
    fontSize: '12px',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: '18px',
  },
  warningTitle: {
    fontWeight: 600,
    color: '#ff7b00',
  },
  warningText: {
    color: '#aaa',
    marginTop: 2,
  },
  actionsRow: {
    padding: '12px 24px 0 24px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  actionLink: {
    background: 'none',
    border: 'none',
    color: '#ff7b00',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: 0,
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 0',
  },
  loader: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  emptyState: {
    padding: '60px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  item: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    display: 'flex',
    gap: '12px',
    position: 'relative',
    transition: 'background-color 0.2s',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ff7b00',
    position: 'absolute',
    left: '10px',
    top: '22px',
    boxShadow: '0 0 8px #ff7b00',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#f5f5f5',
  },
  itemBody: {
    fontSize: '13px',
    color: '#aaa',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  itemTime: {
    fontSize: '11px',
    color: '#666',
    marginTop: '6px',
  },
};
