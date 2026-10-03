import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { apiClient } from '../api/client';
import { useToast } from './Toast/Toast';
import { BarcodeQRScannerModalProps } from './BarcodeQRScannerModal.desktop';

const STYLE_ID = 'bqs-mobile-styles';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes bqs-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .bqs-drawer { animation: bqs-slide-up 0.32s cubic-bezier(0.32,0.72,0,1) both; }
  `;
  document.head.appendChild(s);
}

export const BarcodeQRScannerModalMobile: React.FC<BarcodeQRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  lookupUrl = '/catalogue/variants',
  title = 'Scan Barcode / QR Code'
}) => {
  const { showToast } = useToast();
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectorAvailable, setDetectorAvailable] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    setCameraError(null);
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); } catch (_) {}
      }
      setCameraActive(true);
      setFacingMode(facing);
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraActive(false);
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera permission denied.'
        : err?.name === 'NotFoundError'
        ? 'No camera found.'
        : 'Camera unavailable.';
      setCameraError(msg);
      showToast(msg, 'error');
    }
  }, [showToast]);

  // Auto-start camera as soon as mobile drawer opens
  useEffect(() => {
    if (isOpen) {
      startCamera('environment');
    } else {
      stopCamera();
      setManualCode('');
      setCameraError(null);
    }
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const onVideoReady = useCallback(() => {
    if (!('BarcodeDetector' in window)) {
      setDetectorAvailable(false);
      return;
    }
    setDetectorAvailable(true);
    const detector = new (window as any).BarcodeDetector({
      formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'data_matrix', 'code_39', 'itf', 'aztec']
    });
    const checkFrame = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < video.HAVE_ENOUGH_DATA) {
        animFrameRef.current = requestAnimationFrame(checkFrame);
        return;
      }
      try {
        const barcodes = await detector.detect(video);
        if (barcodes?.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) { stopCamera(); await processScannedCode(rawValue); return; }
        }
      } catch (_) {}
      animFrameRef.current = requestAnimationFrame(checkFrame);
    };
    animFrameRef.current = requestAnimationFrame(checkFrame);
  }, [stopCamera]);

  const processScannedCode = async (code: string) => {
    let cleanCode = code.trim();
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const p = JSON.parse(cleanCode);
        cleanCode = p.sku || p.sku_code || p.variant_id || p.code || cleanCode;
      } catch (_) {}
    }
    if (!cleanCode) return;
    setScanning(true);
    try {
      const res = await apiClient.get(lookupUrl, { params: { search: cleanCode, limit: 10 } });
      const list = res.data?.data ? (Array.isArray(res.data.data) ? res.data.data : [res.data.data]) : [];
      if (list.length > 0) {
        showToast(`Found: ${list[0].sku_code || list[0].name || cleanCode}`, 'success');
        onScanSuccess(list[0]);
      } else {
        onScanSuccess({ sku_code: cleanCode, raw_code: cleanCode });
      }
      onClose();
    } catch (_) {
      onScanSuccess({ sku_code: cleanCode, raw_code: cleanCode });
      onClose();
    } finally {
      setScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) { stopCamera(); onClose(); } }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(15,23,42,0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 100000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
      }}
    >
      <div
        className="bqs-drawer"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px 20px 0 0',
          width: '100%', maxHeight: '92dvh',
          padding: '0.85rem 1rem 1.25rem',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          overflowY: 'auto'
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '-0.25rem' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: '#cbd5e1' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#64748b' }}>
              Point camera at code or use manual entry
            </p>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', transition: 'background 0.2s'
            }}
          >×</button>
        </div>

        {/* Camera Viewport */}
        <div style={{
          position: 'relative', width: '100%', height: '240px',
          backgroundColor: '#0f172a', borderRadius: '14px', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <video
            ref={videoRef}
            autoPlay muted playsInline
            onLoadedMetadata={onVideoReady}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }}
          />

          {cameraActive && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '62%', height: '52%',
                border: '2px solid rgba(99,102,241,0.85)',
                borderRadius: '10px',
                boxShadow: '0 0 0 4000px rgba(0,0,0,0.38)'
              }} />
              <button
                onClick={() => startCamera(facingMode === 'environment' ? 'user' : 'environment')}
                title={facingMode === 'environment' ? 'Switch to front camera' : 'Switch to rear camera'}
                style={{
                  pointerEvents: 'all', position: 'absolute', top: 10, right: 10,
                  background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%', width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '1rem', backdropFilter: 'blur(4px)', color: '#fff'
                }}
              >🔄</button>
            </div>
          )}

          {!cameraActive && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
              {cameraError ? (
                <>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>⚠️</div>
                  <p style={{ fontSize: '0.75rem', color: '#f87171', margin: '0 0 0.65rem' }}>{cameraError}</p>
                  <Button variant="primary" type="button" onClick={() => startCamera(facingMode)}>Retry Camera</Button>
                </>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Starting camera...</p>
              )}
            </div>
          )}

          {cameraActive && !detectorAvailable && (
            <div style={{
              position: 'absolute', bottom: 8, left: 0, right: 0,
              textAlign: 'center', fontSize: '0.7rem', color: '#fbbf24', padding: '0 1rem'
            }}>
              Auto-scan not supported in this browser — use manual input below
            </div>
          )}
        </div>

        {/* Manual / hardware scanner input */}
        <form onSubmit={(e) => { e.preventDefault(); processScannedCode(manualCode); }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
            Hardware Gun / Manual Input
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <Input
                autoFocus
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Scan or type code..."
              />
            </div>
            <Button variant="primary" type="submit" disabled={scanning || !manualCode.trim()} style={{ height: '38px', padding: '0 1.25rem', whiteSpace: 'nowrap' }}>
              {scanning ? '...' : 'Find'}
            </Button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
          <button
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
              padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
