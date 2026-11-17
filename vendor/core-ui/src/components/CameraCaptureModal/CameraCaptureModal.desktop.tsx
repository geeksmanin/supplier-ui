import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Camera, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { CameraCaptureModalProps } from './CameraCaptureModal.types';
import { ImageEditorModalDesktop } from '../ImageEditor/ImageEditorModal.desktop';

export const CameraCaptureModalDesktop: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo',
  preferredFacingMode = 'environment',
  initialSource = 'camera',
  enableEditor = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(preferredFacingMode);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // In-situ phase: 'capture' (viewfinder) or 'editor' (image editing)
  const [phase, setPhase] = useState<'capture' | 'editor'>('capture');
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);

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
        // Fallback without constraints
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
          ? 'Camera access was denied. Please allow camera permissions in your browser.'
          : 'Unable to access your camera device. Please ensure a webcam is connected.'
      );
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen) {
      setPhase('capture');
      setCapturedFile(null);
      if (capturedPreviewUrl) {
        URL.revokeObjectURL(capturedPreviewUrl);
        setCapturedPreviewUrl(null);
      }

      if (initialSource === 'gallery') {
        setTimeout(() => {
          galleryInputRef.current?.click();
        }, 50);
      } else {
        startCamera();
      }
    } else {
      stopStream();
      if (capturedPreviewUrl) {
        URL.revokeObjectURL(capturedPreviewUrl);
        setCapturedPreviewUrl(null);
      }
    }
    return () => {
      stopStream();
    };
  }, [isOpen, initialSource, startCamera, stopStream]);

  // Desktop keyboard accessibility (Escape to close)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleProcessFile = (file: File) => {
    stopStream();
    if (enableEditor === false) {
      onCapture(file);
      onClose();
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setCapturedFile(file);
    setCapturedPreviewUrl(previewUrl);
    setPhase('editor');
  };

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

      // Draw mirrored if user facing
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

          handleProcessFile(file);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Failed to capture frame from video:', err);
      setIsCapturing(false);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    handleProcessFile(file);
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCloseEditor = () => {
    if (capturedPreviewUrl) {
      URL.revokeObjectURL(capturedPreviewUrl);
      setCapturedPreviewUrl(null);
    }
    setCapturedFile(null);
    setPhase('capture');
    startCamera();
  };

  if (!isOpen) return null;

  if (phase === 'editor' && capturedPreviewUrl) {
    return (
      <ImageEditorModalDesktop
        isOpen={true}
        imageUrl={capturedPreviewUrl}
        initialFile={capturedFile || undefined}
        fileNamePrefix="capture"
        onClose={handleCloseEditor}
        onApply={(result) => {
          if (capturedPreviewUrl) {
            URL.revokeObjectURL(capturedPreviewUrl);
            setCapturedPreviewUrl(null);
          }
          onCapture(result.file);
          onClose();
        }}
      />
    );
  }

  const content = (
    <div style={styles.overlay}>
      {/* Hidden Gallery Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryChange}
        style={{ display: 'none' }}
      />

      <div style={styles.modalCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <Camera size={18} style={{ color: 'var(--primary, #008069)' }} />
            <span style={styles.headerTitle}>{title}</span>
          </div>
          <button
            type="button"
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close Camera"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div style={styles.viewfinderContainer}>
          {cameraError ? (
            <div style={styles.errorContainer}>
              <AlertCircle size={42} style={{ color: '#EA4335', marginBottom: 12 }} />
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
            <>
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
              {!cameraActive && (
                <div style={styles.loadingContainer}>
                  <div className="camera-loader-spinner" style={styles.spinner} />
                  <span style={{ fontSize: 13, color: '#94a3b8', marginTop: 10 }}>Starting camera...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div style={styles.footer}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              style={styles.iconAuxBtn}
              onClick={() => galleryInputRef.current?.click()}
              title="Choose photo from gallery"
              aria-label="Gallery"
            >
              <ImageIcon size={20} />
            </button>
            <button
              type="button"
              style={styles.iconAuxBtn}
              onClick={handleFlipCamera}
              title="Flip camera"
              disabled={!cameraActive}
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Shutter Button */}
          <button
            type="button"
            style={{
              ...styles.shutterRing,
              opacity: cameraActive && !isCapturing ? 1 : 0.5,
              cursor: cameraActive && !isCapturing ? 'pointer' : 'not-allowed',
            }}
            onClick={handleCapturePhoto}
            disabled={!cameraActive || isCapturing}
            aria-label="Take Photo"
          >
            <div style={styles.shutterCore} />
          </button>

          <div style={{ width: 88 }} />
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#0F172A',
    borderRadius: 18,
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#F8FAFC',
    letterSpacing: '-0.01em',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#F8FAFC',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease',
  },
  viewfinderContainer: {
    position: 'relative',
    width: '100%',
    height: 420,
    backgroundColor: '#000000',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#94A3B8',
    maxWidth: 360,
    lineHeight: 1.5,
    marginBottom: 20,
  },
  retryBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'var(--primary, #008069)',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  loadingContainer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid rgba(255, 255, 255, 0.15)',
    borderTopColor: 'var(--primary, #008069)',
    borderRadius: '50%',
    animation: 'camera-spin 0.8s linear infinite',
  },
  footer: {
    padding: '16px 24px',
    backgroundColor: '#1E293B',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconAuxBtn: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  shutterRing: {
    width: 66,
    height: 66,
    borderRadius: '50%',
    border: '3px solid #FFFFFF',
    backgroundColor: 'transparent',
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.1s ease',
  },
  shutterCore: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
  },
};
