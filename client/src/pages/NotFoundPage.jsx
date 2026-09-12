import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{ padding: '6rem 0', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 500 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-mint)', color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Sprout size={44} />
        </div>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-deep)', marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          The farm field page you are looking for has been moved, removed, or does not exist.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          <Home size={20} /> Back to Home Page
        </Link>
      </div>
    </div>
  );
};
