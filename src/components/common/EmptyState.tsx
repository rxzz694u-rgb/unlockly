import React from 'react';
import { Button } from './Button';
import { PlusIcon } from '../../assets/icons/Icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'NOTHING HERE YET.',
  description = 'Create your first private link and start sharing.',
  actionText = 'CREATE CONTENT',
  onAction,
  icon
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '56px 24px',
        minHeight: '280px'
      }}
    >
      {icon && (
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            color: 'var(--text-secondary)'
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontSize: 18,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: 8
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          maxWidth: '280px',
          lineHeight: 1.45,
          marginBottom: onAction ? 24 : 0
        }}
      >
        {description}
      </p>

      {onAction && (
        <div style={{ width: '100%', maxWidth: '240px' }}>
          <Button
            variant="primary"
            onClick={onAction}
            rightIcon={<PlusIcon size={18} />}
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
