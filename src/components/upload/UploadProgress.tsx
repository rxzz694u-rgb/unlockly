import React from 'react';
import { CheckIcon } from '../../assets/icons/Icons';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  isComplete?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  fileName,
  progress,
  isComplete = false
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '220px'
          }}
        >
          {fileName}
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: isComplete ? '#059669' : 'var(--text-secondary)' }}>
          {isComplete ? 'UPLOADED' : `${progress}%`}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: 6,
          backgroundColor: 'var(--bg-surface-subtle)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: isComplete ? '#059669' : '#111111',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.2s ease, background-color 0.2s ease'
          }}
        />
      </div>
    </div>
  );
};
