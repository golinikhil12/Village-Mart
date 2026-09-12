import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, HeartHandshake, Truck, Leaf, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/cards/ProductCard.jsx';
import { FarmerCard } from '../components/cards/FarmerCard.jsx';
import { CategoryCard } from '../components/cards/CategoryCard.jsx';
import { ProductCardSkeleton, FarmerCardSkeleton } from '../components/common/Skeleton.jsx';
import { handleProductImageError } from '../utils/imageUtils.js';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredFarmers, setFeaturedFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, farmerRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/categories'),
          api.get('/farmers?verification_status=approved')
        ]);
        if (prodRes.success) setFeaturedProducts(prodRes.products || []);
        if (catRes.success) setCategories(catRes.categories || []);
        if (farmerRes.success) setFeaturedFarmers((farmerRes.farmers || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: '#ffffff',
          padding: '5rem 0 6rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(82, 183, 136, 0.25) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div className="container hero-grid">
          <div>
            <h1 className="hero-title">
              Fresh From Local Farms, <br />
              <span style={{ color: '#52b788' }}>Directly to Your Door.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#d1d5db', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '580px' }}>
              Shop fresh agricultural products directly from local farmers while helping farmers earn better value for their hard work. Zero middlemen margin cuts.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-accent btn-lg">
                <ShoppingBag size={20} /> Shop Fresh Products
              </Link>
              <Link to="/register?role=farmer" className="btn btn-secondary btn-lg">
                Become a Farmer Seller <ArrowRight size={20} />
              </Link>
            </div>

            {/* Micro stats */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>100%</h4>
                <p style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>Direct Farmer Pay</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>24 Hours</h4>
                <p style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>Harvest-to-Door Delivery</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>4.9 ★</h4>
                <p style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>Verified Farm Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src="/vector_farmer_illustration.png"
              alt="Handcrafted 2D Vector Illustration of a local farmer with fresh produce basket"
              onError={handleProductImageError}
              style={{
                width: '100%',
                maxHeight: 460,
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)',
                filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15))'
              }}
            />
          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-deep)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <HeartHandshake size={28} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Direct From Farmers</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Buy directly without middlemen cuts</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-deep)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Fair Pricing</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Farmers set fair prices for their hard work</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-deep)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <Leaf size={28} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Fresh Produce</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Naturally grown, harvested on demand</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--primary-mint)', color: 'var(--primary-deep)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <Truck size={28} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Reliable Delivery</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Direct logistics from farm to kitchen</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                Explore Categories
              </span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>Farm Produce Categories</h2>
            </div>
            <Link to="/shop" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              View All Categories <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{ padding: '4.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                Fresh Harvest
              </span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>Featured Agricultural Products</h2>
            </div>
            <Link to="/shop" className="btn btn-primary">
              Explore Full Shop <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {featuredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED FARMERS */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>
                Verified Producers
              </span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '0.2rem' }}>Meet Our Local Farmers</h2>
            </div>
            <Link to="/farmers" className="btn btn-outline">
              View All Verified Farmers <ChevronRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3].map((i) => (
                <FarmerCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {featuredFarmers.map((farmer) => (
                <FarmerCard key={farmer.user_id} farmer={farmer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '5rem 0', background: 'var(--primary-deep)', color: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 3.5rem' }}>
            <span style={{ color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>
              Simple 4-Step Model
            </span>
            <h2 style={{ fontSize: '2.4rem', color: '#ffffff', marginTop: '0.3rem' }}>How Village Mart Works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', padding: '2rem', textAlign: 'center', color: '#ffffff' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                1
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Farmers List Products</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>Farmers set their own produce prices, harvest details, and stock quantity.</p>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', padding: '2rem', textAlign: 'center', color: '#ffffff' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                2
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Customers Discover</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>Customers search fresh produce, view verified farmer profiles and farming methods.</p>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', padding: '2rem', textAlign: 'center', color: '#ffffff' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                3
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Customers Order</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>Seamless checkout with real-time stock allocation and order tracking.</p>
            </div>

            <div className="card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', padding: '2rem', textAlign: 'center', color: '#ffffff' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1.25rem' }}>
                4
              </div>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Fresh Delivery</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.6 }}>Produce is harvested fresh and delivered directly to the customer's doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-deep)', marginBottom: '1rem' }}>
            Are you a farmer? Sell directly to your customers.
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--primary-deep)', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
            Eliminate commission cuts from middlemen. Take total control over your pricing and build lasting direct relationships with consumers.
          </p>
          <Link to="/register?role=farmer" className="btn btn-primary btn-lg">
            Start Selling Today <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};
