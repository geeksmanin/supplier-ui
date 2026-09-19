import React, { useState } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { WhatsAppConnectionInfo, waApiGet, waApiPost } from './WhatsAppIntegrationPage.desktop';
import { WhatsApp3DIcon } from './WhatsApp3DIcon';
import { WhatsAppMessageLogPanel } from './WhatsAppMessageLogPanel';

interface WhatsAppDetailModalProps {
  connection: WhatsAppConnectionInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onDisconnect: (id: string) => Promise<void>;
  onReconnect: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
}

export const WhatsAppDetailModal: React.FC<WhatsAppDetailModalProps> = ({
  connection,
  isOpen,
  onClose,
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

  if (!isOpen || !connection) return null;

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
        showToast(d.is_on_whatsapp ? 'Number is active on WhatsApp ✅' : 'Number not registered on WhatsApp ❌', d.is_on_whatsapp ? 'success' : 'error');
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

      if (resp.data) {
        setLastResult('✅ Message dispatched successfully');
        showToast('WhatsApp message sent successfully', 'success');
        setText('');
        setMediaBase64('');
        setMediaName('');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to send message';
      setLastResult(`❌ Send Failed: ${errMsg}`);
      showToast(errMsg, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <WhatsApp3DIcon size={40} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  +{connection.phone_number || connection.connection_id}
                </h2>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: isConnected ? '#dcfce7' : '#fee2e2',
                    color: isConnected ? '#15803d' : '#b91c1c',
                    border: `1px solid ${isConnected ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Alias: <strong>{connection.display_name || '—'}</strong> | Connection ID:{' '}
                <code>{connection.connection_id}</code>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.4rem',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Action Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
              Device Session Actions:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isConnected ? (
                <Button
                  variant="secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={async () => {
                    await onReconnect(connection.connection_id);
                    onRefresh();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Reconnect Device
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: '#b91c1c', borderColor: '#fecaca', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={async () => {
                    await onDisconnect(connection.connection_id);
                    onRefresh();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
                    <line x1="12" y1="2" x2="12" y2="12"/>
                  </svg>
                  Disconnect &amp; Unlink
                </Button>
              )}
              <Button
                variant="danger"
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => {
                  onClose();
                  onDelete(connection.connection_id);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </Button>
            </div>
          </div>

          {/* Direct WhatsApp Outbound Message Console */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Send Live WhatsApp Message from +{fromPhone}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Test outbound messaging directly from this active connection
              </span>
            </div>

            {/* Recipient Input & Check */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Recipient Phone Number (with Country Code)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. 919053204903"
                  value={toPhone}
                  onChange={(e) => setToPhone(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <Button variant="secondary" onClick={handleCheckNumber} disabled={checking} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  {checking ? 'Checking...' : 'Check Registered'}
                </Button>
              </div>
              {checkResult && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: checkResult.exists ? '#15803d' : '#b91c1c',
                    marginTop: '4px',
                    display: 'block',
                    fontWeight: 600,
                  }}
                >
                  {checkResult.exists ? '✓ Number exists on WhatsApp' : '✕ Not registered on WhatsApp'}
                </span>
              )}
            </div>

            {/* Media Type Buttons */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                Message Format
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['text', 'image', 'pdf'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMediaType(type)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: mediaType === type ? '#2563eb' : '#cbd5e1',
                      backgroundColor: mediaType === type ? '#eff6ff' : '#ffffff',
                      color: mediaType === type ? '#1d4ed8' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Body or File Attachment */}
            {mediaType === 'text' ? (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Message Content
                </label>
                <textarea
                  rows={3}
                  placeholder="Type your WhatsApp message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  Upload {mediaType === 'image' ? 'Image' : 'PDF Document'}
                </label>
                <input
                  type="file"
                  accept={mediaType === 'image' ? 'image/*' : 'application/pdf'}
                  onChange={handleFileChange}
                  style={{ fontSize: '0.8rem' }}
                />
                {mediaName && <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Selected: {mediaName}</span>}
                <input
                  type="text"
                  placeholder="Optional caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {lastResult && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  backgroundColor: lastResult.startsWith('✅') || lastResult.includes('dispatched') ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${lastResult.startsWith('✅') || lastResult.includes('dispatched') ? '#bbf7d0' : '#fecaca'}`,
                  color: lastResult.startsWith('✅') || lastResult.includes('dispatched') ? '#166534' : '#991b1b',
                  fontWeight: 600,
                }}
              >
                {lastResult}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <Button variant="primary" onClick={handleSend} disabled={sending || !isConnected} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                {sending ? 'Sending...' : 'Send WhatsApp Message'}
              </Button>
            </div>
          </div>

          {/* Connection Specific Audit Logs */}
          <WhatsAppMessageLogPanel connectionId={connection.connection_id} />
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
