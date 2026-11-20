import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { UIRegistry, resolveMediaUrl } from '@geeksman/core-ui';
import { Notification } from './types';
import { formatNotificationBody, isImageMedia } from './utils';

interface Toast {
  id: string;
  notification: Notification;
}

export const NotificationToastContainer: React.FC<{ onNavigate?: (link: string) => void }> = ({
  onNavigate,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Notification>;
      const notif = customEvent.detail;

      // Filter out intermediate processing import notifications
      if (notif && (notif.type as string) === 'import_status') {
        try {
          const metadata = typeof notif.metadata === 'string'
            ? JSON.parse(notif.metadata)
            : notif.metadata;
          if (metadata && metadata.status === 'processing') {
            return;
          }
        } catch (err) {
          // ignore
        }
      }

      // Suppress notification toast if already viewing this chat/ticket page
      const currentHash = window.location.hash;
      const currentPath = window.location.pathname;
      const activeTicketId = (window as any).activeTicketId;

      const isViewingActiveTicket = activeTicketId && notif.link && notif.link.includes(activeTicketId);
      const isViewingGeneralTickets = notif.link && (currentHash.includes(notif.link) || currentPath.includes(notif.link));

      if (isViewingActiveTicket || isViewingGeneralTickets || (notif.type as string) === 'silent_sync') {
        return;
      }

      // Suppress old/historical notifications to prevent bombarding on page load/connect
      const createdTime = new Date(notif.created_at || Date.now()).getTime();
      const now = Date.now();
      if (now - createdTime > 15000) { // older than 15 seconds
        return;
      }

      const newToast: Toast = {
        id: notif.id || Math.random().toString(),
        notification: notif,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove toast after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    };

    window.addEventListener('notification_received', handleNewNotification);
    return () => {
      window.removeEventListener('notification_received', handleNewNotification);
    };
  }, []);

  const handleToastClick = (toast: Toast) => {
    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    const notif = toast.notification;
    const navFn = onNavigate || ((path: string) => { window.location.href = path; });
    const handled = UIRegistry.openNotification(notif, navFn);
    if (!handled) {
      const link = notif.link;
      if (link && onNavigate) {
        onNavigate(link);
      } else if (link) {
        window.location.href = link;
      }
    }
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Render to portal inside document body
  return ReactDOM.createPortal(
    <div style={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={styles.toast}
          onClick={() => handleToastClick(toast)}
        >
          <div style={styles.accentBar} />
          <div style={styles.content}>
            <div style={styles.header}>
              <span style={styles.title}>{toast.notification.title}</span>
              <button style={styles.closeButton} onClick={(e) => handleClose(e, toast.id)}>
                &times;
              </button>
            </div>
            {(() => {
              let mediaUrl = '';
              let isImg = false;
              try {
                const meta = typeof toast.notification.metadata === 'string'
                  ? JSON.parse(toast.notification.metadata)
                  : toast.notification.metadata;
                mediaUrl = meta?.image || meta?.media_url || meta?.public_url || (toast.notification as any)?.image || (toast.notification as any)?.media_url || '';
                if (mediaUrl) {
                  isImg = Boolean(meta?.image) || isImageMedia(mediaUrl, meta?.media_type);
                }
              } catch (e) {}

              const cleanBody = formatNotificationBody(toast.notification.body);

              if (mediaUrl && isImg) {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <div style={{ ...styles.body, marginTop: 0, flex: 1 }}>{cleanBody}</div>
                    <img
                      src={resolveMediaUrl(mediaUrl)}
                      alt="Notification preview"
                      style={{
                        width: '38px',
                        height: '38px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                      }}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                );
              }
              return <div style={styles.body}>{cleanBody}</div>;
            })()}
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none', // allows clicks underneath container, only elements inside capture clicks
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  toast: {
    width: '320px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderRadius: '8px',
    display: 'flex',
    overflow: 'hidden',
    cursor: 'pointer',
    pointerEvents: 'auto',
    animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transition: 'all 0.2s',
  },
  accentBar: {
    width: '4px',
    backgroundColor: '#ff7b00',
    boxShadow: '0 0 12px rgba(255, 123, 0, 0.2)',
  },
  content: {
    flex: 1,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1e293b',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    marginLeft: '8px',
  },
  body: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px',
    lineHeight: '1.4',
  },
};
