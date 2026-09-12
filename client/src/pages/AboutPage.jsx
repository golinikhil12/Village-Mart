import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, HeartHandshake, Truck, TrendingUp, Users, Award } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div className="page-header">
        <div className="container" style={{ textAlign: 'center', maxWidth: 750 }}>
          <h1>Empowering Farmers. Delivering Freshness.</h1>
          <p>We believe farmers deserve better opportunities to reach customers directly without high middleman cuts.</p>
        </div>
      </div>

      <div className="container">
        {/* STORY / MISSION */}
        <div className="about-layout">
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Our Mission</span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--primary-deep)', margin: '0.4rem 0 1.25rem 0' }}>
              Why Village Mart Was Built
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '1.25rem' }}>
              Traditional agricultural supply chains lose up to 40-50% of produce value to multiple tiers of intermediaries, mandi brokers, and transport traders. As a result, hardworking rural farmers receive razor-thin margins while urban consumers pay inflated prices for stale produce.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem' }}>
              <strong>Village Mart</strong> re-engineers this relationship into a direct <strong>Farmer → Village Mart → Customer</strong> marketplace. Farmers set fair market prices, maintain total ownership over their inventory, and receive transparent digital payments.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)', color: '#ffffff' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '1rem' }}>The Village Mart Promise</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={24} color="#52b788" /> 100% Verified Local Farmers
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HeartHandshake size={24} color="#52b788" /> Zero Exploitative Middlemen
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <TrendingUp size={24} color="#52b788" /> Direct Farmer Financial Growth
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Truck size={24} color="#52b788" /> Direct Farm-Gate Logistics
              </li>
            </ul>
          </div>
        </div>

        {/* FUTURE STARTUP VISION */}
        <div className="card" style={{ padding: '3rem', background: '#ffffff', marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto 2.5rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Scalable Expansion</span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-deep)', marginTop: '0.3rem' }}>Our Future Startup Vision</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--primary-deep)', marginBottom: '0.4rem' }}>Physical Village Hubs</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Establishing village collection centers with solar cold storage for zero post-harvest spoilage.</p>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--primary-deep)', marginBottom: '0.4rem' }}>Demand Forecasting</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Smart algorithms to help farmers plant crops based on real-time market consumer demand trends.</p>
            </div>
            <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--primary-deep)', marginBottom: '0.4rem' }}>Farmer Credit & Support</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>Enabling micro-grants, bio-fertilizer supply, and organic certification assistance for smallholders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
