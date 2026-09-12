import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, MapPin, Bell, LogOut, Sprout } from 'lucide-react';
import { Navbar } from '../common/Navbar.jsx';
import { Footer } from '../common/Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1, backgroundColor: 'var(--bg-main)' }}>
        <div className="container">
          <div className="dashboard-layout">
            {/* Sidebar Navigation */}
            <aside className="dashboard-sidebar">
              <div style={{ paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-mint)', color: 'var(--primary-deep)', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  {user?.name.charAt(0)}
                </div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', margin: 0 }}>{user?.name}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer Account</span>
              </div>

              <ul className="sidebar-nav">
                <li>
                  <Link to="/customer" className={`sidebar-link ${location.pathname === '/customer' ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> Overview
                  </Link>
                </li>
                <li>
                  <Link to="/customer/orders" className={`sidebar-link ${location.pathname === '/customer/orders' ? 'active' : ''}`}>
                    <ShoppingBag size={18} /> My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/customer/wishlist" className={`sidebar-link ${location.pathname === '/customer/wishlist' ? 'active' : ''}`}>
                    <Heart size={18} /> Saved Wishlist
                  </Link>
                </li>
                <li>
                  <Link to="/customer/addresses" className={`sidebar-link ${location.pathname === '/customer/addresses' ? 'active' : ''}`}>
                    <MapPin size={18} /> Address Book
                  </Link>
                </li>
                <li>
                  <Link to="/customer/notifications" className={`sidebar-link ${location.pathname === '/customer/notifications' ? 'active' : ''}`}>
                    <Bell size={18} /> Notifications {unreadCount > 0 && <span className="icon-badge" style={{ position: 'relative', top: 0, right: 0 }}>{unreadCount}</span>}
                  </Link>
                </li>
                <li style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <LogOut size={18} /> Logout
                  </button>
                </li>
              </ul>
            </aside>

            {/* Main Content Area */}
            <main>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
