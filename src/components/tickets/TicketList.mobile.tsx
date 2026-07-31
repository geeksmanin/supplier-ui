import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Ticket } from '../../pages/Tickets';

export interface TicketListMobileProps {
  loading: boolean;
  error: string | null;
  filteredTickets: Ticket[];
  drafts: Record<string, string>;
  getStatusStyle: (status: Ticket['status']) => any;
  formatDate: (dateStr: string) => string;
  handleSelectTicket: (ticket: Ticket) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  setSelectedReferenceType: (val: any) => void;
  setSelectedReferenceID: (val: string) => void;
  setShowModal: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  notifications?: any[];
}

const getPastelColor = (str: string) => {
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pastelColors = [
    { bg: '#e0f2fe', text: '#17375E' }, // light blue
    { bg: '#e6fffa', text: '#17375E' }, // mint
    { bg: '#f3e8ff', text: '#17375E' }, // lavender
    { bg: '#ffedd5', text: '#17375E' }  // peach
  ];
  return pastelColors[hash % pastelColors.length];
};

export const TicketListMobile: React.FC<TicketListMobileProps> = ({
  loading,
  error,
  filteredTickets = [],
  drafts,
  getStatusStyle,
  formatDate,
  handleSelectTicket,
  statusFilter,
  setStatusFilter,
  setSelectedReferenceType,
  setSelectedReferenceID,
  setShowModal,
  searchQuery,
  setSearchQuery,
  notifications
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Search Header */}
      <div style={{
        padding: '0.85rem 1rem 0.5rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E5E7EB'
      }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={16} />
          <input
            type="text"
            placeholder="Search tickets by subject, description, or ticket number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.25rem',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              background: '#f8fafc',
              fontSize: '0.825rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Horizontal Status Filter Scroller */}
      <div style={{
        padding: '0.5rem 1rem 0.75rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E5E7EB',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        display: 'flex',
        gap: '0.5rem'
      }}>
        {[
          { value: 'ALL', label: 'All' },
          { value: 'OPEN', label: 'Open' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'RESOLVED', label: 'Resolved' },
          { value: 'CLOSED', label: 'Closed' }
        ].map((opt) => {
          const isSelected = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '16px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: isSelected ? '#17375E' : '#e2e8f0',
                color: isSelected ? '#ffffff' : '#4b5563',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: 'none',
                display: 'inline-block'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Chat / Ticket List Area */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ffffff', paddingTop: 0 }}>
        {error && (
          <div style={{
            color: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            padding: '0.75rem',
            borderRadius: '8px',
            textAlign: 'center',
            margin: '1rem',
            fontSize: '0.85rem'
          }}>{error}</div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #E5E7EB', borderTop: '3px solid #17375E', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            No support chats found.
          </div>
        ) : (
          filteredTickets.map((ticket: Ticket) => {
            const statusStyle = getStatusStyle(ticket.status);
            const initName = ticket.subject.substring(0, 2).toUpperCase();
            const pastelStyle = getPastelColor(ticket.subject);
            
            const hasDraft = !!(drafts && drafts[ticket.id]);
            const previewText = (hasDraft && drafts)
              ? `Draft: ${drafts[ticket.id]}` 
              : (ticket.description || 'Tap to open chat');

            const unreadCount = (notifications || []).filter((n: any) => 
              !n.is_read && 
              n.type === 'chat_reply' && 
              n.link?.includes(ticket.id)
            ).length;

            return (
              <div 
                key={ticket.id} 
                onClick={() => handleSelectTicket(ticket)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  backgroundColor: hasDraft ? 'rgba(23, 55, 94, 0.02)' : 'transparent',
                  transition: 'background-color 0.15s'
                }}
              >
                {/* Status Circle Avatar */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: pastelStyle.bg,
                  color: pastelStyle.text,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(23, 55, 94, 0.08)',
                  flexShrink: 0
                }}>
                  {initName}
                </div>

                {/* Middle Text Details */}
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '0.925rem',
                      fontWeight: 800,
                      color: '#1F2937',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      marginRight: '0.5rem'
                    }}>
                      {ticket.subject}
                    </h4>
                    <span style={{ fontSize: '0.725rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {formatDate(ticket.created_at).split(',')[0]}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.825rem',
                      color: hasDraft ? '#0f766e' : '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      marginRight: '0.5rem',
                      fontWeight: hasDraft ? 600 : 400
                    }}>
                      {previewText}
                    </p>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {unreadCount > 0 && (
                        <span style={{
                          backgroundColor: '#10b981',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 900,
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'none'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 950,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '10px',
                        ...statusStyle,
                        whiteSpace: 'nowrap'
                      }}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button to Raise New Ticket */}
      <button 
        onClick={() => {
          setSelectedReferenceType('');
          setSelectedReferenceID('');
          setShowModal(true);
        }}
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#17375E',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(23, 55, 94, 0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99
        }}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};
