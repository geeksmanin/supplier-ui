import React from 'react';
import { Notification } from './types';

interface NotificationDrawerMobileProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  tabLimitExceeded: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  onNavigate?: (link: string) => void;
}

export const NotificationDrawerMobile: React.FC<NotificationDrawerMobileProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  tabLimitExceeded,
  markAsRead,
  markAllAsRead,
  onNavigate,
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
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Mobile Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Notifications</h2>
            <p style={styles.subtitle}>{unreadCount} unread alerts</p>
          </div>
          <button style={styles.closeButton} onClick={onClose}>
            &times;
          </button>
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
            <button style={styles.actionButton} onClick={markAllAsRead}>
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
                  backgroundColor: item.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                }}
                onClick={() => handleItemClick(item)}
              >
                {!item.is_read && <div style={styles.unreadDot} />}
                <div style={styles.itemContent}>
                  <div style={styles.itemTitle}>{item.title}</div>
                  <div style={styles.itemBody}>{item.body}</div>
                  <div style={styles.itemTime}>
                    {new Date(item.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
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
    backgroundColor: '#121214',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '20px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
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
    margin: '2px 0 0 0',
    fontSize: '12px',
    color: '#888',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#e1e1e6',
    fontSize: '32px',
    cursor: 'pointer',
    padding: '0 8px',
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
  },
  actionsRow: {
    padding: '12px 16px 4px 16px',
    display: 'flex',
  },
  actionButton: {
    background: 'rgba(255, 123, 0, 0.08)',
    border: '1px solid rgba(255, 123, 0, 0.2)',
    borderRadius: '6px',
    color: '#ff7b00',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 16px',
    width: '100%',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '24px',
  },
  loader: {
    padding: '40px',
    textAlign: 'center',
    color: '#888',
  },
  emptyState: {
    padding: '80px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  item: {
    padding: '18px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    display: 'flex',
    gap: '12px',
    position: 'relative',
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ff7b00',
    position: 'absolute',
    left: '6px',
    top: '25px',
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
    marginTop: '6px',
    lineHeight: '1.4',
  },
  itemTime: {
    fontSize: '11px',
    color: '#666',
    marginTop: '8px',
  },
};
