import React from 'react';
import { ShoppingBag, Calendar, Share2 } from 'lucide-react';
import { apiClient } from '@geeksman/core-ui';
import { Ticket } from '../../pages/Tickets';

export interface TicketDetailDesktopProps {
  selectedTicket: Ticket;
  setSelectedTicket: (ticket: Ticket | null) => void;
  refreshTickets: () => void;
  getStatusStyle: (status: Ticket['status']) => any;
  getPriorityStyle: (priority: Ticket['priority']) => any;
  formatDate: (dateStr: string) => string;
  setPreviewUrl: (url: string | null) => void;
  setPreviewTitle: (title: string) => void;
  getAbsoluteMediaUrl: (url: string) => string;
  getFileName: (url: string) => string;
  isImageUrl: (url: string) => boolean;
}

export const TicketDetailDesktop: React.FC<TicketDetailDesktopProps> = ({
  selectedTicket,
  setSelectedTicket,
  refreshTickets,
  getStatusStyle,
  getPriorityStyle,
  formatDate,
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
    <div style={{ padding: '1.5rem', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#17375E' }}>{selectedTicket.ticket_number}</span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0.15rem 0 0 0', color: '#1F2937', wordBreak: 'break-word' }}>{selectedTicket.subject}</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                } catch (err) {
                  console.error(err);
                }
              }}
              style={{
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.25rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: 'none',
                marginRight: '0.25rem'
              }}
            >
              Mark as Resolved
            </button>
          )}
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 900,
            padding: '0.25rem 0.6rem',
            borderRadius: '999px',
            ...getStatusStyle(selectedTicket.status)
          }}>{String(selectedTicket.status).toUpperCase()}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: getPriorityStyle(selectedTicket.priority).color }}>
            {String(selectedTicket.priority).toUpperCase()}
          </span>
          <button
            onClick={handleShare}
            style={{
              backgroundColor: copied ? '#10b981' : '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.25rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: 'none',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <Share2 size={12} />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>

      <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>
        {selectedTicket.description || 'No description provided.'}
      </p>

      {selectedTicket.images && selectedTicket.images.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
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
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: '#4b5563',
                  padding: '6px',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                  boxSizing: 'border-box'
                }}>
                  <span style={{ fontSize: '1.75rem', marginBottom: '4px' }}>📄</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                    {getFileName(img.url).substring(0, 14) || 'Attachment'}
                  </span>
                </div>
              ) : (
                <img
                  src={getAbsoluteMediaUrl(img.url)}
                  alt={`Attachment ${idx + 1}`}
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Meta details */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px dashed #e5e7eb', paddingTop: '0.75rem' }}>
        {selectedTicket.subscription_name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#6b7280' }}>
            <ShoppingBag size={14} />
            Reference: <strong style={{ color: '#111827' }}>{selectedTicket.subscription_name}</strong>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#6b7280' }}>
          <Calendar size={14} />
          Opened: <strong style={{ color: '#111827' }}>{formatDate(selectedTicket.created_at)}</strong>
        </div>
      </div>

      {/* Selected Products SNAPSHOT */}
      {selectedTicket.metadata?.products && selectedTicket.metadata.products.length > 0 && (
        <div style={{ marginTop: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginRight: '0.25rem' }}>Products Involved:</span>
          {selectedTicket.metadata.products.map((p: any, idx: number) => (
            <span key={idx} style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#f8fafc',
              color: '#4B5563',
              padding: '0.15rem 0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #E5E7EB'
            }}>{p.product_name}</span>
          ))}
        </div>
      )}
    </div>
  );
};
