import React, { useState, useRef, useEffect } from 'react';
import { useBranch, BranchInfo } from '../context/BranchContext';

export interface BranchSelectorProps {
  style?: React.CSSProperties;
  compact?: boolean;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({ style, compact = false }) => {
  const {
    activeBranch,
    activeBranchDetails,
    availableBranches,
    isMultiBranch,
    loading,
    setActiveBranch,
  } = useBranch();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (loading && availableBranches.length === 0) {
    return null;
  }

  // Single-Branch Staff: Fixed Clean Pill Badge
  if (!isMultiBranch) {
    const code = activeBranchDetails?.code || activeBranch || 'HQ';
    const name = activeBranchDetails?.name || 'Head Office';

    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: compact ? '0.2rem 0.5rem' : '0.3rem 0.75rem',
          borderRadius: '20px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#334155',
          fontSize: compact ? '0.72rem' : '0.78rem',
          fontWeight: 600,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          ...style,
        }}
        title={`Operating Branch: ${name} (${code})`}
      >
        <svg
          width={compact ? 12 : 14}
          height={compact ? 12 : 14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
          <path d="M10 6h4" />
          <path d="M10 10h4" />
          <path d="M10 14h4" />
          <path d="M10 18h4" />
        </svg>
        <span style={{ color: '#0f172a' }}>[{code}]</span>
        {!compact && (
          <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </span>
        )}
      </div>
    );
  }

  // Multi-Branch Staff & Admins: Interactive Dropdown
  const isConsolidated = activeBranch === 'ALL';
  const displayLabel = isConsolidated
    ? 'All Branches'
    : `[${activeBranch}] ${compact ? '' : activeBranchDetails?.name || ''}`.trim();

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        ...style,
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: compact ? '0.25rem 0.55rem' : '0.35rem 0.8rem',
          borderRadius: '20px',
          backgroundColor: isConsolidated ? '#f0fdf4' : '#f8fafc',
          border: isConsolidated ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
          color: isConsolidated ? '#15803d' : '#0f172a',
          fontSize: compact ? '0.72rem' : '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'all 0.15s ease',
          outline: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isConsolidated ? '#dcfce7' : '#f1f5f9';
          e.currentTarget.style.borderColor = isConsolidated ? '#86efac' : '#94a3b8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isConsolidated ? '#f0fdf4' : '#f8fafc';
          e.currentTarget.style.borderColor = isConsolidated ? '#bbf7d0' : '#cbd5e1';
        }}
        title="Switch Operating Branch"
      >
        <svg
          width={compact ? 12 : 14}
          height={compact ? 12 : 14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isConsolidated ? '#16a34a' : '#475569'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isConsolidated ? (
            <>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </>
          ) : (
            <>
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
            </>
          )}
        </svg>

        <span>{displayLabel}</span>

        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
            color: '#64748b',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '270px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            padding: '0.4rem',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            style={{
              padding: '0.4rem 0.6rem',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '0.35rem',
            }}
          >
            Operating Branch
          </div>

          {/* Consolidated Option */}
          <button
            type="button"
            onClick={() => {
              setActiveBranch('ALL');
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.65rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isConsolidated ? '#eff6ff' : 'transparent',
              color: isConsolidated ? '#1d4ed8' : '#0f172a',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '0.8rem',
              fontWeight: isConsolidated ? 600 : 500,
              transition: 'background-color 0.12s ease',
              marginBottom: '0.25rem',
            }}
            onMouseEnter={(e) => {
              if (!isConsolidated) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              if (!isConsolidated) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>All Branches (Consolidated)</span>
            </div>
            {isConsolidated && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>

          <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0.25rem 0' }} />

          {/* Individual Branches List */}
          <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {availableBranches.map((b: BranchInfo) => {
              const isSelected = activeBranch === b.code;
              return (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => {
                    setActiveBranch(b.code);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                    color: isSelected ? '#1d4ed8' : '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 600 : 500,
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                    <span style={{ fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                      [{b.code}]
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.name}
                    </span>
                    {b.is_head_office && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                          backgroundColor: '#e0e7ff',
                          color: '#3730a3',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        HQ
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
