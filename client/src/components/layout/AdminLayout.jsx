import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Package, Users, LogOut, Bell } from 'lucide-react';
import { Navbar } from '../common/Navbar.jsx';
import { Footer } from '../common/Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

export const AdminLayout = () => {
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
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <ShieldCheck size={32} />
                </div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', margin: 0 }}>Village Mart Admin</h4>
                <span className="badge badge-verified" style={{ marginTop: 6 }}>Super Administrator</span>
              </div>

              <ul className="sidebar-nav">
                <li>
                  <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> Overview
                  </Link>
                </li>
                <li>
                  <Link to="/admin/verification" className={`sidebar-link ${location.pathname === '/admin/verification' ? 'active' : ''}`}>
                    <ShieldCheck size={18} /> Verification Queue
                  </Link>
                </li>
                <li>
                  <Link to="/admin/products" className={`sidebar-link ${location.pathname === '/admin/products' ? 'active' : ''}`}>
                    <Package size={18} /> Produce & Categories
                  </Link>
                </li>
                <li>
                  <Link to="/admin/users" className={`sidebar-link ${location.pathname === '/admin/users' ? 'active' : ''}`}>
                    <Users size={18} /> Platform Users
                  </Link>
                </li>
                <li>
                  <Link to="/admin/notifications" className={`sidebar-link ${location.pathname === '/admin/notifications' ? 'active' : ''}`}>
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
