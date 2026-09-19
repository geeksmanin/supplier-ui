import React, { useState, useEffect } from 'react';
import { DataTable, Column, Button, useToast, apiClient } from '@geeksman/core-ui';
import { WhatsAppSendTestPanel } from './WhatsAppSendTestPanel';
import { WhatsAppMessageLogPanel } from './WhatsAppMessageLogPanel';
import { WhatsAppPairingModal } from './WhatsAppPairingModal';

import { WhatsAppDetailModal } from './WhatsAppDetailModal';
import { WhatsAppDetailView } from './WhatsAppDetailView';
import { WhatsApp3DIcon } from './WhatsApp3DIcon';
import { IntegrationsIcon } from './IntegrationsIcon';

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
  const [activeTab, setActiveTab] = useState<'connections' | 'logs' | 'test'>('connections');

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

  const [pairingPhone, setPairingPhone] = useState<string>('');

  const handleReconnect = async (connectionId: string, phone?: string) => {
    setReconnectingId(connectionId);
    try {
      await waApiPost(`/whatsapp/reconnect?connection_id=${encodeURIComponent(connectionId)}`);
      showToast('Reconnected WhatsApp session successfully', 'success');
      fetchConnections();
    } catch (err: any) {
      const targetPhone = phone || connectionId;
      showToast('Session cannot reconnect automatically. Opening QR Code for re-linking...', 'error');
      setPairingPhone(targetPhone);
      setIsPairingOpen(true);
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
          <IntegrationsIcon size={22} />
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              title="View Connection Details"
              onClick={() => setSelectedConnection(row)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            {!isConnected && (
              <>
                <button
                  type="button"
                  title="Reconnect Session"
                  onClick={() => handleReconnect(row.connection_id, row.phone_number)}
                  disabled={reconnectingId === row.connection_id}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                </button>
                <button
                  type="button"
                  title="Re-pair QR Code"
                  onClick={() => {
                    setPairingPhone(row.phone_number || row.connection_id);
                    setIsPairingOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0284c7',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <rect x="7" y="7" width="3" height="3"/>
                    <rect x="14" y="7" width="3" height="3"/>
                    <rect x="7" y="14" width="3" height="3"/>
                  </svg>
                </button>
              </>
            )}
            {isConnected && (
              <button
                type="button"
                title="Disconnect Session"
                onClick={() => handleDisconnect(row.connection_id)}
                disabled={disconnectingId === row.connection_id}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}
            <button
              type="button"
              title="Delete Connection"
              onClick={() => setConfirmDeleteId(row.connection_id)}
              disabled={deletingId === row.connection_id}
              style={{
                backgroundColor: '#fef2f2',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  if (selectedConnection) {
    return (
      <WhatsAppDetailView
        connection={selectedConnection}
        onBack={() => setSelectedConnection(null)}
        onRefresh={fetchConnections}
        onDisconnect={handleDisconnect}
        onReconnect={handleReconnect}
        onDelete={(id) => {
          setSelectedConnection(null);
          setConfirmDeleteId(id);
        }}
      />
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tabbed Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #e2e8f0', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('connections')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'connections' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'connections' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          <span>Connections</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: activeTab === 'connections' ? '#dbeafe' : '#f1f5f9', color: activeTab === 'connections' ? '#1e40af' : '#475569', padding: '1px 7px', borderRadius: '10px' }}>
            {connections.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'logs' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'logs' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Message Audit Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('test')}
          style={{
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'test' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'test' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span>Test Console</span>
        </button>
      </div>

      {activeTab === 'connections' && (
        <>
          {/* Unofficial Integration Disclaimer Banner */}
          <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fef08a', borderRadius: '10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#854d0e', display: 'block' }}>Unofficial Integration Disclaimer</span>
              <span style={{ fontSize: '0.8rem', color: '#a16207' }}>
                This integration operates via the community-driven WhatsApp Web companion protocol (whatsmeow). It is not an official Meta Cloud API service. Please use responsibly and ensure compliance with WhatsApp Terms of Service.
              </span>
            </div>
          </div>

          {/* Inline confirm-delete banner */}
          {confirmDeleteId && (
            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#7c2d12', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Delete <code style={{ backgroundColor: '#ffe4cc', padding: '2px 6px', borderRadius: '4px' }}>{confirmDeleteId}</code>? This will purge the device keys from disk — the connection cannot be recovered.
              </span>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <Button variant="secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setConfirmDeleteId(null)}>
                  Cancel
                </Button>
                <Button variant="danger" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId === confirmDeleteId}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {deletingId === confirmDeleteId ? 'Deleting...' : 'Confirm Delete'}
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
            onRowClick={(row) => setSelectedConnection(row)}
            actionButton={
              <Button variant="primary" onClick={() => setIsPairingOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create New Connection
              </Button>
            }
            rowId={(row) => row.connection_id}
          />
        </>
      )}

      {activeTab === 'logs' && (
        <WhatsAppMessageLogPanel />
      )}

      {activeTab === 'test' && (
        <WhatsAppSendTestPanel connections={connections} />
      )}

      {/* QR Pairing Modal */}
      <WhatsAppPairingModal
        isOpen={isPairingOpen}
        initialPhone={pairingPhone}
        initialPairing={!!pairingPhone}
        onClose={() => {
          setIsPairingOpen(false);
          setPairingPhone('');
        }}
        onSuccess={() => {
          setIsPairingOpen(false);
          setPairingPhone('');
          fetchConnections();
        }}
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
