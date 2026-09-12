import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, ShoppingBag, Heart, Bell, User, Menu, X, LogOut, LayoutDashboard, ShieldCheck, Tractor, Home, Store, Info, PhoneCall } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { handleUserImageError } from '../../utils/imageUtils.js';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { unreadCount } = useNotification();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'farmer') return '/farmer';
    return '/customer';
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <Sprout size={32} color="#2d6a4f" />
          <div>
            <span>Village Mart</span>
            <span className="brand-tagline">From Our Farms to Your Home</span>
          </div>
        </Link>

        {/* Desktop & Mobile Navigation Links */}
        <ul className={`nav-menu ${mobileOpen ? 'mobile-open' : ''}`}>
          <li>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Home size={18} className="mobile-nav-icon" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/shop" className={`nav-link ${location.pathname === '/shop' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Store size={18} className="mobile-nav-icon" />
              <span>Shop Fresh</span>
            </Link>
          </li>
          <li>
            <Link to="/farmers" className={`nav-link ${location.pathname === '/farmers' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Tractor size={18} className="mobile-nav-icon" />
              <span>Meet Our Farmers</span>
            </Link>
          </li>
          <li>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Info size={18} className="mobile-nav-icon" />
              <span>About Us</span>
            </Link>
          </li>
          <li>
            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <PhoneCall size={18} className="mobile-nav-icon" />
              <span>Contact</span>
            </Link>
          </li>
        </ul>

        {/* Right Icon Actions */}
        <div className="nav-actions">
          {user && (
            <Link to="/customer/wishlist" className="icon-btn" title="Wishlist">
              <Heart size={22} />
              {wishlistCount > 0 && <span className="icon-badge">{wishlistCount}</span>}
            </Link>
          )}

          <Link to="/cart" className="icon-btn" title="Shopping Cart">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </Link>

          {user && (
            <Link to={`${getDashboardLink()}/notifications`} className="icon-btn" title="Notifications">
              <Bell size={22} />
              {unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
            </Link>
          )}

          {/* User Account Button & Dropdown */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setUserDropdown(!userDropdown)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}
              >
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name} onError={handleUserImageError} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={18} />
                )}
                <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name.split(' ')[0]}</span>
              </button>

              {userDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: 220,
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)',
                    padding: '0.5rem 0',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-deep)' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {user.role} {user.farmer_profile?.verification_status && `(${user.farmer_profile.verification_status})`}
                    </p>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    className="sidebar-link"
                    style={{ borderRadius: 0, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                    onClick={() => setUserDropdown(false)}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>

                  {user.role === 'customer' && (
                    <Link
                      to="/customer/orders"
                      className="sidebar-link"
                      style={{ borderRadius: 0, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => setUserDropdown(false)}
                    >
                      <ShoppingBag size={16} /> My Orders
                    </Link>
                  )}

                  {user.role === 'farmer' && (
                    <Link
                      to="/farmer/products"
                      className="sidebar-link"
                      style={{ borderRadius: 0, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => setUserDropdown(false)}
                    >
                      <Tractor size={16} /> My Produce
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/verification"
                      className="sidebar-link"
                      style={{ borderRadius: 0, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => setUserDropdown(false)}
                    >
                      <ShieldCheck size={16} /> Verification Queue
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="sidebar-link"
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'none',
                      borderRadius: 0,
                      padding: '0.6rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--danger)',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button className="icon-btn mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle Navigation Menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};
