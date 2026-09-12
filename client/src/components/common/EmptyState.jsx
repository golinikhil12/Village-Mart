import React from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'We could not find any items matching your request.',
  actionText,
  actionLink,
  onActionClick
}) => {
  return (
    <div
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px border var(--border-color)',
        maxWidth: 550,
        margin: '2rem auto'
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--primary-mint)',
          color: 'var(--primary-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}
      >
        <Icon size={36} />
      </div>
      <h3 style={{ fontSize: '1.35rem', color: 'var(--primary-deep)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}

      {actionText && onActionClick && (
        <button onClick={onActionClick} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};
