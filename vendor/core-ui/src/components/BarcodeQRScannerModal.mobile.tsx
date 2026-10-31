import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useToast } from './Toast/Toast';
import { useBarcodeLookup } from '../hooks/useBarcodeLookup';
import { BarcodeQRScannerModalProps } from './BarcodeQRScannerModal.types';

export const BarcodeQRScannerModalMobile: React.FC<BarcodeQRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  lookupUrl = '',
  title = 'Scan Barcode / QR Code',
  subtitle = 'Point camera at code or hold to scan',
  showTextInput = true,
  inputPlaceholder = 'Scan or type Barcode / QR Code...',
  inputLabel = 'Hardware Gun / Manual Input',
}) => {
  const { showToast } = useToast();
  const { scanning, lookupCode } = useBarcodeLookup({ lookupUrl });
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isHoldingScan, setIsHoldingScan] = useState(false);
  const isHoldingScanRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    isHoldingScanRef.current = isHoldingScan;
  }, [isHoldingScan]);

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
    setIsHoldingScan(false);
  }, []);

  const handleProcessCode = useCallback(async (code: string) => {
    if (!code) return;
    const item = await lookupCode(code);
    if (item) {
      onScanSuccess(item);
      stopCamera();
      onClose();
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

  const onVideoReady = useCallback(() => {
    if (!('BarcodeDetector' in window)) return;

    const detector = new (window as any).BarcodeDetector({
      formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'data_matrix', 'code_39', 'itf', 'aztec'],
    });

    const checkFrame = async () => {
      const video = videoRef.current;
      if (isHoldingScanRef.current && video && video.readyState >= video.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(video);
          if (barcodes?.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue) {
              stopCamera();
              await handleProcessCode(rawValue);
              return;
            }
          }
        } catch (_) {}
      }
      animFrameRef.current = requestAnimationFrame(checkFrame);
    };
    animFrameRef.current = requestAnimationFrame(checkFrame);
  }, [handleProcessCode, stopCamera]);

  if (!isOpen) return null;

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
      {/* 1. Fullscreen Apple HIG Top Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: '#0F172A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>{title}</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94A3B8' }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {cameraActive && (
            <button
              type="button"
              onClick={() => startCamera(facingMode === 'environment' ? 'user' : 'environment')}
              title="Switch camera"
              style={{
                width: 38,
                height: 38,
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
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 20,
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

      {/* 2. Fullscreen Camera Viewport with Hold-to-Unblur */}
      <div
        style={{
          flex: 1,
          position: 'relative',
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
            filter: isHoldingScan ? 'none' : 'blur(16px)',
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
                width: '75%',
                height: '50%',
                maxWidth: 340,
                maxHeight: 220,
                border: isHoldingScan ? '2px solid #22C55E' : '2px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: 14,
                boxShadow: isHoldingScan ? '0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 16px rgba(34, 197, 94, 0.4)' : '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!isHoldingScan && (
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '8px 14px',
                    borderRadius: 20,
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  Hold button below to focus camera
                </div>
              )}

              {isHoldingScan && (
                <div
                  style={{
                    position: 'absolute',
                    left: '5%',
                    right: '5%',
                    height: 2,
                    backgroundColor: '#22C55E',
                    boxShadow: '0 0 10px #22C55E',
                    animation: 'scanner-laser 1.6s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            <style>{`
              @keyframes scanner-laser {
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

      {/* 3. Bottom Control Deck */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#0F172A',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Press & Hold Scan Action */}
        {cameraActive && (
          <button
            type="button"
            onMouseDown={() => setIsHoldingScan(true)}
            onMouseUp={() => setIsHoldingScan(false)}
            onMouseLeave={() => setIsHoldingScan(false)}
            onTouchStart={(e) => {
              e.preventDefault();
              setIsHoldingScan(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              setIsHoldingScan(false);
            }}
            onTouchCancel={() => setIsHoldingScan(false)}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              border: 'none',
              backgroundColor: isHoldingScan ? '#16A34A' : '#2563EB',
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: isHoldingScan ? '0 0 0 4px rgba(22, 163, 74, 0.4)' : '0 4px 12px rgba(37, 99, 235, 0.3)',
              transform: isHoldingScan ? 'scale(0.98)' : 'scale(1)',
              transition: 'all 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <span>{isHoldingScan ? 'Scanning... (Release to Stop)' : 'Press & Hold to Scan Code'}</span>
          </button>
        )}

        {/* Aligned Hardware Gun / Manual Input Row (Toggled via showTextInput) */}
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
    </div>
  );
};
