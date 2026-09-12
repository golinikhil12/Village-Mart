import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="card" style={{ height: 380, padding: 0 }}>
      <div className="skeleton" style={{ height: 200, width: '100%' }} />
      <div style={{ padding: '1.25rem' }}>
        <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 22, width: '85%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 20 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: 28, width: '35%' }} />
          <div className="skeleton" style={{ height: 36, width: '40%', borderRadius: 'var(--radius-md)' }} />
        </div>
      </div>
    </div>
  );
};

export const FarmerCardSkeleton = () => {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: 68, height: 68, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: '40%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 50, width: '100%', marginBottom: '1.25rem' }} />
      <div className="skeleton" style={{ height: 40, width: '100%', borderRadius: 'var(--radius-md)' }} />
    </div>
  );
};
