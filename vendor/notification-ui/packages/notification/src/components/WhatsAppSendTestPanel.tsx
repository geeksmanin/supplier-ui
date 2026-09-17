import React, { useState } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { waApiGet, waApiPost } from './WhatsAppIntegrationPage.desktop';

interface WhatsAppConnectionInfo {
  connection_id: string;
  phone_number: string;
  display_name?: string;
  status: string;
}

interface WhatsAppSendTestPanelProps {
  connections: WhatsAppConnectionInfo[];
}

export const WhatsAppSendTestPanel: React.FC<WhatsAppSendTestPanelProps> = ({ connections }) => {
  const { showToast } = useToast();
  const [fromPhone, setFromPhone] = useState<string>('');
  const [toPhone, setToPhone] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'pdf'>('text');
  const [mediaBase64, setMediaBase64] = useState<string>('');
  const [mediaName, setMediaName] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<{ checked: boolean; exists?: boolean } | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

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
        showToast(d.is_on_whatsapp ? 'Phone number is active on WhatsApp ✅' : 'Number not registered on WhatsApp ❌', d.is_on_whatsapp ? 'success' : 'error');
      }
    } catch (err: any) {
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
    <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          📤 Outbound Message Test Console
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Send live test text, images, or PDFs to any recipient</span>
      </div>

      {/* Inputs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>From Connection</label>
          <select
            value={fromPhone}
            onChange={(e) => setFromPhone(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          >
            <option value="">Auto-Select Active Connection</option>
            {connections.map((c) => (
              <option key={c.connection_id} value={c.phone_number}>
                +{c.phone_number || c.connection_id} ({c.status})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Recipient Phone Number</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. 919876543210"
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <Button variant="secondary" onClick={handleCheckNumber} disabled={checking}>
              {checking ? '...' : 'Check WA'}
            </Button>
          </div>
          {checkResult && (
            <span style={{ fontSize: '0.75rem', color: checkResult.exists ? '#15803d' : '#b91c1c', marginTop: '2px', display: 'block' }}>
              {checkResult.exists ? '✅ Number exists on WhatsApp' : '❌ Not registered on WhatsApp'}
            </span>
          )}
        </div>
      </div>

      {/* Message Type Selector */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Message Type</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['text', 'image', 'pdf'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMediaType(type)}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: mediaType === type ? '#2563eb' : '#cbd5e1',
                backgroundColor: mediaType === type ? '#eff6ff' : '#ffffff',
                color: mediaType === type ? '#1d4ed8' : '#475569',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {type === 'text' ? '💬 Text' : type === 'image' ? '🖼️ Image' : '📄 PDF Document'}
            </button>
          ))}
        </div>
      </div>

      {/* Message Body or Media Upload */}
      {mediaType === 'text' ? (
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Message Content</label>
          <textarea
            rows={3}
            placeholder="Type your WhatsApp message here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit' }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Upload {mediaType === 'image' ? 'Image' : 'PDF Document'}
            </label>
            <input
              type="file"
              accept={mediaType === 'image' ? 'image/*' : 'application/pdf'}
              onChange={handleFileChange}
              style={{ fontSize: '0.85rem' }}
            />
            {mediaName && <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'block', marginTop: '2px' }}>Loaded: {mediaName}</span>}
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Media Caption (Optional)</label>
            <input
              type="text"
              placeholder="Add caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      )}

      {/* Submit Button & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
        {lastResult && (
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: lastResult.startsWith('✅') ? '#15803d' : '#b91c1c' }}>
            {lastResult}
          </span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <Button variant="primary" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending Message...' : '🚀 Send WhatsApp Message'}
          </Button>
        </div>
      </div>
    </div>
  );
};
