import React, { useState } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { WhatsAppConnectionInfo, waApiGet, waApiPost } from './WhatsAppIntegrationPage.desktop';
import { WhatsApp3DIcon } from './WhatsApp3DIcon';

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
      showToast('WhatsApp message dispatched successfully! 🚀', 'success');
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
          <Button variant="secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⬅️ Back to Connections
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
          {!isConnected && (
            <Button variant="secondary" onClick={handleReconnectClick} disabled={reconnecting}>
              {reconnecting ? 'Connecting...' : '🔄 Reconnect Session'}
            </Button>
          )}
          {isConnected && (
            <Button variant="secondary" style={{ color: '#b91c1c', borderColor: '#fecaca' }} onClick={handleDisconnectClick} disabled={disconnecting}>
              {disconnecting ? 'Disconnecting...' : '🔌 Disconnect Phone'}
            </Button>
          )}
          <Button variant="danger" onClick={() => onDelete(connection.connection_id)}>
            🗑️ Delete Connection
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
              💬 Outbound Test Dispatcher
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
                  <Button variant="secondary" onClick={handleCheckNumber} disabled={checking || !isConnected}>
                    {checking ? 'Checking...' : '🔍 Check Registered'}
                  </Button>
                </div>
                {checkResult && (
                  <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '4px', color: checkResult.exists ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                    {checkResult.exists ? '✅ Number is registered on WhatsApp' : '❌ Number is NOT registered on WhatsApp'}
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

              <Button variant="primary" onClick={handleSend} disabled={sending || !isConnected} style={{ marginTop: '8px' }}>
                {sending ? 'Dispatching Message...' : '🚀 Send WhatsApp Message'}
              </Button>

              {!isConnected && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 500 }}>
                  ⚠️ Session is disconnected. Reconnect or pair QR code before sending messages.
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
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>
              📌 Connection Summary
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
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e40af' }}>
              💡 Realtime Heartbeat &amp; Auto-Re-pair
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#1e3a8a', margin: 0, lineHeight: '1.4' }}>
              If your phone loses internet connection or unlinks WhatsApp Web, status updates to <strong>DISCONNECTED</strong>. Click <strong>🔄 Reconnect Session</strong> to restore the socket stream automatically without needing to re-scan the QR code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
