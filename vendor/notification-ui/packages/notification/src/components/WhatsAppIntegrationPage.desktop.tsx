import React, { useState, useEffect } from 'react';
import { Button, useToast, apiClient } from '@geeksman/core-ui';
import { WhatsAppSendTestPanel } from './WhatsAppSendTestPanel';
import { WhatsAppPairingModal } from './WhatsAppPairingModal';
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


export const WhatsAppIntegrationPageDesktop: React.FC = () => {
  const { showToast } = useToast();
  const [connections, setConnections] = useState<WhatsAppConnectionInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);

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
    try {
      await waApiPost('/whatsapp/disconnect');
      showToast('Disconnected connection', 'success');
      fetchConnections();
    } catch (err: any) {
      showToast('Failed to disconnect connection', 'error');
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with 3D Integrations Icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IntegrationsIcon size={44} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Integrations — WhatsApp Connection Hub</h1>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Manage multi-number WhatsApp Web connections & send real-time notifications</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={fetchConnections} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh Status'}
          </Button>
          <Button variant="primary" onClick={() => setIsPairingOpen(true)}>
            ➕ Pair New Number
          </Button>
        </div>
      </div>

      {/* Connected Accounts Cards Grid */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
          📱 Active Connected WhatsApp Numbers ({connections.length})
        </h2>

        {connections.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2.5rem' }}>📱</div>
            <span style={{ fontWeight: 600 }}>No WhatsApp numbers currently connected</span>
            <span style={{ fontSize: '0.8rem' }}>Click "Pair New Number" to generate a pairing QR code for your device</span>
            <Button variant="primary" onClick={() => setIsPairingOpen(true)}>
              Pair New Number
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {connections.map((c) => (
              <div key={c.connection_id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    +{c.phone_number || c.connection_id}
                  </span>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: c.status === 'CONNECTED' ? '#dcfce7' : '#fee2e2',
                    color: c.status === 'CONNECTED' ? '#15803d' : '#b91c1c'
                  }}>
                    {c.status === 'CONNECTED' ? '🟢 Connected' : '🔴 Disconnected'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ID: {c.connection_id}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="danger" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDisconnect(c.connection_id)}>
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
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
    </div>
  );
};
