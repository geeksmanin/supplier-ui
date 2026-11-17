import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RefreshCw, AlertCircle } from 'lucide-react';
import { CameraCaptureModalProps } from './CameraCaptureModal.types';

export const CameraCaptureModalMobile: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  preferredFacingMode = 'environment',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(preferredFacingMode);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    stopStream();
    setCameraError(null);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('CameraCaptureModal getUserMedia failed:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera access was denied. Please allow camera permissions.'
          : 'Unable to access your camera device.'
      );
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  const handleCapturePhoto = () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsCapturing(false);
        return;
      }

      if (facingMode === 'user') {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          setIsCapturing(false);
          if (!blob) return;

          const file = new File([blob], `photo_${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          stopStream();
          onCapture(file);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Failed to capture frame from video:', err);
      setIsCapturing(false);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      {/* Top Floating Controls */}
      <div style={styles.topBar}>
        <button
          type="button"
          style={styles.circleBtn}
          onClick={onClose}
          aria-label="Close Camera"
        >
          <X size={22} />
        </button>
      </div>

      {/* Full Viewfinder */}
      <div style={styles.viewfinder}>
        {cameraError ? (
          <div style={styles.errorContainer}>
            <AlertCircle size={44} style={{ color: '#EA4335', marginBottom: 12 }} />
            <div style={styles.errorTitle}>Camera Unavailable</div>
            <p style={styles.errorText}>{cameraError}</p>
            <button
              type="button"
              style={styles.retryBtn}
              onClick={startCamera}
            >
              Try Again
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              ...styles.video,
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
          />
        )}
      </div>

      {/* Bottom Floating Bar */}
      <div style={styles.bottomBar}>
        <button
          type="button"
          style={styles.circleBtn}
          onClick={handleFlipCamera}
          title="Flip camera"
          disabled={!cameraActive}
        >
          <RefreshCw size={22} />
        </button>

        <button
          type="button"
          style={{
            ...styles.shutterRing,
            opacity: cameraActive && !isCapturing ? 1 : 0.5,
          }}
          onClick={handleCapturePhoto}
          disabled={!cameraActive || isCapturing}
          aria-label="Take Photo"
        >
          <div style={styles.shutterCore} />
        </button>

        <div style={{ width: 48 }} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#000000',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    height: '100dvh',
  },
  topBar: {
    position: 'absolute',
    top: 'max(16px, env(safe-area-inset-top))',
    left: 16,
    right: 16,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  viewfinder: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  errorContainer: {
    padding: '30px 24px',
    textAlign: 'center',
    color: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#94A3B8',
    maxWidth: 320,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  retryBtn: {
    padding: '10px 22px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'var(--primary, #008069)',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 'max(24px, env(safe-area-inset-bottom))',
    left: 0,
    right: 0,
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  shutterRing: {
    width: 74,
    height: 74,
    borderRadius: '50%',
    border: '4px solid #FFFFFF',
    backgroundColor: 'transparent',
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterCore: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
  },
};
