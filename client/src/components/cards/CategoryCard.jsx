import React from 'react';
import { Link } from 'react-router-dom';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const CategoryCard = ({ category }) => {
  return (
    <Link to={`/shop?category=${category.slug}`}>
      <div
        className="card category-card"
        style={{
          position: 'relative',
          height: 180,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        <img
          src={category.image}
          alt={category.name}
          onError={handleProductImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(27,67,50,0.85) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1.25rem',
            color: '#ffffff'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.2rem' }}>{category.name}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--primary-mint)', opacity: 0.9, lineHeight: 1.3 }}>{category.description}</p>
        </div>
      </div>
    </Link>
  );
};
