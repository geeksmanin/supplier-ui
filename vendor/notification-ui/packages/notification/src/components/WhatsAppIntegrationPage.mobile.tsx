import React, { useState, useEffect } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { WhatsAppSendTestPanel } from './WhatsAppSendTestPanel';
import { WhatsAppPairingModal } from './WhatsAppPairingModal';
import { WhatsApp3DIcon } from './WhatsApp3DIcon';
import { waApiGet, waApiPost, waApiDelete, WhatsAppConnectionInfo } from './WhatsAppIntegrationPage.desktop';

export const WhatsAppIntegrationPageMobile: React.FC = () => {
  const { showToast } = useToast();
  const [connections, setConnections] = useState<WhatsAppConnectionInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {c.status !== 'CONNECTED' && (
                <Button variant="secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleReconnect(c.connection_id)}>
                  🔄 Reconnect
                </Button>
              )}
              {c.status === 'CONNECTED' && (
                <Button variant="secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handleDisconnect(c.connection_id)}>
                  Disconnect
                </Button>
              )}
              <Button
                variant="danger"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => handleDelete(c.connection_id)}
                disabled={deletingId === c.connection_id}
              >
                {deletingId === c.connection_id ? '⏳' : '🗑️ Delete'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <WhatsAppSendTestPanel connections={connections} />

      <WhatsAppPairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        onSuccess={fetchConnections}
      />
    </div>
  );
};


