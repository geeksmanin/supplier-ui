import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({ label, error, style, containerStyle, ...props }) => {
  const defaultContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    width: '100%',
    marginBottom: '1rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary, #4b5563)',
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md, 8px)',
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    border: `1px solid ${error ? 'var(--danger, #ef4444)' : 'var(--border-color, #d1d5db)'}`,
    color: 'var(--text-primary, #111827)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color var(--transition-fast, 0.15s)',
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--danger, #ef4444)',
  };

  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input style={{ ...inputStyle, ...style }} {...props} />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};
