import React, { useState, useEffect } from 'react';
import { DataTable, Column, Button, useToast } from '@geeksman/core-ui';
import { waApiGet, waApiPost } from './WhatsAppIntegrationPage.desktop';

export interface WhatsAppMessageLog {
  id: string;
  tenant_code: string;
  connection_id: string;
  from_phone: string;
  to_phone: string;
  message_type: string;
  status: string;
  error_message?: string;
  sent_at: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
}

interface WhatsAppMessageLogPanelProps {
  connectionId?: string;
  fromPhone?: string;
}

export const WhatsAppMessageLogPanel: React.FC<WhatsAppMessageLogPanelProps> = ({ 
  connectionId: defaultConnectionId,
  fromPhone: defaultFromPhone,
}) => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Filters
  const [connectionId, setConnectionId] = useState<string>(defaultConnectionId || '');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fromFilter, setFromFilter] = useState<string>('');
  const [toFilter, setToFilter] = useState<string>('');

  useEffect(() => {
    if (defaultConnectionId) {
      setConnectionId(defaultConnectionId);
    }
  }, [defaultConnectionId]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = `/whatsapp/messages?page=${page}&limit=20`;
      const activeConn = defaultConnectionId || connectionId;
      if (activeConn) query += `&connection_id=${encodeURIComponent(activeConn)}`;
      if (statusFilter) query += `&status=${encodeURIComponent(statusFilter)}`;
      if (searchQuery) query += `&search=${encodeURIComponent(searchQuery)}`;
      if (fromFilter) query += `&from_phone=${encodeURIComponent(fromFilter)}`;
      if (toFilter) query += `&to_phone=${encodeURIComponent(toFilter)}`;

      const resp = await waApiGet(query);
      const data = resp.data?.data || resp.data;
      const logList = data?.logs ?? [];
      setLogs(logList);
      setTotal(data?.total ?? logList.length);
    } catch (err: any) {
      console.error('Failed to fetch WhatsApp message logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await waApiPost(`/whatsapp/messages/${encodeURIComponent(id)}/retry`);
      showToast('Manual message retry dispatched!', 'success');
      fetchLogs();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to retry message';
      showToast(msg, 'error');
    } finally {
      setRetryingId(null);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, connectionId, statusFilter, searchQuery, fromFilter, toFilter]);

  const columns: Column<WhatsAppMessageLog>[] = [
    {
      key: 'sent_at',
      label: 'Sent At',
      render: (_, row) => (
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>
          {row.sent_at ? new Date(row.sent_at).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'from_phone',
      label: 'Sender (From)',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>
            +{row.from_phone || row.connection_id}
          </span>
        </div>
      ),
    },
    {
      key: 'to_phone',
      label: 'Receiver (To)',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>
            +{row.to_phone}
          </span>
        </div>
      ),
    },
    {
      key: 'message_type',
      label: 'Type',
      render: (_, row) => (
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: '#334155', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
          {row.message_type || 'text'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const isSent = row.status === 'SENT' || row.status === 'DELIVERED';
        const isPermFailed = row.status === 'PERMANENTLY_FAILED';
        const isFailed = row.status === 'FAILED';

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              backgroundColor: isSent ? '#dcfce7' : isPermFailed ? '#fee2e2' : isFailed ? '#fef3c7' : '#f1f5f9',
              color: isSent ? '#15803d' : isPermFailed ? '#b91c1c' : isFailed ? '#b45309' : '#475569',
              border: `1px solid ${isSent ? '#bbf7d0' : isPermFailed ? '#fecaca' : isFailed ? '#fde68a' : '#e2e8f0'}`,
            }}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'retry_count',
      label: 'Retries',
      render: (_, row) => (
        <span style={{ fontSize: '0.8rem', color: row.retry_count > 0 ? '#b45309' : '#64748b', fontWeight: row.retry_count > 0 ? 600 : 400 }}>
          {row.retry_count ?? 0} / {row.max_retries ?? 3}
        </span>
      ),
    },
    {
      key: 'error_message',
      label: 'Error Detail',
      render: (_, row) => (
        <span style={{ fontSize: '0.75rem', color: row.error_message ? '#ef4444' : '#94a3b8', fontStyle: row.error_message ? 'normal' : 'italic' }}>
          {row.error_message || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      align: 'right',
      render: (_, row) => {
        const canRetry = row.status === 'FAILED' || row.status === 'PERMANENTLY_FAILED';
        if (!canRetry) return null;
        return (
          <Button
            variant="secondary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => handleRetry(row.id)}
            disabled={retryingId === row.id}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M23 4v6h-6"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {retryingId === row.id ? 'Retrying...' : 'Retry'}
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Outbound &amp; Inbound Message Audit Logs {defaultConnectionId ? `(${defaultConnectionId})` : ''}
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Detailed audit trails with separate sender &amp; receiver fields
          </span>
        </div>
        <Button variant="secondary" onClick={fetchLogs} disabled={loading} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </Button>
      </div>

      {/* Backend Filter Controls Toolbar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Search Keyword</label>
          <input
            type="text"
            placeholder="Search phone, payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#ffffff' }}
          >
            <option value="">All Statuses</option>
            <option value="SENT">SENT</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="FAILED">FAILED</option>
            <option value="PERMANENTLY_FAILED">PERMANENTLY_FAILED</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Sender Phone (From)</label>
          <input
            type="text"
            placeholder="Filter sender..."
            value={fromFilter}
            onChange={(e) => setFromFilter(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Receiver Phone (To)</label>
          <input
            type="text"
            placeholder="Filter receiver..."
            value={toFilter}
            onChange={(e) => setToFilter(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        onRefresh={fetchLogs}
        rowId={(row) => row.id}
      />
    </div>
  );
};
