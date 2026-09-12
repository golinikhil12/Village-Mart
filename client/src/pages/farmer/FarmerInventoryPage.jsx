import React, { useEffect, useState } from 'react';
import { Package, Save } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const FarmerInventoryPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [stockUpdates, setStockUpdates] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?farmerId=${user.id}&status=all`);
      if (res.success) {
        setProducts(res.products || []);
        const initial = {};
        (res.products || []).forEach((p) => {
          initial[p.id] = p.quantity;
        });
        setStockUpdates(initial);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const handleStockSave = async (id) => {
    const newQty = stockUpdates[id];
    try {
      const res = await api.put(`/products/${id}`, { quantity: newQty });
      if (res.success) {
        addToast('Stock level updated!', 'success');
        fetchInventory();
      }
    } catch (err) {
      addToast('Failed to update stock.', 'error');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>Inventory Stock Management</h2>

      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Product</th>
                <th style={{ padding: '0.75rem' }}>Unit Price</th>
                <th style={{ padding: '0.75rem' }}>Available Stock</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-deep)' }}>{prod.name}</td>
                  <td style={{ padding: '0.75rem' }}>₹{prod.price} / {prod.unit}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: 100, padding: '0.35rem 0.6rem' }}
                      value={stockUpdates[prod.id] !== undefined ? stockUpdates[prod.id] : prod.quantity}
                      onChange={(e) => setStockUpdates({ ...stockUpdates, [prod.id]: parseInt(e.target.value) || 0 })}
                    />
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${prod.quantity > 10 ? 'badge-verified' : prod.quantity > 0 ? 'badge-pending' : 'badge-out-stock'}`}>
                      {prod.quantity > 10 ? 'In Stock' : prod.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleStockSave(prod.id)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Save size={15} /> Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
