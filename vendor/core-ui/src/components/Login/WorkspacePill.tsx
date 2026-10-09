import React, { useState, useEffect, useRef } from 'react';
import { resolveTenantByCode, TenantMetadata } from '../../api/client';

export interface WorkspacePillProps {
  workspaceCode: string;
  workspaceName?: string;
  onChangeClick?: () => void;
  onWorkspaceChange?: (newCode: string, metadata?: TenantMetadata) => void;
  style?: React.CSSProperties;
  variant?: 'light' | 'dark' | 'glass';
  inline?: boolean;
}

export function cleanWorkspaceCode(raw: string): string {
  let clean = raw.trim().toLowerCase();
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const parsed = JSON.parse(clean);
      clean = parsed.tenant_code || parsed.workspace || parsed.code || clean;
    } catch (e) {}
  }
  if (clean.includes('http://') || clean.includes('https://')) {
    try {
      const url = new URL(clean);
      const queryWs = url.searchParams.get('workspace') || url.searchParams.get('tenant') || url.searchParams.get('tenant_code');
      if (queryWs) {
        clean = queryWs;
      } else {
        const parts = url.hostname.split('.');
        if (parts.length > 2 && !['www', 'app', 'staff', 'customer', 'portal', 'samwad'].includes(parts[0])) {
          clean = parts[0];
        }
      }
    } catch (e) {}
  }
  return clean.replace(/[^a-z0-9_-]/gi, '').toLowerCase();
}

export const WorkspacePill: React.FC<WorkspacePillProps> = ({
  workspaceCode,
  workspaceName,
  onChangeClick,
  onWorkspaceChange,
  style,
  variant = 'light',
  inline = true,
}) => {
  const isBusinessPlaceholder = !workspaceCode || workspaceCode.toLowerCase() === 'business';
  const displayName = isBusinessPlaceholder
    ? 'Choose Workspace'
    : (workspaceName || workspaceCode).toUpperCase();

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(isBusinessPlaceholder ? '' : workspaceCode);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(isBusinessPlaceholder ? '' : workspaceCode);
    }
  }, [workspaceCode, isEditing, isBusinessPlaceholder]);

  // Clean up camera on unmount or when scanner closes
  useEffect(() => {
    if (!isScannerOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScannerOpen]);

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      setIsScannerOpen(true);
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      streamRef.current = stream;

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

      scanVideoFrames();
    } catch (err) {
      console.error('Camera access failed:', err);
      setErrorMessage('Camera unavailable. Type workspace slug manually.');
    }
  };

  const scanVideoFrames = () => {
    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'code_128', 'ean_13', 'data_matrix'],
      });
      const checkFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const raw = barcodes[0].rawValue;
              if (raw) {
                const clean = cleanWorkspaceCode(raw);
                if (clean) {
                  stopCamera();
                  setIsScannerOpen(false);
                  applyWorkspace(clean);
                  return;
                }
              }
            }
          } catch (e) {}
        }
        animFrameRef.current = requestAnimationFrame(checkFrame);
      };
      animFrameRef.current = requestAnimationFrame(checkFrame);
    }
  };

  const applyWorkspace = async (targetCode: string) => {
    const cleaned = cleanWorkspaceCode(targetCode);
    if (!cleaned) {
      setErrorMessage('Please enter a valid workspace code');
      return;
    }

    try {
      localStorage.setItem('tenant_code', cleaned);
      localStorage.setItem('workspace_code', cleaned);
      localStorage.setItem('current_tenant_code', cleaned);

      let meta: TenantMetadata | null = null;
      try {
        meta = await resolveTenantByCode(cleaned);
        if (meta?.name) {
          localStorage.setItem('tenant_name', meta.name);
        }
      } catch (e) {
        meta = {
          tenant_code: cleaned,
          workspace: cleaned,
          name: cleaned.toUpperCase(),
          is_active: true,
        };
      }

      setIsEditing(false);
      setIsScannerOpen(false);
      setErrorMessage(null);

      if (onWorkspaceChange) {
        onWorkspaceChange(cleaned, meta || undefined);
      } else if (onChangeClick) {
        onChangeClick();
      }
    } catch (err: any) {
      setErrorMessage('Failed to save workspace');
    }
  };

  const handleStartEdit = () => {
    if (inline) {
      setIsEditing(true);
      setInputValue(isBusinessPlaceholder ? '' : workspaceCode);
      setErrorMessage(null);
    } else if (onChangeClick) {
      onChangeClick();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsScannerOpen(false);
    stopCamera();
    setErrorMessage(null);
    setInputValue(isBusinessPlaceholder ? '' : workspaceCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyWorkspace(inputValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'dark':
        return {
          container: {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
          },
          label: {
            color: 'rgba(255, 255, 255, 0.75)',
          },
          btn: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.35)',
          },
          inputBg: 'rgba(0, 0, 0, 0.25)',
          inputColor: '#ffffff',
          inputBorder: 'rgba(255, 255, 255, 0.4)',
        };
      case 'glass':
        return {
          container: {
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            color: '#0f172a',
          },
          label: {
            color: '#64748b',
          },
          btn: {
            backgroundColor: '#ffffff',
            color: '#2563eb',
            border: '1px solid #cbd5e1',
          },
          inputBg: '#ffffff',
          inputColor: '#0f172a',
          inputBorder: '#cbd5e1',
        };
      default:
        return {
          container: {
            backgroundColor: isBusinessPlaceholder ? '#fef3c7' : '#f1f5f9',
            border: `1px solid ${isBusinessPlaceholder ? '#fcd34d' : '#e2e8f0'}`,
            color: isBusinessPlaceholder ? '#92400e' : '#1e293b',
          },
          label: {
            color: isBusinessPlaceholder ? '#b45309' : '#64748b',
          },
          btn: {
            backgroundColor: '#ffffff',
            color: '#2563eb',
            border: '1px solid #cbd5e1',
          },
          inputBg: '#ffffff',
          inputColor: '#0f172a',
          inputBorder: '#cbd5e1',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* 1. Main Pill / Inline Input Bar */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: isEditing ? '0.25rem 0.35rem 0.25rem 0.65rem' : '0.35rem 0.65rem 0.35rem 0.75rem',
          borderRadius: '100px',
          fontSize: '0.8rem',
          fontWeight: 600,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
          ...vStyles.container,
          ...style,
        }}
      >
        {!isEditing ? (
          <>
            <span
              onClick={handleStartEdit}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
              title="Click to edit workspace inline"
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                  ...vStyles.label,
                }}
              >
                Workspace:
              </span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.02em',
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {displayName}
              </span>
            </span>

            {/* Edit Pencil Button */}
            <button
              type="button"
              onClick={handleStartEdit}
              title="Edit workspace inline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease',
                ...vStyles.btn,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </>
        ) : (
          /* INLINE EDIT MODE - Direct Input & Action Controls */
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.04em',
                ...vStyles.label,
              }}
            >
              WS:
            </span>

            <input
              type="text"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. platform"
              style={{
                border: `1.5px solid ${vStyles.inputBorder}`,
                borderRadius: '50px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: vStyles.inputColor,
                backgroundColor: vStyles.inputBg,
                outline: 'none',
                width: '110px',
                boxSizing: 'border-box',
              }}
            />

            {/* QR Scan Button (Opens Inline Camera Directly - Zero Modal) */}
            <button
              type="button"
              onClick={() => {
                if (isScannerOpen) {
                  stopCamera();
                  setIsScannerOpen(false);
                } else {
                  startCamera();
                }
              }}
              title={isScannerOpen ? 'Close scanner' : 'Scan workspace QR code directly'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: isScannerOpen ? '#ef4444' : '#10b981',
                color: '#ffffff',
                border: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {isScannerOpen ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              )}
            </button>

            {/* Apply Checkmark Button */}
            <button
              type="button"
              onClick={() => applyWorkspace(inputValue)}
              title="Apply workspace"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: '#008069',
                color: '#ffffff',
                border: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>

            {/* Cancel (✕) Button */}
            <button
              type="button"
              onClick={handleCancelEdit}
              title="Cancel"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                padding: 0,
                cursor: 'pointer',
                outline: 'none',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* 2. Error Message Badge (if any) */}
      {errorMessage && (
        <div
          style={{
            marginTop: '0.35rem',
            fontSize: '0.72rem',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '0.2rem 0.5rem',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* 3. INLINE CAMERA SCANNER VIEWFINDER - Purely Embedded in Page, Zero Modal! */}
      {isScannerOpen && (
        <div
          style={{
            marginTop: '0.65rem',
            width: '240px',
            height: '190px',
            borderRadius: '16px',
            backgroundColor: '#0f172a',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 0 2px #008069',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Aiming Reticle Overlay */}
          <div
            style={{
              position: 'absolute',
              width: '110px',
              height: '110px',
              border: '2px solid rgba(0, 128, 105, 0.85)',
              borderRadius: '12px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
              pointerEvents: 'none',
            }}
          />

          {/* Header Tag */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
              backdropFilter: 'blur(4px)',
            }}
          >
            ALIGN QR CODE
          </div>

          {/* Close Scanner Button */}
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setIsScannerOpen(false);
            }}
            title="Close camera"
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '13px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
