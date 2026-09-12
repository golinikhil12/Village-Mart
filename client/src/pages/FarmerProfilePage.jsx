import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Star, Package, Award, Calendar, Sprout, Mail, Phone } from 'lucide-react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/cards/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Skeleton.jsx';
import { handleUserImageError } from '../utils/imageUtils.js';

export const FarmerProfilePage = () => {
  const { id } = useParams(); // farmer user_id
  const [farmer, setFarmer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmer = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/farmers/${id}`);
        if (res.success) {
          setFarmer(res.farmer);
          setProducts(res.products || []);
        }
      } catch (err) {
        console.error('Failed to fetch farmer profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmer();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-deep)', fontWeight: 600 }}>Loading farmer profile & listings...</p>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Farmer Profile Not Found</h2>
      </div>
    );
  }

  const isVerified = farmer.verification_status === 'approved';

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* FARMER HEADER BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', color: '#ffffff', padding: '4rem 0 3rem 0', marginBottom: '3rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <img
            src={farmer.profile_image || '/placeholder-user.jpg'}
            alt={farmer.name}
            onError={handleUserImageError}
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '4px solid #52b788', boxShadow: 'var(--shadow-lg)' }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '2.4rem', color: '#ffffff', margin: 0 }}>{farmer.name}</h1>
              {isVerified && (
                <span className="badge badge-verified" style={{ fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} /> Verified Producer
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#a7f3d0', margin: '0.3rem 0 0.6rem 0' }}>{farmer.farm_name}</h3>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#d1d5db' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={16} color="#52b788" /> {farmer.location}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Award size={16} color="#52b788" /> {farmer.farming_experience || '10+ Years Experience'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" /> {parseFloat(farmer.rating || 4.9).toFixed(1)} Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* FARM STORY & DETAILS */}
        <div className="farmer-profile-grid">
          <div className="card" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-deep)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Farm Specifications
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Farming Technique:</span>
                <strong style={{ color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Sprout size={16} color="var(--primary)" /> {farmer.farming_method || 'Organic & Natural Farming'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Member Since:</span>
                <strong style={{ color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Calendar size={16} color="var(--primary)" /> {new Date(farmer.joined_date || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Active Produce Count:</span>
                <strong style={{ color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Package size={16} color="var(--primary)" /> {products.length} Products Listed
                </strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', marginBottom: '0.75rem' }}>About {farmer.farm_name}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {farmer.description || 'Welcome to our farm! We believe in sustainable, natural, and eco-friendly farming practices to cultivate nutrient-packed agricultural produce directly for your household.'}
            </p>
          </div>
        </div>

        {/* ACTIVE PRODUCE LISTINGS */}
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>
            Products by {farmer.name} ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>This farmer currently has no active published produce items.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
