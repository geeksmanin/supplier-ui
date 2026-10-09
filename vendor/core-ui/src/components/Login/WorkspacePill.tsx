import React from 'react';

export interface WorkspacePillProps {
  workspaceCode: string;
  workspaceName?: string;
  onChangeClick: () => void;
  style?: React.CSSProperties;
  variant?: 'light' | 'dark' | 'glass';
}

export const WorkspacePill: React.FC<WorkspacePillProps> = ({
  workspaceCode,
  workspaceName,
  onChangeClick,
  style,
  variant = 'light',
}) => {
  const isBusinessPlaceholder = !workspaceCode || workspaceCode.toLowerCase() === 'business';
  const displayName = isBusinessPlaceholder
    ? 'Choose Workspace'
    : (workspaceName || workspaceCode).toUpperCase();

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
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.35rem 0.65rem 0.35rem 0.75rem',
        borderRadius: '100px',
        fontSize: '0.8rem',
        fontWeight: 600,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease',
        ...vStyles.container,
        ...style,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ fontSize: '0.9rem' }}>🏢</span>
        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', ...vStyles.label }}>
          Workspace:
        </span>
        <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>
          {displayName}
        </span>
      </span>

      <button
        type="button"
        onClick={onChangeClick}
        title="Switch to another tenant workspace"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.2rem 0.55rem',
          borderRadius: '100px',
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          ...vStyles.btn,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span style={{ fontSize: '0.8rem' }}>⇄</span>
        <span>Change</span>
      </button>
    </div>
  );
};
