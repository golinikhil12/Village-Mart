import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MapPin, Star, Package, ArrowRight } from 'lucide-react';
import { handleUserImageError } from '../../utils/imageUtils.js';

export const FarmerCard = ({ farmer }) => {
  const isVerified = farmer.verification_status === 'approved';
  const rating = parseFloat(farmer.rating || 4.9).toFixed(1);

  return (
    <div className="card farmer-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <img
          src={farmer.profile_image || '/placeholder-user.jpg'}
          alt={farmer.name}
          onError={handleUserImageError}
          style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-mint)' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-deep)', margin: 0 }}>{farmer.name}</h3>
            {isVerified && <CheckCircle2 size={18} color="#10b981" title="Verified Village Mart Farmer" />}
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>{farmer.farm_name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
            <MapPin size={13} color="var(--primary-light)" /> {farmer.location}
          </p>
        </div>
      </div>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}
      >
        {farmer.description || 'Dedicated local producer practicing natural farming techniques to bring clean, fresh food directly to your kitchen.'}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: 'var(--bg-main)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star size={16} fill="#f59e0b" color="#f59e0b" />
          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{rating}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          <Package size={16} color="var(--primary)" /> {farmer.products_count || 0} Products
        </div>
        <span className={`badge ${isVerified ? 'badge-verified' : 'badge-pending'}`}>
          {isVerified ? 'Verified' : 'Pending'}
        </span>
      </div>

      <Link to={`/farmer/${farmer.user_id}`} className="btn btn-secondary btn-block">
        View Farm & Produce <ArrowRight size={16} />
      </Link>
    </div>
  );
};
