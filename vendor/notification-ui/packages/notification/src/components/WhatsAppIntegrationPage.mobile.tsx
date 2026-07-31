import React, { useState, useEffect } from 'react';
import { Button, useToast, apiClient } from '@geeksman/core-ui';
import { WhatsAppStatus } from './WhatsAppIntegrationPage.desktop';

export const WhatsAppIntegrationPageMobile: React.FC = () => {
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
        if (resp.data.qr_code_base64) setQrBase64(resp.data.qr_code_base64);
        if (resp.data.status) setStatus(resp.data.status);
        if (resp.data.phone) setPhone(resp.data.phone);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#f8fafc', paddingBottom: '80px', minHeight: '100vh' }}>
      {/* Mobile Title */}
      <div style={{ padding: '8px 4px' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>WhatsApp Integration</h1>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Connect WhatsApp Web device to listen for messages</span>
      </div>

      {/* Status Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '0.75rem',
          fontWeight: 700,
          backgroundColor: status === WhatsAppStatus.CONNECTED ? '#dcfce7' : '#fee2e2',
          color: status === WhatsAppStatus.CONNECTED ? '#15803d' : '#b91c1c'
        }}>
          {status === WhatsAppStatus.CONNECTED ? `🟢 Connected (+${phone})` : '🔴 Unlinked'}
        </span>
        <Button variant="secondary" onClick={fetchStatus} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Refresh</Button>
      </div>

      {/* QR Code Container */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
        {status === WhatsAppStatus.CONNECTED ? (
          <div style={{ textAlign: 'center', color: '#15803d' }}>
            <div style={{ fontSize: '2.5rem' }}>✅</div>
            <h3 style={{ margin: '4px 0', fontSize: '1rem', fontWeight: 700 }}>WhatsApp Connected!</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Listening & publishing to PubSub</span>
          </div>
        ) : qrBase64 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <img src={qrBase64} alt="WhatsApp QR Code" style={{ width: '180px', height: '180px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '6px' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Scan QR Code using WhatsApp on your phone</span>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem' }}>📱</div>
            <span style={{ fontSize: '0.8rem' }}>Tap button below to pair WhatsApp device</span>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        padding: '10px 16px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '8px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        {status === WhatsAppStatus.CONNECTED ? (
          <Button variant="danger" onClick={handleDisconnect} disabled={loading} style={{ flex: 1 }}>
            Disconnect Account
          </Button>
        ) : (
          <Button variant="primary" onClick={fetchQR} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Generating...' : 'Show Pairing QR Code'}
          </Button>
        )}
      </div>
    </div>
  );
};
