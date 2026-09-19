import React, { useState, useEffect } from 'react';
import { Button, useToast } from '@geeksman/core-ui';
import { waApiGet, waApiPost } from './WhatsAppIntegrationPage.desktop';

interface WhatsAppPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPhone?: string;
  initialPairing?: boolean;
}

export const WhatsAppPairingModal: React.FC<WhatsAppPairingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPhone,
  initialPairing,
}) => {
  const { showToast } = useToast();
  const [phone, setPhone] = useState<string>(initialPhone || '');
  const [qrBase64, setQrBase64] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [pairingStatus, setPairingStatus] = useState<string>(initialPairing ? 'PAIRING' : 'INIT');
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState<boolean>(true);
  const isFetchingQR = React.useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialPhone) {
        setPhone(initialPhone);
      }
      if (initialPairing || initialPhone) {
        setPairingStatus('PAIRING');
        setIsDisclaimerAccepted(true);
      } else {
        setPairingStatus('INIT');
      }
    }
  }, [isOpen, initialPhone, initialPairing]);

  const startPairing = async () => {
    setLoading(true);
    try {
      await waApiPost(`/whatsapp/connect?phone=${encodeURIComponent(phone)}`);
      setPairingStatus('PAIRING');
    } catch (err: any) {
      showToast('Failed to start pairing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const url = phone ? `/whatsapp/status?phone=${encodeURIComponent(phone)}` : '/whatsapp/status';
      const resp = await waApiGet(url);
      const d = resp.data?.data || resp.data;
      if (d?.is_connected || d?.status === 'CONNECTED') {
        showToast('Device paired successfully! 🎉', 'success');
        onSuccess();
        onClose();
      }
    } catch {
      // ignore transient poll error
    }
  };

  const fetchQR = async () => {
    if (isFetchingQR.current) return;
    isFetchingQR.current = true;
    try {
      const url = phone ? `/whatsapp/qr?phone=${encodeURIComponent(phone)}` : '/whatsapp/qr';
      const resp = await waApiGet(url);
      if (resp.data) {
        const d = resp.data.data || resp.data;
        if (d.qr_code_base64) {
          setQrBase64(d.qr_code_base64);
        }
        if (d.status === 'CONNECTED' || d.is_connected) {
          showToast('Device paired successfully! 🎉', 'success');
          onSuccess();
          onClose();
        }
      }
    } catch {
      // ignore transient poll error
    } finally {
      isFetchingQR.current = false;
    }
  };

  useEffect(() => {
    if (!isOpen || pairingStatus !== 'PAIRING') return;

    // 1. Fetch QR code initially
    fetchQR();

    // 2. Poll lightweight status every 3s to detect when phone finishes scanning
    const statusInterval = setInterval(checkStatus, 3000);

    // 3. Refresh QR code only when it expires (~every 20s)
    const qrRefreshInterval = setInterval(fetchQR, 20000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(qrRefreshInterval);
    };
  }, [isOpen, pairingStatus, phone]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', width: '420px', maxWidth: '90%', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            📱 Pair New WhatsApp Number
          </h2>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>×</button>
        </div>

        {pairingStatus === 'INIT' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Connection Name or Phone Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Trilok or 919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'block' }}>
                You can enter a person/department name (e.g. <strong>Trilok</strong>, <strong>Billing</strong>) or a phone number.
              </span>
            </div>

            <div style={{ backgroundColor: '#fffbebfb', border: '1px solid #fef08a', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                type="checkbox"
                id="unofficial-disclaimer-check"
                checked={isDisclaimerAccepted}
                onChange={(e) => setIsDisclaimerAccepted(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <label htmlFor="unofficial-disclaimer-check" style={{ fontSize: '0.78rem', color: '#854d0e', cursor: 'pointer', lineHeight: '1.3' }}>
                I understand this is an <strong>unofficial integration</strong> using WhatsApp Web companion protocol. I acknowledge that WhatsApp may impose rate limits or terms restrictions.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={startPairing} disabled={loading || !isDisclaimerAccepted}>
                {loading ? 'Initializing...' : 'Generate Pairing QR'}
              </Button>
            </div>
          </div>
        ) : (

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {qrBase64 ? (
              <>
                <img src={qrBase64} alt="Pairing QR" style={{ width: '220px', height: '220px', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '10px' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', textAlign: 'center' }}>
                  Open WhatsApp on your phone → Linked Devices → Link a Device, then scan this code.
                </span>
              </>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                Generating QR code stream...
              </div>
            )}
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
};
