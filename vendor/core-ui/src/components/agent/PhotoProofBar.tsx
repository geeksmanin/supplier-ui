import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';
import { CameraCaptureModal } from '../CameraCaptureModal/CameraCaptureModal';

export interface PhotoProofBarProps {
  photos: string[];
  photoRemarks?: Record<string, string>;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement> | File) => void;
  onRemovePhoto: (index: number) => void;
  onPhotoRemarkChange?: (index: number, remark: string) => void;
  onZoomPhoto?: (url: string) => void;
  onCameraClick?: () => void;
  isMandatory?: boolean;
  disabled?: boolean;
}

const actionPillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid #CBD5E1',
  backgroundColor: '#F8FAFC',
  color: '#334155',
  transition: 'all 0.15s ease',
};

const thumbWrapStyle: React.CSSProperties = {
  position: 'relative',
  width: 48,
  height: 48,
  borderRadius: 8,
  border: '1px solid #CBD5E1',
  overflow: 'hidden',
  flexShrink: 0,
};

const thumbImgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  cursor: 'pointer',
};

const removeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 2,
  right: 2,
  width: 16,
  height: 16,
  borderRadius: '50%',
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  color: '#FFFFFF',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};

export const PhotoProofBar: React.FC<PhotoProofBarProps> = ({
  photos,
  photoRemarks,
  onPhotoUpload,
  onRemovePhoto,
  onPhotoRemarkChange,
  onZoomPhoto,
  onCameraClick,
  isMandatory = false,
  disabled = false,
}) => {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isInternalCameraOpen, setIsInternalCameraOpen] = useState(false);

  const handleCameraBtnClick = () => {
    if (disabled) return;
    if (onCameraClick) {
      onCameraClick();
      return;
    }
    // Check if running on desktop or mobile
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      cameraInputRef.current?.click();
    } else {
      setIsInternalCameraOpen(true);
    }
  };

  return (
    <div
      className="photo-proof-bar-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPhotoUpload}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPhotoUpload}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            disabled={disabled}
            onClick={handleCameraBtnClick}
            style={actionPillStyle}
            title="Take photo using camera"
          >
            <Camera size={14} color="#008069" />
            <span>Camera</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => galleryInputRef.current?.click()}
            style={actionPillStyle}
            title="Choose photos from gallery"
          >
            <ImageIcon size={14} color="#2563EB" />
            <span>Gallery</span>
          </button>
        </div>

        <span style={{ fontSize: 11, color: isMandatory && photos.length === 0 ? '#DC2626' : '#64748B', fontWeight: 600 }}>
          {photos.length} attached {isMandatory ? '(Required)' : ''}
        </span>
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {photos.map((url, idx) => {
            const remark = photoRemarks?.[url] || '';
            return (
              <div key={`${url}-${idx}`} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', width: 72, flexShrink: 0 }}>
                <div style={thumbWrapStyle}>
                  <img
                    src={resolveMediaUrl(url)}
                    alt={`Photo proof ${idx + 1}`}
                    style={thumbImgStyle}
                    onClick={() => onZoomPhoto?.(url)}
                  />
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => onRemovePhoto(idx)}
                      style={removeBtnStyle}
                      title="Remove photo"
                      aria-label="Remove photo"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
                {onPhotoRemarkChange && (
                  <input
                    type="text"
                    value={remark}
                    placeholder="Caption"
                    disabled={disabled}
                    onChange={(e) => onPhotoRemarkChange(idx, e.target.value)}
                    style={{
                      width: '100%',
                      fontSize: 10,
                      padding: '2px 4px',
                      borderRadius: 4,
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      textAlign: 'center',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isInternalCameraOpen && (
        <CameraCaptureModal
          isOpen={isInternalCameraOpen}
          onClose={() => setIsInternalCameraOpen(false)}
          onCapture={(file) => {
            setIsInternalCameraOpen(false);
            onPhotoUpload(file);
          }}
        />
      )}
    </div>
  );
};

