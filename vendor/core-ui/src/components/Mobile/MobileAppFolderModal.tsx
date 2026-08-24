import React from 'react';
import { X } from 'lucide-react';
import type { AppFolderGroup, AppFolderItem } from '../../types/MobileTabTypes';

export interface MobileAppFolderModalProps {
  group: AppFolderGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (item: AppFolderItem) => void;
  currentPath?: string;
}

export const MobileAppFolderModal: React.FC<MobileAppFolderModalProps> = ({
  group,
  isOpen,
  onClose,
  onSelectApp,
  currentPath,
}) => {
  if (!isOpen || !group) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          borderRadius: '28px',
          padding: '1.5rem 1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6) inset',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header (Folder Title + Close Icon) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            padding: '0 0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: group.color || '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              {React.createElement(group.icon, { size: 18 })}
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '-0.01em',
              }}
            >
              {group.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(241, 245, 249, 0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 3x3 App Icon Grid */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.9rem 0.5rem',
            justifyItems: 'center',
          }}
        >
          {group.items.map((item) => {
            const isActive = currentPath === item.path;
            const ItemIcon = item.icon;
            const iconBg = item.color || '#f1f5f9';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectApp(item);
                  onClose();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '16px',
                  width: '84px',
                  transition: 'transform 0.15s ease',
                  outline: 'none',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '54px',
                    height: '54px',
                    borderRadius: '18px',
                    backgroundColor: isActive ? '#2563eb' : '#ffffff',
                    border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    boxShadow: isActive
                      ? '0 8px 16px -4px rgba(37, 99, 235, 0.4)'
                      : '0 4px 8px -2px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#ffffff' : (item.color || '#334155'),
                  }}
                >
                  <ItemIcon size={24} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        borderRadius: '9999px',
                        padding: '1px 5px',
                        border: '2px solid #ffffff',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#2563eb' : '#1e293b',
                    textAlign: 'center',
                    lineHeight: '1.15',
                    maxWidth: '80px',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
