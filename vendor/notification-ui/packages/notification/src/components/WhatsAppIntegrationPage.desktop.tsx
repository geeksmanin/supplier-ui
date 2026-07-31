import React, { useState, useEffect } from 'react';
import { Button, useToast, apiClient } from '@geeksman/core-ui';

export enum WhatsAppStatus {
  PAIRING_REQUIRED = 'PAIRING_REQUIRED',
  CONNECTED = 'CONNECTED',
  SAVED_SESSION_DISCONNECTED = 'SAVED_SESSION_DISCONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  WAITING_FOR_QR = 'WAITING_FOR_QR',
}

export const WhatsAppIntegrationPageDesktop: React.FC = () => {
  const { showToast } = useToast();
  const [status, setStatus] = useState<WhatsAppStatus>(WhatsAppStatus.PAIRING_REQUIRED);
  const [phone, setPhone] = useState<string>('');
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      const resp = await apiClient.get('/api/v1/whatsapp/status');
      if (resp.data) {
        setStatus(resp.data.status);
        if (resp.data.phone) setPhone(resp.data.phone);
      }
    } catch (err: any) {
      console.error('Failed to fetch WhatsApp status:', err);
    }
  };

  const fetchQR = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/api/v1/whatsapp/qr');
      if (resp.data) {
        if (resp.data.qr_code_base64) {
          setQrBase64(resp.data.qr_code_base64);
        }
        if (resp.data.status) {
          setStatus(resp.data.status);
        }
        if (resp.data.phone) {
          setPhone(resp.data.phone);
        }
      }
    } catch (err: any) {
      showToast('Failed to generate WhatsApp QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await apiClient.post('/api/v1/whatsapp/disconnect');
      setStatus(WhatsAppStatus.DISCONNECTED);
      setPhone('');
      setQrBase64('');
      showToast('WhatsApp account disconnected', 'success');
    } catch (err: any) {
      showToast('Failed to disconnect WhatsApp account', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>WhatsApp Integration</h1>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Connect your WhatsApp Web device to listen for messages & notifications</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: status === WhatsAppStatus.CONNECTED ? '#dcfce7' : '#fee2e2',
            color: status === WhatsAppStatus.CONNECTED ? '#15803d' : '#b91c1c'
          }}>
            {status === WhatsAppStatus.CONNECTED ? `🟢 Connected (+${phone})` : '🔴 Unlinked / Pair Device'}
          </span>
          <Button variant="secondary" onClick={fetchStatus}>Refresh Status</Button>
        </div>
      </div>

      {/* Main 2-Column Responsive Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
        {/* Left Column: Account Details & Instructions */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0, borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Device & Listener Configuration
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
            <div><strong>Active Tenant Isolation:</strong> Dedicated SQLite database stored under <code>$HOME/.geeksmanos/</code></div>
            <div><strong>PubSub Message Queue:</strong> Real-time <code>WhatsAppMessageReceived</code> event broadcasting</div>
            {phone && <div><strong>Paired Number:</strong> +{phone}</div>}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px' }}>
            {status === WhatsAppStatus.CONNECTED ? (
              <Button variant="danger" onClick={handleDisconnect} disabled={loading}>
                Disconnect Account
              </Button>
            ) : (
              <Button variant="primary" onClick={fetchQR} disabled={loading}>
                {loading ? 'Generating QR...' : 'Show Pairing QR Code'}
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: QR Code Scanner */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          {status === WhatsAppStatus.CONNECTED ? (
            <div style={{ textAlign: 'center', color: '#15803d', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '3rem' }}>✅</div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>WhatsApp Connected!</h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Incoming messages are actively listened & dispatched to PubSub</span>
            </div>
          ) : qrBase64 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <img src={qrBase64} alt="WhatsApp QR Code" style={{ width: '220px', height: '220px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '8px' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Scan this QR Code using WhatsApp on your phone</span>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '2.5rem' }}>📱</div>
              <span style={{ fontSize: '0.85rem' }}>Click "Show Pairing QR Code" to link a WhatsApp device</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
