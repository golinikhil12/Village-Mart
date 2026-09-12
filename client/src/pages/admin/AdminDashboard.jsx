import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Tractor, ShieldCheck, Package, ShoppingBag, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';
import { StatCard } from '../../components/cards/StatCard.jsx';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => {
        if (res.success) setData(res);
      })
      .catch((err) => console.error('Failed to fetch admin stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading admin platform dashboard...</p>;

  const stats = data?.stats || { totalUsers: 0, totalFarmers: 0, verifiedFarmers: 0, pendingFarmers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 };
  const pendingFarmers = data?.pendingFarmers || [];
  const recentOrders = data?.recentOrders || [];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', color: 'var(--primary-deep)', margin: 0 }}>Village Mart Admin Control Panel</h2>
        <p style={{ color: 'var(--text-muted)' }}>Platform analytics, farmer verification queue, and user oversight.</p>
      </div>

      {/* PENDING VERIFICATION ALERT */}
      {stats.pendingFarmers > 0 && (
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', background: '#fff7ed', borderLeft: '4px solid var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={24} color="var(--warning)" />
            <div>
              <h4 style={{ color: 'var(--primary-deep)', margin: 0 }}>{stats.pendingFarmers} Pending Farmer Verification(s)</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Review farm details and approve verified producer badges.</p>
            </div>
          </div>
          <Link to="/admin/verification" className="btn btn-accent btn-sm">
            Review Queue
          </Link>
        </div>
      )}

      {/* METRICS STATS GRID */}
      <div className="stats-grid">
        <StatCard icon={Users} label="Total Customers" value={stats.totalUsers} />
        <StatCard icon={Tractor} label="Total Farmers" value={stats.totalFarmers} color="#eff6ff" textColor="#1d4ed8" />
        <StatCard icon={ShieldCheck} label="Verified Farmers" value={stats.verifiedFarmers} color="#dcfce7" textColor="#15803d" />
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="#fef3c7" textColor="#b45309" />
        <StatCard icon={ShoppingBag} label="Platform Orders" value={stats.totalOrders} />
        <StatCard icon={TrendingUp} label="Total Gross Revenue" value={`₹${stats.totalRevenue}`} color="#dcfce7" textColor="#15803d" />
      </div>

      {/* RECENT PLATFORM ORDERS */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '1.25rem' }}>Recent Marketplace Orders</h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Order ID</th>
                <th style={{ padding: '0.75rem' }}>Customer</th>
                <th style={{ padding: '0.75rem' }}>City</th>
                <th style={{ padding: '0.75rem' }}>Amount</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--primary-deep)' }}>#{ord.id}</td>
                  <td style={{ padding: '0.75rem' }}>{ord.customer_name}</td>
                  <td style={{ padding: '0.75rem' }}>{ord.city}, {ord.state}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>₹{ord.total}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-verified">{ord.order_status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
