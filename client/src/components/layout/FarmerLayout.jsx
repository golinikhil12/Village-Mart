import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, Layers, Settings, LogOut, Tractor, Bell } from 'lucide-react';
import { Navbar } from '../common/Navbar.jsx';
import { Footer } from '../common/Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';

export const FarmerLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isVerified = user?.farmer_profile?.verification_status === 'approved';

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
                  <Tractor size={30} color="var(--primary)" />
                </div>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', margin: 0 }}>
                  {user?.farmer_profile?.farm_name || user?.name}
                </h4>
                <span className={`badge ${isVerified ? 'badge-verified' : 'badge-pending'}`} style={{ marginTop: 6 }}>
                  {isVerified ? 'Verified Farm' : 'Pending Verification'}
                </span>
              </div>

              <ul className="sidebar-nav">
                <li>
                  <Link to="/farmer" className={`sidebar-link ${location.pathname === '/farmer' ? 'active' : ''}`}>
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/farmer/products" className={`sidebar-link ${location.pathname === '/farmer/products' ? 'active' : ''}`}>
                    <Package size={18} /> My Produce
                  </Link>
                </li>
                <li>
                  <Link to="/farmer/products/new" className={`sidebar-link ${location.pathname === '/farmer/products/new' ? 'active' : ''}`}>
                    <PlusCircle size={18} /> Add Produce
                  </Link>
                </li>
                <li>
                  <Link to="/farmer/orders" className={`sidebar-link ${location.pathname === '/farmer/orders' ? 'active' : ''}`}>
                    <ShoppingBag size={18} /> Incoming Orders
                  </Link>
                </li>
                <li>
                  <Link to="/farmer/inventory" className={`sidebar-link ${location.pathname === '/farmer/inventory' ? 'active' : ''}`}>
                    <Layers size={18} /> Stock Inventory
                  </Link>
                </li>
                <li>
                  <Link to="/farmer/notifications" className={`sidebar-link ${location.pathname === '/farmer/notifications' ? 'active' : ''}`}>
                    <Bell size={18} /> Notifications {unreadCount > 0 && <span className="icon-badge" style={{ position: 'relative', top: 0, right: 0 }}>{unreadCount}</span>}
                  </Link>
                </li>
                <li>
                  <Link to="/farmer/settings" className={`sidebar-link ${location.pathname === '/farmer/settings' ? 'active' : ''}`}>
                    <Settings size={18} /> Farm Settings
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
