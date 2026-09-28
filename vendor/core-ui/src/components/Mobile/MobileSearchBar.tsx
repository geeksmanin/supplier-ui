import React from 'react';

export interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  rightAction?: React.ReactNode;
  disabled?: boolean;
}

export const MobileSearchBar: React.FC<MobileSearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  onFilterClick,
  activeFilterCount = 0,
  rightAction,
  disabled = false,
}) => {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxSizing: 'border-box',
    }}>
      {/* Search Input Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: '10px',
        padding: '0 10px',
        height: '38px',
        border: '1px solid #e2e8f0',
        transition: 'border-color 0.15s ease',
      }}>
        {/* Search SVG Icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64748b"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginRight: '8px' }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '0.85rem',
            color: '#0f172a',
            padding: '4px 0',
          }}
        />

        {/* Clear Icon Button if text entered */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
            style={{
              background: '#cbd5e1',
              border: 'none',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              marginLeft: '4px',
              color: '#334155',
            }}
            title="Clear search"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Button with Count Badge */}
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: activeFilterCount > 0 ? '#eff6ff' : '#f1f5f9',
            border: `1px solid ${activeFilterCount > 0 ? '#3b82f6' : '#e2e8f0'}`,
            color: activeFilterCount > 0 ? '#2563eb' : '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          title={activeFilterCount > 0 ? `${activeFilterCount} filters active` : 'Filter list'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>

          {activeFilterCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: 800,
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              border: '1.5px solid #ffffff',
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      )}

      {/* Optional rightAction button */}
      {rightAction && (
        <div style={{ flexShrink: 0 }}>
          {rightAction}
        </div>
      )}
    </div>
  );
};
