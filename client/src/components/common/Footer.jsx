import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand-logo" style={{ color: '#ffffff' }}>
              <Sprout size={32} color="#52b788" />
              <div>
                <span style={{ color: '#ffffff' }}>Village Mart</span>
                <span className="brand-tagline" style={{ color: '#a7f3d0' }}>Empowering Farmers. Delivering Freshness.</span>
              </div>
            </Link>
            <p>
              Village Mart is a farmer-first digital marketplace connecting local agricultural producers directly with conscious consumers. Zero middlemen. 100% fresh farm-gate delivery.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop Fresh Produce</Link></li>
              <li><Link to="/farmers">Verified Farmers</Link></li>
              <li><Link to="/about">Our Mission & Story</Link></li>
              <li><Link to="/register?role=farmer">Become a Farmer Seller</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/customer/orders">Track Orders</Link></li>
              <li><Link to="/cart">My Shopping Cart</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><Link to="/about#privacy">Privacy Policy</Link></li>
              <li><Link to="/about#terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Direct Farm Hub</h4>
            <ul className="footer-links" style={{ fontSize: '0.9rem', color: '#d1d5db' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} color="#52b788" /> Warangal Hub & Nashik Depot
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={18} color="#52b788" /> +91 (800) 555-FARM
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} color="#52b788" /> golinikhil12@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Village Mart. All rights reserved. Built for direct farmer empowerment.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#ffffff' }}>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary-deep)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 800 }}>Made by Nikhil</span>
            <span>•</span>
            <span>Made with <Heart size={16} color="#ef4444" fill="#ef4444" style={{ display: 'inline', verticalAlign: 'middle' }} /> for Indian Farmers</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
