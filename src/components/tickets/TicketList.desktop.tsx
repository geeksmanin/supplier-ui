import React from 'react';
import { Select } from '@geeksman/core-ui';
import { Search, RefreshCw } from 'lucide-react';
import { Ticket } from '../../pages/Tickets';

export interface TicketListDesktopProps {
  tickets: Ticket[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  refreshTickets: () => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  dateRangeFilter: string;
  setDateRangeFilter: (val: any) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  setShowCreatePanel: (val: boolean) => void;
  showCreatePanel: boolean;
  getStatusStyle: (status: Ticket['status']) => any;
  formatDate: (dateStr: string) => string;
  notifications?: any[];
}

export const TicketListDesktop: React.FC<TicketListDesktopProps> = ({
  tickets,
  loading,
  searchQuery,
  setSearchQuery,
  refreshTickets,
  statusFilter,
  setStatusFilter,
  dateRangeFilter,
  setDateRangeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  selectedTicket,
  setSelectedTicket,
  setShowCreatePanel,
  showCreatePanel,
  getStatusStyle,
  formatDate,
  notifications
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      minHeight: 0
    }}>
      {/* Search & Filters */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={16} />
            <input
              type="text"
              placeholder="Search ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                background: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={refreshTickets}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '0.75rem',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4b5563',
              transition: 'background-color 0.2s'
            }}
            title="Refresh Tickets"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Status</label>
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as string)}
              options={[
                { value: 'ALL', label: 'All' },
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' }
              ]}
              style={{ fontSize: '0.8rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Date Range</label>
            <Select
              value={dateRangeFilter}
              onChange={(val) => setDateRangeFilter(val as any)}
              options={[
                { value: 'ALL', label: 'All Time' },
                { value: 'THIS_WEEK', label: 'This Week' },
                { value: 'THIS_MONTH', label: 'This Month' },
                { value: 'THIS_YEAR', label: 'This Year' },
                { value: 'CUSTOM', label: 'Custom Date' }
              ]}
              style={{ fontSize: '0.8rem' }}
            />
          </div>
        </div>

        {dateRangeFilter === 'CUSTOM' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af' }}>Start</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  outline: 'none',
                  color: '#1e293b'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af' }}>End</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  outline: 'none',
                  color: '#1e293b'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tickets List Scroll Container */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        boxShadow: 'none',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        flex: 1,
        overflowY: 'auto'
      }}>
        {loading && <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Loading tickets...</div>}

        {!loading && (() => {
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          startOfWeek.setHours(0, 0, 0, 0);

          const nowMonth = new Date();
          const startOfMonth = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1);

          const nowYear = new Date();
          const startOfYear = new Date(nowYear.getFullYear(), 0, 1);

          const filtered = tickets.filter((t: Ticket) => {
            const query = searchQuery.toLowerCase().trim();
            const displayTicketNumber = t.ticket_number || '';
            const subject = (t.subject || '').toLowerCase();
            const description = (t.description || '').toLowerCase();
            const ticketId = (t.id || '').toLowerCase();
            const subName = (t.subscription_name || '').toLowerCase();

            const refStr = `ref: ${subName}`;
            const refSpaceStr = `ref ${subName}`;

            const matchesSearch = !query ||
              displayTicketNumber.toLowerCase().includes(query) ||
              ticketId.includes(query) ||
              subject.includes(query) ||
              description.includes(query) ||
              subName.includes(query) ||
              refStr.includes(query) ||
              refSpaceStr.includes(query);
            const matchesStatus = statusFilter === 'ALL' || String(t.status).toUpperCase() === statusFilter;

            let matchesDate = true;
            if (t.created_at) {
              const tDate = new Date(t.created_at);
              if (dateRangeFilter === 'THIS_WEEK') {
                matchesDate = tDate >= startOfWeek;
              } else if (dateRangeFilter === 'THIS_MONTH') {
                matchesDate = tDate >= startOfMonth;
              } else if (dateRangeFilter === 'THIS_YEAR') {
                matchesDate = tDate >= startOfYear;
              } else if (dateRangeFilter === 'CUSTOM') {
                if (customStartDate) {
                  matchesDate = matchesDate && tDate >= new Date(customStartDate + 'T00:00:00');
                }
                if (customEndDate) {
                  matchesDate = matchesDate && tDate <= new Date(customEndDate + 'T23:59:59');
                }
              }
            }
            return matchesSearch && matchesStatus && matchesDate;
          });

          const unassigned = filtered.filter((t: any) => !t.assigned_staff_id || t.assigned_staff_id === '' || t.assigned_staff_id === '00000000-0000-0000-0000-000000000000');
          const assigned = filtered.filter((t: any) => t.assigned_staff_id && t.assigned_staff_id !== '' && t.assigned_staff_id !== '00000000-0000-0000-0000-000000000000');

          if (filtered.length === 0) {
            return <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>No tickets found matching filters.</div>;
          }

          const renderTicketCard = (ticket: Ticket) => {
            const isSelected = selectedTicket?.id === ticket.id && !showCreatePanel;
            const unreadCount = (notifications || []).filter((n: any) =>
              !n.is_read &&
              n.type === 'chat_reply' &&
              n.link?.includes(ticket.id)
            ).length;

            return (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowCreatePanel(false);
                }}
                style={{
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: isSelected ? '1.5px solid #17375E' : '1px solid #E5E7EB',
                  backgroundColor: isSelected ? 'rgba(23, 55, 94, 0.02)' : '#fff',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#17375E' }}>{ticket.ticket_number}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                      fontWeight: 900,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '999px',
                      ...getStatusStyle(ticket.status)
                    }}>{String(ticket.status).toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1F2937', marginBottom: '0.25rem' }}>{ticket.subject}</div>
                {ticket.subscription_name && <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Ref: {ticket.subscription_name}</div>}
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>Date: {formatDate(ticket.created_at).split(',')[0]}</div>
              </div>
            );
          };

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {unassigned.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                    Unassigned ({unassigned.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {unassigned.map(renderTicketCard)}
                  </div>
                </div>
              )}

              {assigned.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803d' }}></span>
                    Assigned ({assigned.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {assigned.map(renderTicketCard)}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
