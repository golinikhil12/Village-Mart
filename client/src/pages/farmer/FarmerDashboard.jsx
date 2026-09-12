import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, ShoppingBag, AlertTriangle, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { StatCard } from '../../components/cards/StatCard.jsx';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/farmers/dashboard/stats')
      .then((res) => {
        if (res.success) {
          setStatsData(res);
        }
      })
      .catch((err) => console.error('Failed to fetch farmer stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const farmerProfile = user?.farmer_profile;
  const isVerified = farmerProfile?.verification_status === 'approved';

  if (loading) return <p>Loading farmer dashboard...</p>;

  const stats = statsData?.stats || { totalProducts: 0, activeProducts: 0, totalOrders: 0, revenue: 0 };
  const recentOrders = statsData?.recentOrders || [];
  const lowStockItems = statsData?.lowStockItems || [];

  return (
    <div>
      {/* HEADER BANNER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', color: 'var(--primary-deep)', margin: 0 }}>
              {farmerProfile?.farm_name || user?.name}'s Dashboard
            </h2>
            <span className={`badge ${isVerified ? 'badge-verified' : 'badge-pending'}`}>
              {isVerified ? 'Verified Farm' : 'Pending Verification'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Location: {farmerProfile?.location || 'Warangal'}</p>
        </div>

        <Link to="/farmer/products/new" className="btn btn-primary">
          <Plus size={18} /> Add New Produce Listing
        </Link>
      </div>

      {!isVerified && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--warning-bg)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            color: '#b45309',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}
        >
          ⏳ <strong>Account Pending Verification:</strong> Your farm registration has been submitted to Village Mart Administrators. Once verified, your produce listings will feature a verified producer badge.
        </div>
      )}

      {/* METRICS STATS GRID */}
      <div className="stats-grid">
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
        <StatCard icon={CheckCircle2} label="Active Published" value={stats.activeProducts} color="#dcfce7" textColor="#15803d" />
        <StatCard icon={ShoppingBag} label="Orders Received" value={stats.totalOrders} color="#eff6ff" textColor="#1d4ed8" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`₹${stats.revenue}`} color="#fef3c7" textColor="#b45309" />
      </div>

      {/* LOW STOCK ALERTS */}
      {lowStockItems.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--warning)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--warning)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} /> Low Inventory Alerts ({lowStockItems.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {lowStockItems.map((item) => (
              <div key={item.id} style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: 'var(--primary-deep)', display: 'block' }}>{item.name}</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 700 }}>
                  Only {item.quantity} {item.unit} remaining
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT INCOMING ORDERS */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', margin: 0 }}>Recent Customer Orders</h3>
          <Link to="/farmer/orders" className="btn btn-outline btn-sm">
            Manage All Orders <ArrowRight size={16} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No customer orders received yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Farmer Total</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.order_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--primary-deep)' }}>#{ord.order_id}</td>
                    <td style={{ padding: '0.75rem' }}>{ord.customer_name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(ord.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>₹{ord.farmer_subtotal}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-verified">{ord.order_status.replace('_', ' ')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
