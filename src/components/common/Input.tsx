import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  rightElement,
  className = '',
  ...props
}) => {
  return (
    <div className="input-group">
      {label && <label className="text-label">{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
          style={rightElement ? { paddingRight: 44 } : undefined}
          {...props}
        />
        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: 12,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'auto'
            }}
          >
            {rightElement}
          </div>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{error}</span>}
      {helperText && !error && <span className="text-caption">{helperText}</span>}
    </div>
  );
};
