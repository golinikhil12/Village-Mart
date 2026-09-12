import React, { useEffect, useState } from 'react';
import { ShoppingBag, Calendar, MapPin, Truck, AlertCircle, XCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { OrderTimeline } from '../../components/orders/OrderTimeline.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/customer');
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored to the farmer.')) return;
    try {
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.success) {
        addToast(res.message, 'info');
        fetchOrders();
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel order.', 'error');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>My Orders & Tracking</h2>

      {loading ? (
        <p>Loading order history...</p>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>No Orders Placed Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Browse local verified farmers and order fresh harvest!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((ord) => {
            const canCancel = ['pending', 'confirmed'].includes(ord.order_status);

            return (
              <div key={ord.id} className="card" style={{ padding: '1.75rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)' }}>Order #{ord.id}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Placed on {new Date(ord.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-deep)' }}>₹{ord.total}</span>
                    {canCancel && (
                      <button onClick={() => handleCancelOrder(ord.id)} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <XCircle size={15} /> Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* TIMELINE */}
                <OrderTimeline status={ord.order_status} />

                {/* ITEMS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  {ord.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
                        <img
                          src={item.primary_image || '/placeholder-product.jpg'}
                          alt={item.product_name}
                          onError={handleProductImageError}
                          style={{ width: 54, height: 54, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-deep)', margin: 0, wordBreak: 'break-word' }}>{item.product_name}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-word' }}>
                            Producer: <strong>{item.farm_name || item.farmer_name}</strong> | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-deep)', whiteSpace: 'nowrap' }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
