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
  const [isScannedSuccess, setIsScannedSuccess] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(4);
  const [stepZoom, setStepZoom] = useState(0.1);
  const [hasHardwareZoom, setHasHardwareZoom] = useState(false);
  const [isHoldingToScan, setIsHoldingToScan] = useState(false);
  const [continuousScan, setContinuousScan] = useState(false);
  const isProcessingRef = useRef(false);
  const isHoldingRef = useRef(false);
  const continuousScanRef = useRef(false);

  useEffect(() => {
    isHoldingRef.current = isHoldingToScan;
  }, [isHoldingToScan]);

  useEffect(() => {
    continuousScanRef.current = continuousScan;
  }, [continuousScan]);

  const applyZoom = useCallback(async (newZoom: number) => {
    const clamped = Math.min(Math.max(newZoom, minZoom), maxZoom);
    setZoom(clamped);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          const capabilities = (track.getCapabilities?.() as any) || {};
          if (capabilities.zoom) {
            const minZ = typeof capabilities.zoom.min === 'number' ? capabilities.zoom.min : minZoom;
            const maxZ = typeof capabilities.zoom.max === 'number' ? capabilities.zoom.max : maxZoom;
            const hwZoom = Math.min(Math.max(clamped, minZ), maxZ);
            await (track as any).applyConstraints({
              advanced: [{ zoom: hwZoom }],
            });
          }
        } catch (_) {}
      }
    }
  }, [minZoom, maxZoom]);

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
    setIsHoldingToScan(false);
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
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        try {
          const caps = (track.getCapabilities() as any) || {};
          if (caps.zoom) {
            const minZ = typeof caps.zoom.min === 'number' ? caps.zoom.min : 1;
            const maxZ = typeof caps.zoom.max === 'number' ? caps.zoom.max : 4;
            const stepZ = typeof caps.zoom.step === 'number' ? caps.zoom.step : 0.1;
            setMinZoom(minZ);
            setMaxZoom(maxZ);
            setStepZoom(stepZ);
            setHasHardwareZoom(true);
          }
        } catch (_) {}
      }
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
      setZoom(1);
      setIsHoldingToScan(false);
      startCamera('environment');
    } else {
      stopCamera();
      setManualCode('');
      setCameraError(null);
      setZoom(1);
      setIsHoldingToScan(false);
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
      const shouldScan = isHoldingRef.current || continuousScanRef.current;
      if (shouldScan && !isProcessingRef.current && video && video.readyState >= video.HAVE_ENOUGH_DATA) {
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        height: '100dvh',
        maxHeight: '100dvh',
        backgroundColor: '#0B0F19',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Fullscreen Apple HIG Top Navigation Bar (Compact) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#0F172A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>{title}</h3>
          <p style={{ margin: '1px 0 0', fontSize: '0.7rem', color: '#94A3B8' }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {cameraActive && (
            <button
              type="button"
              onClick={() => startCamera(facingMode === 'environment' ? 'user' : 'environment')}
              title="Switch camera"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 15,
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
              width: 34,
              height: 34,
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

      {/* 2. Camera Viewport with Zoom Slider & Viewfinder */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
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
            filter: isScannedSuccess ? 'brightness(1.15)' : 'none',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />

        {/* Floating Zoom Controls Slider Pill */}
        {cameraActive && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: '6px 12px',
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.18)',
              zIndex: 10,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#38BDF8',
                fontFamily: 'monospace',
                minWidth: 38,
              }}
            >
              {zoom.toFixed(1)}x
            </span>
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={stepZoom}
              value={zoom}
              onChange={(e) => applyZoom(parseFloat(e.target.value))}
              style={{
                flex: 1,
                accentColor: '#38BDF8',
                height: 4,
                cursor: 'pointer',
              }}
              title="Camera Zoom Slider"
              aria-label="Camera Zoom"
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#94A3B8',
                whiteSpace: 'nowrap',
              }}
            >
              {maxZoom.toFixed(1)}x max
            </span>
          </div>
        )}

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
                width: 'min(260px, 72vw)',
                height: 'min(170px, 24vh)',
                border: isScannedSuccess
                  ? '3px solid #22C55E'
                  : (isHoldingToScan || continuousScan)
                  ? '2px solid #38BDF8'
                  : '2px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: 14,
                boxShadow: isScannedSuccess
                  ? '0 0 0 9999px rgba(0, 0, 0, 0.45), 0 0 24px rgba(34, 197, 94, 0.6)'
                  : (isHoldingToScan || continuousScan)
                  ? '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.4)'
                  : '0 0 0 9999px rgba(0, 0, 0, 0.6)',
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
              ) : (isHoldingToScan || continuousScan) ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '5%',
                    right: '5%',
                    height: 2,
                    backgroundColor: '#38BDF8',
                    boxShadow: '0 0 10px #38BDF8',
                    animation: 'scanner-laser 1.4s ease-in-out infinite',
                  }}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(6px)',
                    padding: '6px 14px',
                    borderRadius: 20,
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  👆 Hold button below to scan
                </div>
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

      {/* 3. Bottom Control Deck (Compact, Zero-Scroll) */}
      <div
        style={{
          padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))',
          backgroundColor: '#0F172A',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Press-and-Hold to Scan Interactive Button with Continuous Mode Toggle */}
        {cameraActive && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              onPointerDown={() => setIsHoldingToScan(true)}
              onPointerUp={() => setIsHoldingToScan(false)}
              onPointerLeave={() => setIsHoldingToScan(false)}
              onPointerCancel={() => setIsHoldingToScan(false)}
              onTouchStart={() => setIsHoldingToScan(true)}
              onTouchEnd={() => setIsHoldingToScan(false)}
              onTouchCancel={() => setIsHoldingToScan(false)}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                backgroundColor: isScannedSuccess
                  ? '#16A34A'
                  : (isHoldingToScan || continuousScan)
                  ? '#0284C7'
                  : '#1E293B',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                border: (isHoldingToScan || continuousScan)
                  ? '2px solid #38BDF8'
                  : '1px solid #334155',
                boxShadow: (isHoldingToScan || continuousScan)
                  ? '0 0 16px rgba(56, 189, 248, 0.45)'
                  : '0 2px 6px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transform: isHoldingToScan ? 'scale(0.98)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  backgroundColor: isScannedSuccess
                    ? '#FFFFFF'
                    : (isHoldingToScan || continuousScan)
                    ? '#38BDF8'
                    : '#94A3B8',
                  boxShadow: (isHoldingToScan || continuousScan)
                    ? '0 0 10px #38BDF8'
                    : 'none',
                }}
              />
              <span>
                {isScannedSuccess
                  ? '✓ Scanned!'
                  : (isHoldingToScan || continuousScan)
                  ? '🟢 Scanning...'
                  : '👆 Press & Hold to Scan'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setContinuousScan(!continuousScan)}
              title={continuousScan ? 'Switch to Press & Hold mode' : 'Switch to Continuous scan mode'}
              style={{
                height: 44,
                padding: '0 12px',
                borderRadius: 12,
                backgroundColor: continuousScan ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                border: continuousScan ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.12)',
                color: continuousScan ? '#38BDF8' : '#94A3B8',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 14 }}>{continuousScan ? '⚡' : '🔒'}</span>
              <span>{continuousScan ? 'Auto' : 'Hold'}</span>
            </button>
          </div>
        )}

        {/* Aligned Hardware Gun / Manual Input Row (Toggled via showTextInput) */}
        {showTextInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCode(manualCode);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  autoFocus
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={inputPlaceholder}
                  style={{
                    height: 38,
                    borderRadius: 8,
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid #334155',
                    fontSize: 13,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={scanning || !manualCode.trim()}
                style={{
                  height: 38,
                  minWidth: 64,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: scanning || !manualCode.trim() ? '#475569' : '#008069',
                  color: '#FFFFFF',
                  fontSize: 13,
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
