import React, { useState, useEffect } from 'react';
import { DataTable, Column, Button, useToast, apiClient } from '@geeksman/core-ui';
import { WhatsAppSendTestPanel } from './WhatsAppSendTestPanel';
import { WhatsAppPairingModal } from './WhatsAppPairingModal';
import { WhatsAppDetailModal } from './WhatsAppDetailModal';
import { WhatsApp3DIcon } from './WhatsApp3DIcon';

export interface WhatsAppConnectionInfo {
  connection_id: string;
  phone_number: string;
  display_name?: string;
  status: string;
  last_seen_at?: string;
}

export function normalizeWaEndpoint(endpoint: string): string {
  let clean = endpoint.replace(/^\/api\/v1/, '');
  if (!clean.startsWith('/')) clean = '/' + clean;

  if (clean.startsWith('/whatsapp')) {
    return `/notification${clean}`;
  }
  if (!clean.startsWith('/notification/whatsapp')) {
    return `/notification/whatsapp${clean}`;
  }
  return clean;
}

export async function waApiGet(endpoint: string) {
  const primary = normalizeWaEndpoint(endpoint);
  try {
    return await apiClient.get(primary);
  } catch (err: any) {
    if (err.response?.status === 404) {
      const direct = primary.replace('/notification/whatsapp', '/whatsapp');
      if (direct !== primary) {
        try {
          return await apiClient.get(direct);
        } catch (err2: any) {
          if (err2.response?.status !== 404) throw err2;
        }
      }
    }
    throw err;
  }
}

export async function waApiPost(endpoint: string, data?: any) {
  const primary = normalizeWaEndpoint(endpoint);
  try {
    return await apiClient.post(primary, data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      const direct = primary.replace('/notification/whatsapp', '/whatsapp');
      if (direct !== primary) {
        try {
          return await apiClient.post(direct, data);
        } catch (err2: any) {
          if (err2.response?.status !== 404) throw err2;
        }
      }
    }
    throw err;
  }
}

export async function waApiDelete(endpoint: string) {
  const primary = normalizeWaEndpoint(endpoint);
  try {
    return await apiClient.delete(primary);
  } catch (err: any) {
    if (err.response?.status === 404) {
      const direct = primary.replace('/notification/whatsapp', '/whatsapp');
      if (direct !== primary) {
        try {
          return await apiClient.delete(direct);
        } catch (err2: any) {
          if (err2.response?.status !== 404) throw err2;
        }
      }
    }
    throw err;
  }
}


export const WhatsAppIntegrationPageDesktop: React.FC = () => {
  const { showToast } = useToast();
  const [connections, setConnections] = useState<WhatsAppConnectionInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);

  const [selectedConnection, setSelectedConnection] = useState<WhatsAppConnectionInfo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const resp = await waApiGet('/whatsapp/connections');
      const rawList = resp.data?.data?.connections ?? resp.data?.connections ?? [];
      const connectionList = Array.isArray(rawList) ? rawList : [];
      if (connectionList.length > 0) {
        setConnections(connectionList);
      } else {
        const statusResp = await waApiGet('/whatsapp/status');
        const st = statusResp.data?.data || statusResp.data;
        if (st && st.status === 'CONNECTED') {
          setConnections([
            {
              connection_id: `default:${st.phone || 'linked'}`,
              phone_number: st.phone || 'Active Device',
              display_name: st.alias || 'Primary',
              status: 'CONNECTED',
            },
          ]);
        } else {
          setConnections([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch connections:', err);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    setDisconnectingId(connectionId);
    try {
      await waApiPost(`/whatsapp/disconnect?connection_id=${encodeURIComponent(connectionId)}`);
      showToast('Disconnected connection and unlinked from phone', 'success');
      fetchConnections();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to disconnect connection';
      showToast(errMsg, 'error');
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleReconnect = async (connectionId: string) => {
    setReconnectingId(connectionId);
    try {
      await waApiPost(`/whatsapp/reconnect?connection_id=${encodeURIComponent(connectionId)}`);
      showToast('Reconnected WhatsApp session successfully', 'success');
      fetchConnections();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to reconnect session';
      showToast(errMsg, 'error');
    } finally {
      setReconnectingId(null);
    }
  };

  const handleDelete = async (connectionId: string) => {
    setDeletingId(connectionId);
    setConfirmDeleteId(null);
    try {
      await waApiDelete(`/whatsapp/connections/${encodeURIComponent(connectionId)}`);
      showToast('Connection deleted and device keys purged', 'success');
      fetchConnections();
    } catch (err: any) {
      showToast('Failed to delete connection', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const filteredConnections = connections.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (c.phone_number && c.phone_number.toLowerCase().includes(term)) ||
      (c.display_name && c.display_name.toLowerCase().includes(term)) ||
      (c.connection_id && c.connection_id.toLowerCase().includes(term)) ||
      (c.status && c.status.toLowerCase().includes(term))
    );
  });

  const columns: Column<WhatsAppConnectionInfo>[] = [
    {
      key: 'phone_number',
      label: 'Phone Number',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <WhatsApp3DIcon size={22} />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            +{row.phone_number || row.connection_id}
          </span>
        </div>
      ),
    },
    {
      key: 'display_name',
      label: 'Name / Alias',
      render: (_, row) => (
        <span style={{ color: row.display_name ? '#334155' : '#94a3b8', fontWeight: row.display_name ? 600 : 400 }}>
          {row.display_name || '—'}
        </span>
      ),
    },
    {
      key: 'connection_id',
      label: 'Connection ID',
      render: (_, row) => (
        <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
          {row.connection_id}
        </code>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const isConnected = row.status === 'CONNECTED';
        const isPairing = row.status === 'WAITING_FOR_QR' || row.status === 'PAIRING';
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: isConnected ? '#dcfce7' : isPairing ? '#dbeafe' : '#fee2e2',
              color: isConnected ? '#15803d' : isPairing ? '#1d4ed8' : '#b91c1c',
              border: `1px solid ${isConnected ? '#bbf7d0' : isPairing ? '#bfdbfe' : '#fecaca'}`,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isConnected ? '#16a34a' : isPairing ? '#2563eb' : '#ef4444' }} />
            {isConnected ? 'Connected' : isPairing ? 'Pairing...' : 'Disconnected'}
          </span>
        );
      },
    },
    {
      key: 'last_seen_at',
      label: 'Last Seen',
      render: (_, row) => (
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
          {row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, row) => {
        const isConnected = row.status === 'CONNECTED';
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              onClick={() => {
                setSelectedConnection(row);
                setIsDetailOpen(true);
              }}
            >
              👁️ View
            </Button>
            {!isConnected && (
              <Button
                variant="secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                onClick={() => handleReconnect(row.connection_id)}
                disabled={reconnectingId === row.connection_id}
              >
                {reconnectingId === row.connection_id ? 'Connecting...' : '🔄 Reconnect'}
              </Button>
            )}
            {isConnected && (
              <Button
                variant="secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#b91c1c', borderColor: '#fecaca' }}
                onClick={() => handleDisconnect(row.connection_id)}
                disabled={disconnectingId === row.connection_id}
              >
                {disconnectingId === row.connection_id ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            )}
            <Button
              variant="danger"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              onClick={() => setConfirmDeleteId(row.connection_id)}
              disabled={deletingId === row.connection_id}
            >
              {deletingId === row.connection_id ? '...' : '🗑️ Delete'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Standard Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <WhatsApp3DIcon size={44} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Integrations — WhatsApp Connection Hub</h1>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Manage multi-number WhatsApp Web connections, view device logs, &amp; dispatch notifications</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="secondary" onClick={fetchConnections} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh Status'}
          </Button>
          <Button variant="primary" onClick={() => setIsPairingOpen(true)}>
            ➕ Create New Connection
          </Button>
        </div>
      </div>

      {/* Inline confirm-delete banner */}
      {confirmDeleteId && (
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem', color: '#7c2d12', fontWeight: 600 }}>
            ⚠️ Delete <code style={{ backgroundColor: '#ffe4cc', padding: '2px 6px', borderRadius: '4px' }}>{confirmDeleteId}</code>? This will purge the device keys from disk — the connection cannot be recovered.
          </span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <Button variant="secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId === confirmDeleteId}>
              {deletingId === confirmDeleteId ? 'Deleting...' : '🗑️ Confirm Delete'}
            </Button>
          </div>
        </div>
      )}

      {/* Standard DataTable Section */}
      <DataTable
        columns={columns}
        data={filteredConnections}
        loading={loading}
        searchVal={searchTerm}
        setSearchVal={setSearchTerm}
        searchPlaceholder="Search connection, alias, or phone..."
        onRefresh={fetchConnections}
        actionButton={
          <Button variant="primary" onClick={() => setIsPairingOpen(true)}>
            ➕ Create New Connection
          </Button>
        }
        rowId={(row) => row.connection_id}
      />

      {/* Outbound Send Test Console */}
      <WhatsAppSendTestPanel connections={connections} />

      {/* QR Pairing Modal */}
      <WhatsAppPairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        onSuccess={fetchConnections}
      />

      {/* Connection Detail View Modal */}
      <WhatsAppDetailModal
        connection={selectedConnection}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedConnection(null);
        }}
        onRefresh={fetchConnections}
        onDisconnect={handleDisconnect}
        onReconnect={handleReconnect}
        onDelete={(id) => {
          setIsDetailOpen(false);
          setConfirmDeleteId(id);
        }}
      />
    </div>
  );
};
