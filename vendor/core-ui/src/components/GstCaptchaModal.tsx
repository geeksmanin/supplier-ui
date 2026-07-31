import React, { useState, useEffect } from 'react';
import { fetchOfficialGstCaptcha, fetchOfficialGstTaxpayerDetails, OfficialGstTaxpayerDetails } from '../services/gstService';

export interface GstCaptchaModalProps {
  isOpen: boolean;
  gstin: string;
  onClose: () => void;
  onSuccess: (details: OfficialGstTaxpayerDetails) => void;
}

export const GstCaptchaModal: React.FC<GstCaptchaModalProps> = ({
  isOpen,
  gstin,
  onClose,
  onSuccess,
}) => {
  const [captchaBase64, setCaptchaBase64] = useState<string>('');
  const [captchaInput, setCaptchaInput] = useState<string>('');
  const [loadingCaptcha, setLoadingCaptcha] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadCaptcha = async () => {
    setLoadingCaptcha(true);
    setErrorMsg('');
    try {
      const res = await fetchOfficialGstCaptcha();
      setCaptchaBase64(res.captchaBase64);
    } catch (err: any) {
      console.error('Failed to load GST Captcha:', err);
      setErrorMsg('Could not load Captcha from GST Portal. Please try again.');
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCaptchaInput('');
      setErrorMsg('');
      loadCaptcha();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaInput.trim()) {
      setErrorMsg('Please enter Captcha text.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const details = await fetchOfficialGstTaxpayerDetails(gstin, captchaInput);
      onSuccess(details);
      onClose();
    } catch (err: any) {
      console.error('GST details fetch error:', err);
      setErrorMsg(err.message || 'Invalid Captcha or failed to fetch details.');
      // Refresh captcha on failure
      loadCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
            🔍 Official GST Taxpayer Lookup
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem' }}>
          Searching official details for GSTIN: <strong style={{ color: '#1e293b' }}>{gstin}</strong>
        </p>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.6rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            marginBottom: '1rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
              Captcha Code
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#f8fafc',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              minHeight: '60px'
            }}>
              {loadingCaptcha ? (
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading Captcha...</span>
              ) : captchaBase64 ? (
                <img
                  src={`data:image/png;base64,${captchaBase64}`}
                  alt="GST Captcha"
                  style={{ height: '45px', borderRadius: '4px' }}
                />
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>Failed to load image</span>
              )}
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={loadingCaptcha}
                style={{
                  border: 'none',
                  background: '#e2e8f0',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#334155'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
              Enter Captcha Characters *
            </label>
            <input
              type="text"
              value={captchaInput}
              onChange={e => setCaptchaInput(e.target.value)}
              placeholder="Enter Captcha text..."
              autoFocus
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !captchaInput.trim()}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                opacity: submitting || !captchaInput.trim() ? 0.6 : 1
              }}
            >
              {submitting ? 'Verifying...' : 'Submit & Fetch Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
