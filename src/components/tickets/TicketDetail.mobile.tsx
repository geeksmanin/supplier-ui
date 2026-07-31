import React from 'react';
import { X, Share2 } from 'lucide-react';
import { apiClient } from '@geeksman/core-ui';
import { Ticket } from '../../pages/Tickets';

export interface TicketDetailMobileProps {
  selectedTicket: Ticket;
  setSelectedTicket: (ticket: Ticket | null) => void;
  refreshTickets: () => void;
  getStatusStyle: (status: Ticket['status']) => any;
  getPriorityStyle: (priority: Ticket['priority']) => any;
  setShowInfoDrawer: (val: boolean) => void;
  setPreviewUrl: (url: string | null) => void;
  setPreviewTitle: (title: string) => void;
  getAbsoluteMediaUrl: (url: string) => string;
  getFileName: (url: string) => string;
  isImageUrl: (url: string) => boolean;
}

export const TicketDetailMobile: React.FC<TicketDetailMobileProps> = ({
  selectedTicket,
  setSelectedTicket,
  refreshTickets,
  getStatusStyle,
  getPriorityStyle,
  setShowInfoDrawer,
  setPreviewUrl,
  setPreviewTitle,
  getAbsoluteMediaUrl,
  getFileName,
  isImageUrl
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/#/tickets?ticketId=${selectedTicket.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      height: '100%',
      overflow: 'hidden',
      textAlign: 'left'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '1.25rem 1rem',
        backgroundColor: '#17375E',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0
      }}>
        <span style={{ fontWeight: 800, fontSize: '1rem' }}>Ticket Details</span>
        <button
          onClick={() => setShowInfoDrawer(false)}
          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div style={{
        padding: '1.25rem 1rem',
        overflowY: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        textAlign: 'left'
      }}>
        {/* Meta details */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#17375E' }}>{selectedTicket.ticket_number}</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0.15rem 0 0.5rem 0', color: '#1F2937' }}>
            {selectedTicket.subject}
          </h3>
          
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              padding: '0.2rem 0.5rem',
              borderRadius: '10px',
              ...getStatusStyle(selectedTicket.status)
            }}>{selectedTicket.status.toUpperCase()}</span>

            <span style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              padding: '0.2rem 0.5rem',
              borderRadius: '10px',
              color: getPriorityStyle(selectedTicket.priority).color,
              backgroundColor: 'rgba(0,0,0,0.04)'
            }}>{selectedTicket.priority} Priority</span>
          </div>
        </div>

        {/* Description info */}
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem' }}>
          <h5 style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', color: '#6B7280', fontWeight: 800, textTransform: 'uppercase' }}>Description</h5>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.4 }}>
            {selectedTicket.description}
          </p>

          {selectedTicket.images && selectedTicket.images.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {selectedTicket.images.map((img: any, idx: number) => (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    setPreviewUrl(getAbsoluteMediaUrl(img.url));
                    setPreviewTitle(getFileName(img.url) || 'Attachment');
                  }}
                  key={idx}
                  style={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  {!isImageUrl(img.url) ? (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: '#4B5563',
                      padding: '4px',
                      textAlign: 'center',
                      wordBreak: 'break-all',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{ fontSize: '1.5rem', marginBottom: '2px' }}>📄</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                        {getFileName(img.url).substring(0, 10) || 'File'}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={getAbsoluteMediaUrl(img.url)}
                      alt={`Attachment ${idx + 1}`}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reference Docs */}
        {selectedTicket.subscription_name && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <h5 style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Reference Document</h5>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', fontWeight: 700 }}>
              {selectedTicket.subscription_name}
            </p>
          </div>
        )}

        {/* Products */}
        {selectedTicket.metadata?.products && selectedTicket.metadata.products.length > 0 && (
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <h5 style={{ margin: '0 0 0.4rem 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Affected Products</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {selectedTicket.metadata.products.map((prod: any, idx: number) => (
                <div key={idx} style={{
                  fontSize: '0.775rem',
                  backgroundColor: '#f8fafc',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  color: '#334155'
                }}>
                  <strong>{prod.product_name}</strong> <span style={{ color: '#64748b', fontSize: '0.675rem' }}>({prod.sku})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleShare}
            style={{
              width: '100%',
              backgroundColor: copied ? '#10b981' : '#17375E',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(23, 55, 94, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Share2 size={16} />
            {copied ? 'Link Copied!' : 'Share Ticket'}
          </button>
          {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
            <button
              onClick={async () => {
                try {
                  await apiClient.put(`/ticketing/customer/tickets/${selectedTicket.id}`, {
                    status: 'resolved'
                  });
                  if (refreshTickets) refreshTickets();
                  setSelectedTicket({
                    ...selectedTicket,
                    status: 'RESOLVED'
                  });
                  setShowInfoDrawer(false);
                } catch (err) {
                  console.error(err);
                }
              }}
              style={{
                width: '100%',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.75rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              ✓ Resolve Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
