import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const FarmerProductsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?farmerId=${user.id}&status=all`);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch farmer products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete produce listing "${name}"?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.success) {
        addToast('Product deleted.', 'info');
        fetchProducts();
      }
    } catch (err) {
      addToast('Failed to delete product.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', margin: 0 }}>My Listed Produce ({products.length})</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage product prices, stock quantity, and harvest status.</p>
        </div>

        <Link to="/farmer/products/new" className="btn btn-primary">
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No Produce Listed Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Start selling by adding your first agricultural product!</p>
          <Link to="/farmer/products/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Add Product Listing
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Image</th>
                <th style={{ padding: '0.75rem' }}>Product Name</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Price / Unit</th>
                <th style={{ padding: '0.75rem' }}>Stock</th>
                <th style={{ padding: '0.75rem' }}>Organic</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <img
                      src={prod.primary_image || '/placeholder-product.jpg'}
                      alt={prod.name}
                      onError={handleProductImageError}
                      style={{ width: 48, height: 48, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-deep)' }}>{prod.name}</td>
                  <td style={{ padding: '0.75rem' }}>{prod.category_name}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 800 }}>₹{prod.price} / {prod.unit}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${prod.quantity > 0 ? 'badge-verified' : 'badge-out-stock'}`}>
                      {prod.quantity > 0 ? `${prod.quantity} ${prod.unit}` : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {prod.organic === 1 ? '🌿 Yes' : 'No'}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link to={`/product/${prod.id}`} className="btn btn-outline btn-sm" title="View Public Page">
                        <Eye size={15} />
                      </Link>
                      <Link to={`/farmer/products/edit/${prod.id}`} className="btn btn-secondary btn-sm" title="Edit">
                        <Edit size={15} />
                      </Link>
                      <button onClick={() => handleDelete(prod.id, prod.name)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
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
