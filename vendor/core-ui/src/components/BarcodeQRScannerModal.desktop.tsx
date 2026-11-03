import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useToast } from './Toast/Toast';
import { useBarcodeLookup } from '../hooks/useBarcodeLookup';
import { BarcodeQRScannerModalProps } from './BarcodeQRScannerModal.types';
export type { BarcodeQRScannerModalProps };

export const BarcodeQRScannerModalDesktop: React.FC<BarcodeQRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  lookupUrl = '',
  title = 'Scan Barcode / QR Code',
  subtitle = 'Point camera at code or hold to scan',
  showTextInput = true,
  fullscreen = true,
  inputPlaceholder = 'Scan or type Barcode / QR Code...',
  inputLabel = 'Hardware Gun / Manual Input',
}) => {
  const { showToast } = useToast();
  const { scanning, lookupCode } = useBarcodeLookup({ lookupUrl });
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScannedSuccess, setIsScannedSuccess] = useState(false);
  const isProcessingRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setIsScannedSuccess(false);
    isProcessingRef.current = false;
  }, []);

  const handleProcessCode = useCallback(async (code: string) => {
    if (!code) {
      isProcessingRef.current = false;
      setIsScannedSuccess(false);
      return;
    }
    const item = await lookupCode(code);
    if (item) {
      onScanSuccess(item);
      stopCamera();
      onClose();
    } else {
      isProcessingRef.current = false;
      setIsScannedSuccess(false);
    }
  }, [lookupCode, onScanSuccess, stopCamera, onClose]);

  const startCamera = useCallback(async (facing: 'environment' | 'user' = 'environment') => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (_) {}
      }
      setCameraActive(true);
      setFacingMode(facing);
      isProcessingRef.current = false;
      setIsScannedSuccess(false);
    } catch (err: any) {
      setCameraActive(false);
      const msg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied.'
          : err?.name === 'NotFoundError'
          ? 'No camera found.'
          : 'Camera unavailable.';
      setCameraError(msg);
      showToast(msg, 'error');
    }
  }, [showToast]);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        stopCamera();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, stopCamera, onClose]);

  const onVideoReady = useCallback(() => {
    if (!('BarcodeDetector' in window)) return;

    const detector = new (window as any).BarcodeDetector({
      formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'data_matrix', 'code_39', 'itf', 'aztec'],
    });

    const checkFrame = async () => {
      const video = videoRef.current;
      if (!isProcessingRef.current && video && video.readyState >= video.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes?.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue) {
              isProcessingRef.current = true;
              setIsScannedSuccess(true);
              try {
                if (navigator.vibrate) navigator.vibrate(60);
              } catch (_) {}
              setTimeout(async () => {
                await handleProcessCode(rawValue);
              }, 350);
              return;
            }
          }
        } catch (_) {}
      }
      animFrameRef.current = requestAnimationFrame(checkFrame);
    };
    animFrameRef.current = requestAnimationFrame(checkFrame);
  }, [handleProcessCode]);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          backgroundColor: '#0F172A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>{title}</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {cameraActive && (
            <button
              type="button"
              onClick={() => startCamera(facingMode === 'environment' ? 'user' : 'environment')}
              title="Switch camera"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              🔄
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            title="Close scanner"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Camera Viewport with Hold-to-Unblur */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: fullscreen ? 1 : 'none',
          height: fullscreen ? '100%' : 280,
          backgroundColor: '#000000',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onLoadedMetadata={onVideoReady}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: cameraActive ? 'block' : 'none',
            filter: isScannedSuccess ? 'brightness(1.15)' : 'none',
            transition: 'filter 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />

        {cameraActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Viewfinder Reticle */}
            <div
              style={{
                position: 'relative',
                width: fullscreen ? '55%' : '75%',
                height: fullscreen ? '55%' : '60%',
                maxWidth: 440,
                maxHeight: 260,
                border: isScannedSuccess ? '3px solid #22C55E' : '2px dashed rgba(255, 255, 255, 0.65)',
                borderRadius: 14,
                boxShadow: isScannedSuccess
                  ? '0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 24px rgba(34, 197, 94, 0.6)'
                  : '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isScannedSuccess ? (
                <div
                  style={{
                    backgroundColor: 'rgba(22, 163, 74, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'center',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  ✓ Scanned! Loading...
                </div>
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    left: '5%',
                    right: '5%',
                    height: 2,
                    backgroundColor: '#22C55E',
                    boxShadow: '0 0 10px #22C55E',
                    animation: 'desktop-scanner-laser 1.6s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <style>{`
              @keyframes desktop-scanner-laser {
                0% { top: 12%; opacity: 0.5; }
                50% { top: 88%; opacity: 1; }
                100% { top: 12%; opacity: 0.5; }
              }
            `}</style>
          </div>
        )}

        {!cameraActive && (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '1.5rem' }}>
            {cameraError ? (
              <>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
                <p style={{ fontSize: '0.82rem', color: '#F87171', margin: '0 0 0.8rem' }}>{cameraError}</p>
                <Button variant="primary" type="button" onClick={() => startCamera(facingMode)}>
                  Retry Camera
                </Button>
              </>
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Starting camera scanner...</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Control Deck */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          backgroundColor: '#0F172A',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: fullscreen ? 560 : undefined,
          margin: fullscreen ? '0 auto' : undefined,
          width: fullscreen ? '100%' : undefined,
          boxSizing: 'border-box',
        }}
      >
        {/* Continuous Active Scan Indicator */}
        {cameraActive && (
          <div
            style={{
              width: '100%',
              height: 46,
              borderRadius: 12,
              backgroundColor: isScannedSuccess ? '#16A34A' : '#1E293B',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: isScannedSuccess ? '1px solid #22C55E' : '1px solid #334155',
              boxShadow: isScannedSuccess ? '0 0 16px rgba(34, 197, 94, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: isScannedSuccess ? '#FFFFFF' : '#22C55E',
                boxShadow: isScannedSuccess ? '0 0 8px #FFFFFF' : '0 0 8px #22C55E',
              }}
            />
            <span>{isScannedSuccess ? '✓ Scanned! Loading Item...' : 'Point camera at Barcode / QR Code'}</span>
          </div>
        )}

        {showTextInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCode(manualCode);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <label style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>
              {inputLabel}
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  autoFocus
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={inputPlaceholder}
                  style={{
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    fontSize: 14,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={scanning || !manualCode.trim()}
                style={{
                  height: 44,
                  minWidth: 76,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: scanning || !manualCode.trim() ? '#475569' : '#008069',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: scanning || !manualCode.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {scanning ? '...' : 'Find'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );

  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0B0F19',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera();
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 16,
          maxWidth: 540,
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        {content}
      </div>
    </div>
  );
};
