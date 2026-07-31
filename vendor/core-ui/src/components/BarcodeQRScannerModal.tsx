import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { apiClient } from '../api/client';
import { useToast } from './Toast/Toast';

export interface BarcodeQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: any) => void;
  /** Optional custom API lookup URL (e.g. "/catalogue/variants") */
  lookupUrl?: string;
  /** Custom title for modal */
  title?: string;
}

export const BarcodeQRScannerModal: React.FC<BarcodeQRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  lookupUrl = '',
  title = 'Scan Barcode / QR Code'
}) => {
  const { showToast } = useToast();
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setManualCode('');
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      streamRef.current = stream;
      // Allow DOM update so videoRef is rendered
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn('Video play interrupted:', e);
          }
        }
      }, 50);
      scanVideoFrame();
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraActive(false);
      showToast('Camera access unavailable. Use manual scanner input below.', 'error');
    }
  };

  const [isHoldingScan, setIsHoldingScan] = useState(false);
  const isHoldingScanRef = useRef(false);

  useEffect(() => {
    isHoldingScanRef.current = isHoldingScan;
  }, [isHoldingScan]);

  const scanVideoFrame = () => {
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'data_matrix']
      });
      const checkFrame = async () => {
        if (isHoldingScanRef.current && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const rawValue = barcodes[0].rawValue;
              if (rawValue) {
                stopCamera();
                await processScannedCode(rawValue);
                return;
              }
            }
          } catch (e) {
            // Frame detection pass
          }
        }
        animFrameRef.current = requestAnimationFrame(checkFrame);
      };
      animFrameRef.current = requestAnimationFrame(checkFrame);
    }
  };

  const processScannedCode = async (code: string) => {
    let cleanCode = code.trim();
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanCode);
        cleanCode = parsed.sku || parsed.sku_code || parsed.variant_id || parsed.code || cleanCode;
      } catch (e) {
        // use raw text
      }
    }

    if (!cleanCode) return;

    // If no lookupUrl is provided, return raw scanned text/object immediately without API call
    if (!lookupUrl) {
      onScanSuccess(cleanCode);
      onClose();
      return;
    }

    setScanning(true);
    try {
      const res = await apiClient.get(lookupUrl, {
        params: { search: cleanCode, limit: 10 }
      });
      const list = res.data?.data ? (Array.isArray(res.data.data) ? res.data.data : [res.data.data]) : [];
      if (list.length > 0) {
        showToast(`Item found: ${list[0].sku_code || list[0].name || cleanCode}`, 'success');
        onScanSuccess(list[0]);
        onClose();
      } else {
        // Fallback: return scanned raw code directly if no API match
        onScanSuccess(cleanCode);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      onScanSuccess(cleanCode);
      onClose();
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        maxWidth: '480px',
        width: '100%',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              {title}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
              Scan 1D Barcodes or 2D QR Codes using camera or hardware scanner
            </p>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
          >
            ×
          </button>
        </div>

        {/* Camera Area */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Rectangular Scanner Target Overlay Box */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '75%',
                height: '60%',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '8px',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
                pointerEvents: 'none',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Viewfinder Corners */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: 14, borderTop: '3px solid #2563eb', borderLeft: '3px solid #2563eb', borderRadius: '4px 0 0 0' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderTop: '3px solid #2563eb', borderRight: '3px solid #2563eb', borderRadius: '0 4px 0 0' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 14, height: 14, borderBottom: '3px solid #2563eb', borderLeft: '3px solid #2563eb', borderRadius: '0 0 0 4px' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderBottom: '3px solid #2563eb', borderRight: '3px solid #2563eb', borderRadius: '0 0 4px 0' }} />

                {/* Scanning Laser Line */}
                <div style={{
                  position: 'absolute',
                  left: '5%',
                  right: '5%',
                  height: '2px',
                  backgroundColor: '#2563eb',
                  boxShadow: '0 0 8px #3b82f6',
                  animation: 'scanner-laser 1.8s ease-in-out infinite'
                }} />
                <style>{`
                  @keyframes scanner-laser {
                    0% { top: 10%; opacity: 0.4; }
                    50% { top: 90%; opacity: 1; }
                    100% { top: 10%; opacity: 0.4; }
                  }
                `}</style>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
              <Button variant="primary" type="button" onClick={startCamera}>
                Turn On Camera Scanner
              </Button>
            </div>
          )}
        </div>
        {cameraActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onMouseDown={() => setIsHoldingScan(true)}
              onMouseUp={() => setIsHoldingScan(false)}
              onMouseLeave={() => setIsHoldingScan(false)}
              onTouchStart={() => setIsHoldingScan(true)}
              onTouchEnd={() => setIsHoldingScan(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isHoldingScan ? '#16a34a' : '#2563eb',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: isHoldingScan ? '0 0 0 3px rgba(22, 163, 74, 0.35)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="7" y1="7" x2="7" y2="17" />
                <line x1="10" y1="7" x2="10" y2="17" />
                <line x1="17" y1="7" x2="17" y2="17" />
              </svg>
              <span>{isHoldingScan ? 'Scanning... (Release to Stop)' : 'Press & Hold to Scan Code'}</span>
            </button>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Press and hold the button above while pointing your camera at the barcode/QR code.
            </span>
          </div>
        )}

        {/* Hardware / Manual Input */}
        <form onSubmit={(e) => { e.preventDefault(); processScannedCode(manualCode); }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
            Hardware Gun / Manual Barcode & QR Code Input
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Input
              autoFocus
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Scan or type Barcode / QR Code..."
              style={{ flex: 1 }}
            />
            <Button variant="primary" type="submit" disabled={scanning || !manualCode.trim()}>
              {scanning ? 'Searching...' : 'Find'}
            </Button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => { stopCamera(); onClose(); }}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
