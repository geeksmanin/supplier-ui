import React, { useState, useEffect } from 'react';
import { Button, useToast, apiClient } from '@geeksman/core-ui';
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
      if (resp.data && (resp.data.connections || resp.data.data?.connections)) {
        setConnections(resp.data.connections || resp.data.data?.connections);
      } else {
        const statusResp = await waApiGet('/whatsapp/status');
        if (statusResp.data && statusResp.data.status === 'CONNECTED') {
          setConnections([
            {
              connection_id: `default:${statusResp.data.phone || 'linked'}`,
              phone_number: statusResp.data.phone || 'Active Device',
              status: 'CONNECTED',
            },
          ]);
        } else {
          setConnections([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch connections:', err);
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

      {/* DataList / Table Section */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <WhatsApp3DIcon size={26} />
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                WhatsApp Connections ({filteredConnections.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Active sessions &amp; saved credentials persisted in Tenant Database
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '280px' }}>
            <input
              type="text"
              placeholder="🔍 Search connection, alias, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
              }}
            />
          </div>
        </div>

        {filteredConnections.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <WhatsApp3DIcon size={48} />
            <span style={{ fontWeight: 600, color: '#1e293b' }}>
              {searchTerm ? 'No connections matching search' : 'No WhatsApp numbers currently connected'}
            </span>
            <span style={{ fontSize: '0.82rem' }}>
              Click "Create New Connection" to generate a pairing QR code for your device
            </span>
            <Button variant="primary" onClick={() => setIsPairingOpen(true)}>
              ➕ Create New Connection
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 14px' }}>Phone Number</th>
                  <th style={{ padding: '12px 14px' }}>Name / Alias</th>
                  <th style={{ padding: '12px 14px' }}>Connection ID</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Last Seen</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConnections.map((c, idx) => {
                  const isConnected = c.status === 'CONNECTED';
                  const isPairing = c.status === 'WAITING_FOR_QR' || c.status === 'PAIRING';
                  return (
                    <tr
                      key={c.connection_id || idx}
                      id={`row-${c.connection_id}`}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <WhatsApp3DIcon size={22} />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            +{c.phone_number || c.connection_id}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px', color: '#334155', fontWeight: 600 }}>
                        {c.display_name || <span style={{ color: '#94a3b8', fontWeight: 400 }}>—</span>}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontWeight: 600 }}>
                          {c.connection_id}
                        </code>
                      </td>
                      <td style={{ padding: '14px' }}>
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
                      </td>
                      <td style={{ padding: '14px', color: '#64748b', fontSize: '0.8rem' }}>
                        {c.last_seen_at ? new Date(c.last_seen_at).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Button
                            variant="secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => {
                              setSelectedConnection(c);
                              setIsDetailOpen(true);
                            }}
                          >
                            👁️ View
                          </Button>
                          {!isConnected && (
                            <Button
                              variant="secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                              onClick={() => handleReconnect(c.connection_id)}
                              disabled={reconnectingId === c.connection_id}
                            >
                              {reconnectingId === c.connection_id ? 'Connecting...' : '🔄 Reconnect'}
                            </Button>
                          )}
                          {isConnected && (
                            <Button
                              variant="secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#b91c1c', borderColor: '#fecaca' }}
                              onClick={() => handleDisconnect(c.connection_id)}
                              disabled={disconnectingId === c.connection_id}
                            >
                              {disconnectingId === c.connection_id ? 'Disconnecting...' : 'Disconnect'}
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => setConfirmDeleteId(c.connection_id)}
                            disabled={deletingId === c.connection_id}
                          >
                            {deletingId === c.connection_id ? '...' : '🗑️ Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
