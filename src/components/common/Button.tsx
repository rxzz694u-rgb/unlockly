import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  let variantClass = 'btn-primary';
  if (variant === 'secondary') variantClass = 'btn-secondary';
  if (variant === 'danger') {
    variantClass = 'btn-primary';
  }

  const customStyle: React.CSSProperties = {};
  if (variant === 'danger') {
    customStyle.backgroundColor = '#DC2626';
    customStyle.color = '#FFFFFF';
  } else if (variant === 'ghost') {
    customStyle.backgroundColor = 'transparent';
    customStyle.color = '#111111';
    customStyle.border = 'none';
    customStyle.boxShadow = 'none';
  }

  return (
    <button
      className={`${variantClass} ${className}`}
      disabled={disabled || isLoading}
      style={customStyle}
      {...props}
    >
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 16,
              height: 16,
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#FFFFFF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}
          />
          <span>PROCESSING...</span>
        </div>
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex' }}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span style={{ display: 'inline-flex' }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
