import React, { useState } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { WhatsAppConnectionInfo, waApiGet, waApiPost } from './WhatsAppIntegrationPage.desktop';
import { WhatsApp3DIcon } from './WhatsApp3DIcon';
import { WhatsAppPairingModal } from './WhatsAppPairingModal';
import { WhatsAppMessageLogPanel } from './WhatsAppMessageLogPanel';

interface WhatsAppDetailViewProps {
  connection: WhatsAppConnectionInfo;
  onBack: () => void;
  onRefresh: () => void;
  onDisconnect: (id: string) => Promise<void>;
  onReconnect: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export const WhatsAppDetailView: React.FC<WhatsAppDetailViewProps> = ({
  connection,
  onBack,
  onRefresh,
  onDisconnect,
  onReconnect,
  onDelete,
}) => {
  const { showToast } = useToast();
  const [toPhone, setToPhone] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'pdf'>('text');
  const [mediaBase64, setMediaBase64] = useState<string>('');
  const [mediaName, setMediaName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<{ checked: boolean; exists?: boolean } | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [isPairingOpen, setIsPairingOpen] = useState<boolean>(false);

  const isConnected = connection.status === 'CONNECTED';
  const fromPhone = connection.phone_number || connection.connection_id;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Str = (reader.result as string).split(',')[1];
      setMediaBase64(base64Str);
    };
    reader.readAsDataURL(file);
  };

  const handleCheckNumber = async () => {
    if (!toPhone) {
      showToast('Please enter target phone number', 'error');
      return;
    }
    setChecking(true);
    setCheckResult(null);
    try {
      const resp = await waApiGet(`/whatsapp/check?phone=${encodeURIComponent(toPhone)}&from=${encodeURIComponent(fromPhone)}`);
      const d = resp.data.data || resp.data;
      if (d) {
        setCheckResult({ checked: true, exists: d.is_on_whatsapp });
        showToast(
          d.is_on_whatsapp ? 'Number is active on WhatsApp ✅' : 'Number not registered on WhatsApp ❌',
          d.is_on_whatsapp ? 'success' : 'error'
        );
      }
    } catch {
      showToast('Failed to check WhatsApp directory', 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleSend = async () => {
    if (!toPhone) {
      showToast('Recipient phone number is required', 'error');
      return;
    }
    if (mediaType === 'text' && !text) {
      showToast('Message text cannot be empty', 'error');
      return;
    }
    if (mediaType !== 'text' && !mediaBase64) {
      showToast('Please upload a file for image/PDF message', 'error');
      return;
    }

    setSending(true);
    setLastResult(null);
    try {
      const resp = await waApiPost('/whatsapp/send', {
        from: fromPhone,
        to: toPhone,
        text,
        media_type: mediaType === 'text' ? '' : mediaType,
        media_base64: mediaBase64,
        media_name: mediaName,
        caption,
      });
      const data = resp.data.data || resp.data;
      setLastResult(JSON.stringify(data, null, 2));
      showToast('WhatsApp message dispatched successfully!', 'success');
      setText('');
      setMediaBase64('');
      setMediaName('');
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || 'Failed to send WhatsApp message';
      setLastResult(`Error: ${errMsg}`);
      showToast(errMsg, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleReconnectClick = async () => {
    setReconnecting(true);
    try {
      await onReconnect(connection.connection_id);
    } catch (err) {
      showToast('Session could not reconnect automatically. Opening QR Code for re-linking...', 'error');
      setIsPairingOpen(true);
    } finally {
      setReconnecting(false);
    }
  };

  const handleDisconnectClick = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect(connection.connection_id);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Full Window Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            variant="secondary"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#334155',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Connections
          </Button>
          <div style={{ height: '24px', width: '1px', backgroundColor: '#cbd5e1' }} />
          <WhatsApp3DIcon size={36} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                +{connection.phone_number || connection.connection_id}
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isConnected ? '#dcfce7' : '#fee2e2',
                  color: isConnected ? '#15803d' : '#b91c1c',
                  border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isConnected ? '#16a34a' : '#ef4444' }} />
                {isConnected ? 'Connected & Live' : 'Disconnected'}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Alias: {connection.display_name || 'Primary Device'} | ID: <code>{connection.connection_id}</code>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="secondary"
            onClick={handleReconnectClick}
            disabled={reconnecting}
            style={{ color: '#2563eb', borderColor: '#bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {reconnecting ? 'Connecting...' : 'Reconnect Session'}
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsPairingOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <rect x="7" y="7" width="3" height="3"/>
              <rect x="14" y="7" width="3" height="3"/>
              <rect x="7" y="14" width="3" height="3"/>
            </svg>
            Re-pair QR Code
          </Button>

          <Button
            variant="secondary"
            onClick={handleDisconnectClick}
            disabled={disconnecting}
            style={{ color: '#dc2626', borderColor: '#fecaca', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
              <line x1="12" y1="2" x2="12" y2="12"/>
            </svg>
            {disconnecting ? 'Disconnecting...' : 'Disconnect Phone'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => onDelete(connection.connection_id)}
            style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Delete Connection
          </Button>
        </div>
      </div>

      {/* Grid Layout: Main Dispatch Console + Side Connection Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left Column: Outbound Test & Directory Lookup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Dispatch Form Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Outbound Test Dispatcher
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Target Phone Number (with Country Code, e.g. 919876543210)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="919876543210"
                    value={toPhone}
                    onChange={(e) => setToPhone(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleCheckNumber}
                    disabled={checking || !isConnected}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    {checking ? 'Checking...' : 'Check Registered'}
                  </Button>
                </div>
                {checkResult && (
                  <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '6px', color: checkResult.exists ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {checkResult.exists ? '✓ Number is registered on WhatsApp' : '✕ Number is NOT registered on WhatsApp'}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Message Type
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(['text', 'image', 'pdf'] as const).map((t) => (
                    <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: mediaType === t ? 600 : 400 }}>
                      <input type="radio" name="mediaType" checked={mediaType === t} onChange={() => setMediaType(t)} />
                      {t.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              {mediaType === 'text' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Message Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your message here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Upload {mediaType.toUpperCase()} File
                    </label>
                    <input type="file" accept={mediaType === 'image' ? 'image/*' : 'application/pdf'} onChange={handleFileChange} />
                    {mediaName && <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'block', marginTop: '4px' }}>Selected: {mediaName}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Caption (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              <Button variant="primary" onClick={handleSend} disabled={sending || !isConnected} style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                {sending ? 'Dispatching Message...' : 'Send WhatsApp Message'}
              </Button>

              {!isConnected && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Session is disconnected. Click <strong>Re-pair QR Code</strong> to scan and re-link.
                </span>
              )}
            </div>
          </div>

          {/* Last API Response Console */}
          {lastResult && (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', color: '#f8fafc' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                Last API Result
              </span>
              <pre style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#38bdf8', overflowX: 'auto', fontFamily: 'monospace' }}>
                {lastResult}
              </pre>
            </div>
          )}
        </div>

        {/* Right Column: Connection Metadata & Technical Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Connection Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Phone Number</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>+{connection.phone_number || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Display Name</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{connection.display_name || '—'}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Connection ID</span>
                <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  {connection.connection_id}
                </code>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Status</span>
                <span style={{ fontWeight: 600, color: isConnected ? '#16a34a' : '#dc2626' }}>{connection.status}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Last Seen</span>
                <span style={{ color: '#334155' }}>
                  {connection.last_seen_at ? new Date(connection.last_seen_at).toLocaleString() : '—'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Realtime Heartbeat &amp; Auto-Re-pair
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#1e3a8a', margin: 0, lineHeight: '1.4' }}>
              If your phone loses internet connection or unlinks WhatsApp Web, status updates to <strong>DISCONNECTED</strong>. Click <strong>Re-pair QR Code</strong> to generate and scan the QR code image immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Individual Connection Message Audit Logs Section */}
      <WhatsAppMessageLogPanel connectionId={connection.connection_id} />

      {/* QR Pairing Re-link Modal */}
      <WhatsAppPairingModal
        isOpen={isPairingOpen}
        initialPhone={connection.phone_number || connection.connection_id}
        initialPairing={true}
        onClose={() => setIsPairingOpen(false)}
        onSuccess={() => {
          setIsPairingOpen(false);
          onRefresh();
        }}
      />
    </div>
  );
};
