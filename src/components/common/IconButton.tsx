import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'subtle' | 'dark' | 'glass';
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  variant = 'default',
  size = 40,
  className = '',
  style,
  ...props
}) => {
  let btnClass = 'btn-icon';
  if (variant === 'subtle') btnClass = 'btn-icon-subtle';

  const customStyle: React.CSSProperties = {
    width: size,
    height: size,
    ...style
  };

  if (variant === 'dark') {
    customStyle.backgroundColor = '#111111';
    customStyle.color = '#FFFFFF';
    customStyle.border = 'none';
  } else if (variant === 'glass') {
    customStyle.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    customStyle.color = '#FFFFFF';
    customStyle.border = '1px solid rgba(255, 255, 255, 0.3)';
    customStyle.backdropFilter = 'blur(10px)';
  }

  return (
    <button
      className={`${btnClass} ${className}`}
      style={customStyle}
      {...props}
    >
      {children}
    </button>
  );
};
