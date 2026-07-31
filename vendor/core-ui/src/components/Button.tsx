import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  style,
  disabled,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius-md, 8px)',
    fontWeight: 600,
    fontSize: '0.875rem',
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast, 0.15s)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: disabled || isLoading ? 0.6 : 1,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--accent, #6d28d9)',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: 'var(--bg-tertiary, #f3f4f6)',
      color: 'var(--text-primary, #1f2937)',
      border: '1px solid var(--border-color, #e2e8f0)',
    },
    danger: {
      backgroundColor: 'var(--danger, #ef4444)',
      color: '#ffffff',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary, #4b5563)',
    },
  };

  const resolvedVariant = (variant === 'secondary' && children === 'Cancel') ? 'danger' : variant;

  const activeStyle = {
    ...baseStyle,
    ...variants[resolvedVariant],
    ...style,
  };

  return (
    <button disabled={disabled || isLoading} style={activeStyle} {...props}>
      {isLoading ? (
        <span style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      ) : null}
      {children}
    </button>
  );
};
