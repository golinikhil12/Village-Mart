import React, { useEffect, useState } from 'react';
import { ShoppingBag, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const FarmerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchFarmerOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/farmer');
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch farmer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        addToast(res.message, 'success');
        fetchFarmerOrders();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>Incoming Customer Orders</h2>

      {loading ? (
        <p>Loading incoming orders...</p>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>No Orders Received Yet</h3>
          <p>Orders placed for your produce will appear here for status management.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((ord) => (
            <div key={ord.id} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)' }}>Order #{ord.id}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Date: {new Date(ord.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Subtotal:</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--primary-deep)', whiteSpace: 'nowrap' }}>₹{ord.farmer_subtotal}</strong>

                  {/* Status Dropdown */}
                  <select
                    className="form-select"
                    style={{ width: 'auto', fontWeight: 700, minWidth: 160 }}
                    value={ord.order_status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing / Packing</option>
                    <option value="shipped">Dispatched / Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* CUSTOMER & SHIPPING ADDRESS */}
              <div className="form-row-2" style={{ margin: '1.25rem 0', fontSize: '0.85rem' }}>
                <div style={{ background: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Customer Details:</span>
                  <strong style={{ color: 'var(--primary-deep)', display: 'block', marginTop: 2 }}>{ord.customer_name} ({ord.customer_phone})</strong>
                </div>
                <div style={{ background: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Delivery Location:</span>
                  <strong style={{ color: 'var(--primary-deep)', display: 'block', marginTop: 2 }}>
                    {ord.address_name}, {ord.address_line}, {ord.city}, {ord.state} - {ord.pincode}
                  </strong>
                </div>
              </div>

              {/* ORDER ITEMS */}
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {ord.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <img src={item.primary_image || '/placeholder-product.jpg'} alt={item.product_name} onError={handleProductImageError} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, wordBreak: 'break-word', flex: 1, minWidth: 0 }}>{item.product_name} ({item.quantity} {item.unit})</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-deep)', whiteSpace: 'nowrap' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
