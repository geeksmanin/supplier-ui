import React, { forwardRef } from 'react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  showClearButton?: boolean;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  clearButtonTitle?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  showClearButton = true,
  leftIcon,
  rightAction,
  containerStyle,
  containerClassName = '',
  clearButtonTitle = 'Clear search',
  style,
  className = '',
  disabled = false,
  autoComplete = 'off',
  ...props
}, ref) => {
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  const defaultContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-secondary, #f1f5f9)',
    border: '1px solid var(--border-color, #e2e8f0)',
    borderRadius: 'var(--radius-md, 8px)',
    padding: '0 10px',
    height: '38px',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const defaultInputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.875rem',
    color: 'var(--text-primary, #0f172a)',
    padding: '4px 0',
    minWidth: 0,
  };

  const defaultClearBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: '2px',
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary, #64748b)',
    flexShrink: 0,
    outline: 'none',
    borderRadius: '50%',
    transition: 'color 0.15s ease, opacity 0.15s ease',
  };

  return (
    <div
      className={`search-input-wrapper bounding-box ${containerClassName}`}
      data-bounding-box="true"
      style={{ ...defaultContainerStyle, ...containerStyle }}
    >
      {leftIcon !== undefined ? leftIcon : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary, #64748b)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )}

      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, e)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`search-input bare-input ${className}`}
        data-bare-input="true"
        style={{ ...defaultInputStyle, ...style }}
        {...props}
      />

      {showClearButton && Boolean(value) && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          title={clearButtonTitle}
          aria-label={clearButtonTitle}
          className="search-input-clear-btn"
          style={defaultClearBtnStyle}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {rightAction && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {rightAction}
        </div>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
