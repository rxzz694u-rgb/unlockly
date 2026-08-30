import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="input-group">
      {label && <label className="text-label">{label}</label>}
      <textarea
        className={`textarea-field ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>{error}</span>}
      {helperText && !error && <span className="text-caption">{helperText}</span>}
    </div>
  );
};
