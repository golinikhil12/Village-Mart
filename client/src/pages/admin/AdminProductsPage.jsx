import React, { useEffect, useState } from 'react';
import { Package, Trash2, Plus, Eye } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?status=all&limit=50');
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" as admin?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.success) {
        addToast('Product removed.', 'info');
        fetchProducts();
      }
    } catch (err) {
      addToast('Failed to remove product.', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/categories', { name: catName, description: catDesc });
      if (res.success) {
        addToast('Category created successfully!', 'success');
        setShowCategoryModal(false);
        setCatName('');
        setCatDesc('');
      }
    } catch (err) {
      addToast(err.message || 'Failed to create category.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', margin: 0 }}>Marketplace Produce Moderation</h2>
        <button onClick={() => setShowCategoryModal(true)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading products list...</p>
      ) : (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Image</th>
                <th style={{ padding: '0.75rem' }}>Produce Name</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>Farmer</th>
                <th style={{ padding: '0.75rem' }}>Price</th>
                <th style={{ padding: '0.75rem' }}>Stock</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <img src={prod.primary_image || '/placeholder-product.jpg'} alt={prod.name} onError={handleProductImageError} style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover' }} />
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-deep)' }}>{prod.name}</td>
                  <td style={{ padding: '0.75rem' }}>{prod.category_name}</td>
                  <td style={{ padding: '0.75rem' }}>{prod.farm_name || prod.farmer_name}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>₹{prod.price}</td>
                  <td style={{ padding: '0.75rem' }}>{prod.quantity} {prod.unit}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button onClick={() => handleDeleteProduct(prod.id, prod.name)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CATEGORY MODAL */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Create New Produce Category">
        <form onSubmit={handleAddCategory}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input type="text" className="form-input" required placeholder="e.g. Exotic Herbs" value={catName} onChange={(e) => setCatName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} placeholder="Brief category description..." value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Create Category
          </button>
        </form>
      </Modal>
    </div>
  );
};
