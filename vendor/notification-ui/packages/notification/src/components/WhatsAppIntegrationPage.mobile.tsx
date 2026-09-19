import React, { useState, useEffect } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { WhatsAppSendTestPanel } from './WhatsAppSendTestPanel';
import { WhatsAppMessageLogPanel } from './WhatsAppMessageLogPanel';
import { WhatsAppPairingModal } from './WhatsAppPairingModal';
import { WhatsApp3DIcon } from './WhatsApp3DIcon';
import { waApiGet, waApiPost, waApiDelete, WhatsAppConnectionInfo } from './WhatsAppIntegrationPage.desktop';

export const WhatsAppIntegrationPageMobile: React.FC = () => {
  const { showToast } = useToast();
  const [connections, setConnections] = useState<WhatsAppConnectionInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connections' | 'logs' | 'test'>('connections');

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const resp = await waApiGet('/whatsapp/connections');
      if (resp.data && (resp.data.connections || resp.data.data?.connections)) {
        setConnections(resp.data.connections || resp.data.data?.connections);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await waApiPost(`/whatsapp/disconnect?connection_id=${encodeURIComponent(connectionId)}`);
      showToast('Disconnected and unlinked from device', 'success');
      fetchConnections();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to disconnect';
      showToast(errMsg, 'error');
    }
  };

  const handleReconnect = async (connectionId: string) => {
    try {
      await waApiPost(`/whatsapp/reconnect?connection_id=${encodeURIComponent(connectionId)}`);
      showToast('Reconnected WhatsApp session', 'success');
      fetchConnections();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to reconnect';
      showToast(errMsg, 'error');
    }
  };

  const handleDelete = async (connectionId: string) => {
    setDeletingId(connectionId);
    try {
      await waApiDelete(`/whatsapp/connections/${encodeURIComponent(connectionId)}`);
      showToast('Connection deleted', 'success');
      fetchConnections();
    } catch {
      showToast('Failed to delete connection', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const isStale = (c: WhatsAppConnectionInfo) =>
    c.status !== 'CONNECTED' && c.status !== 'PAIRING';

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <WhatsApp3DIcon size={28} />
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Integrations — WhatsApp</h1>
        </div>
        <Button variant="primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setIsPairingOpen(true)}>
          + Pair
        </Button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
        <button
          onClick={() => setActiveTab('connections')}
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '20px',
            border: 'none',
            backgroundColor: activeTab === 'connections' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'connections' ? '#ffffff' : '#475569',
          }}
        >
          Connections ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '20px',
            border: 'none',
            backgroundColor: activeTab === 'logs' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'logs' ? '#2563eb' : '#475569',
          }}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('test')}
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            borderRadius: '20px',
            border: 'none',
            backgroundColor: activeTab === 'test' ? '#2563eb' : '#e2e8f0',
            color: activeTab === 'test' ? '#2563eb' : '#475569',
          }}
        >
          Test Console
        </button>
      </div>

      {activeTab === 'connections' && (
        <>
          <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fef08a', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#854d0e', display: 'block' }}>Unofficial Integration</span>
              <span style={{ fontSize: '0.75rem', color: '#a16207' }}>
                Operates via WhatsApp Web companion protocol (whatsmeow).
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Active Connections ({connections.length})</h2>
            {connections.length === 0 && (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0', fontSize: '0.85rem' }}>
                No connections yet. Tap <strong>+ Pair</strong> to get started.
              </div>
            )}
            {connections.map((c) => (
              <div
                key={c.connection_id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${isStale(c) ? '#fecaca' : '#e2e8f0'}`,
                  backgroundColor: isStale(c) ? '#fff5f5' : '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>+{c.phone_number || c.connection_id}</span>
                  <span style={{ fontSize: '0.75rem', color: c.status === 'CONNECTED' ? '#15803d' : '#b91c1c' }}>
                    ● {c.status}
                  </span>
                </div>
                {isStale(c) && (
                  <div style={{ fontSize: '0.7rem', color: '#b45309' }}>⚠️ Stale — delete to allow clean re-pairing</div>
                )}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {c.status !== 'CONNECTED' && (
                    <Button variant="secondary" title="Reconnect" style={{ padding: '0.35rem', color: '#2563eb', borderColor: '#bfdbfe' }} onClick={() => handleReconnect(c.connection_id)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                      </svg>
                    </Button>
                  )}
                  {c.status === 'CONNECTED' && (
                    <Button variant="secondary" title="Disconnect" style={{ padding: '0.35rem', color: '#dc2626', borderColor: '#fecaca' }} onClick={() => handleDisconnect(c.connection_id)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                        <line x1="12" y1="2" x2="12" y2="12"/>
                      </svg>
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    title="Delete"
                    style={{ padding: '0.35rem', color: '#dc2626', borderColor: '#fca5a5' }}
                    onClick={() => handleDelete(c.connection_id)}
                    disabled={deletingId === c.connection_id}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'logs' && <WhatsAppMessageLogPanel />}

      {activeTab === 'test' && <WhatsAppSendTestPanel connections={connections} />}

      <WhatsAppPairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        onSuccess={fetchConnections}
      />
    </div>
  );
};



