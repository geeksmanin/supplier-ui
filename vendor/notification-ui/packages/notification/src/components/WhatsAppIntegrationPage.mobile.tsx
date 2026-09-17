import React, { useState, useEffect } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { WhatsAppSendTestPanel } from './WhatsAppSendTestPanel';
import { WhatsAppPairingModal } from './WhatsAppPairingModal';
import { IntegrationsIcon } from './IntegrationsIcon';
import { waApiGet, WhatsAppConnectionInfo } from './WhatsAppIntegrationPage.desktop';

export const WhatsAppIntegrationPageMobile: React.FC = () => {
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
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IntegrationsIcon size={24} />
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Integrations — WhatsApp</h1>
        </div>
        <Button variant="primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setIsPairingOpen(true)}>
          + Pair
        </Button>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Active Connections ({connections.length})</h2>
        {connections.map((c) => (
          <div key={c.connection_id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>+{c.phone_number || c.connection_id}</span>
            <span style={{ fontSize: '0.75rem', color: c.status === 'CONNECTED' ? '#15803d' : '#b91c1c' }}>● {c.status}</span>
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
