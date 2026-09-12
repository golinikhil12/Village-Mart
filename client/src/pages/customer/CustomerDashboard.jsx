import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, CheckCircle2, Clock, MapPin, Bell, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { StatCard } from '../../components/cards/StatCard.jsx';
import { OrderTimeline } from '../../components/orders/OrderTimeline.jsx';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordRes, wishRes] = await Promise.all([
          api.get('/orders/customer'),
          api.get('/wishlist')
        ]);
        if (ordRes.success) setOrders(ordRes.orders || []);
        if (wishRes.success) setWishlistCount((wishRes.wishlist || []).length);
      } catch (err) {
        console.error('Failed to load customer stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) => ['pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery'].includes(o.order_status)).length;
  const deliveredOrders = orders.filter((o) => o.order_status === 'delivered').length;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', color: 'var(--primary-deep)', marginBottom: '0.2rem' }}>
          Welcome back, {user?.name.split(' ')[0]}! 👋
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your orders, saved farm produce, and address book.</p>
      </div>

      {/* STATS OVERVIEW GRID */}
      <div className="stats-grid">
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} />
        <StatCard icon={Clock} label="Active Orders" value={activeOrders} color="#fef3c7" textColor="#b45309" />
        <StatCard icon={CheckCircle2} label="Delivered Orders" value={deliveredOrders} color="#dcfce7" textColor="#15803d" />
        <StatCard icon={Heart} label="Saved Wishlist" value={wishlistCount} color="#fef2f2" textColor="#ef4444" />
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', margin: 0 }}>Recent Orders</h3>
          <Link to="/customer/orders" className="btn btn-outline btn-sm">
            View All Orders <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <p>Loading recent orders...</p>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
            <p>You haven't placed any direct farm produce orders yet.</p>
            <Link to="/shop" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Explore Shop
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                  <th style={{ padding: '0.75rem' }}>Items</th>
                  <th style={{ padding: '0.75rem' }}>Total</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--primary-deep)' }}>#{ord.id}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{new Date(ord.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '0.75rem' }}>{ord.item_count} Item(s)</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>₹{ord.total}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${ord.order_status === 'delivered' ? 'badge-verified' : 'badge-pending'}`}>
                        {ord.order_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Link to="/customer/orders" className="btn btn-outline btn-sm">
                        Details
                      </Link>
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
