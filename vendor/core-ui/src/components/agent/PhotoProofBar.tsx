import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';

export interface PhotoProofBarProps {
  photos: string[];
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onZoomPhoto?: (url: string) => void;
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
  onPhotoUpload,
  onRemovePhoto,
  onZoomPhoto,
  isMandatory = false,
  disabled = false,
}) => {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

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
            onClick={() => cameraInputRef.current?.click()}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {photos.map((url, idx) => (
            <div key={`${url}-${idx}`} style={thumbWrapStyle}>
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
          ))}
        </div>
      )}
    </div>
  );
};
