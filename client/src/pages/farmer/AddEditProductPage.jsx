import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, Upload, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const AddEditProductPage = () => {
  const { id } = useParams(); // if present, edit mode
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    unit: 'kg',
    quantity: '100',
    harvest_date: new Date().toISOString().split('T')[0],
    farming_method: 'Organic & Traditional',
    organic: true,
    location: user?.farmer_profile?.location || 'Warangal, Telangana',
    image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    api.get('/products/categories').then((res) => {
      if (res.success && res.categories) {
        setCategories(res.categories);
        if (!isEdit && res.categories.length > 0) {
          setForm((f) => ({ ...f, category_id: res.categories[0].id }));
        }
      }
    });

    if (isEdit) {
      api.get(`/products/${id}`).then((res) => {
        if (res.success && res.product) {
          const p = res.product;
          setForm({
            name: p.name,
            category_id: p.category_id,
            description: p.description || '',
            price: p.price,
            unit: p.unit,
            quantity: p.quantity,
            harvest_date: p.harvest_date || '',
            farming_method: p.farming_method || '',
            organic: p.organic === 1,
            location: p.location,
            image_url: p.images && p.images[0] ? p.images[0].image_url : ''
          });
          if (p.images && p.images[0]) {
            setImagePreview(p.images[0].image_url);
          }
        }
      });
    }
  }, [id, isEdit]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (imageFile) {
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
          formData.append(key, form[key]);
        });
        formData.append('images', imageFile);

        if (isEdit) {
          await api.put(`/products/${id}`, formData, true);
          addToast('Product updated successfully!', 'success');
        } else {
          await api.post('/products', formData, true);
          addToast('Product created successfully!', 'success');
        }
      } else {
        const payload = {
          ...form,
          image_urls: [form.image_url]
        };

        if (isEdit) {
          await api.put(`/products/${id}`, payload);
          addToast('Product updated successfully!', 'success');
        } else {
          await api.post('/products', payload);
          addToast('Product created successfully!', 'success');
        }
      }
      navigate('/farmer/products');
    } catch (err) {
      addToast(err.message || 'Failed to save product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <button onClick={() => navigate('/farmer/products')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Products List
      </button>

      <div className="card" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>
          {isEdit ? 'Edit Produce Listing' : 'Add New Produce Listing'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Organic heirloom tomatoes"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                required
                placeholder="40"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select className="form-select" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">per kg</option>
                <option value="500g">per 500g</option>
                <option value="dozen">per dozen</option>
                <option value="bunch">per bunch</option>
                <option value="liter">per liter</option>
                <option value="pack">per pack</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Available Quantity *</label>
              <input
                type="number"
                className="form-input"
                required
                placeholder="100"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Harvest Date</label>
              <input
                type="date"
                className="form-input"
                value={form.harvest_date}
                onChange={(e) => setForm({ ...form, harvest_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Farm Location *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Warangal, Telangana"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Cultivation Story</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe farming techniques, taste profile, and harvest fresh quality..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Image Upload & URL */}
          <div className="form-group" style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
            <label className="form-label">Product Image</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.85rem' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR Image URL:</span>
              <input
                type="url"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="https://images.unsplash.com/..."
                value={form.image_url}
                onChange={(e) => {
                  setForm({ ...form, image_url: e.target.value });
                  setImagePreview(e.target.value);
                }}
              />
            </div>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                onError={handleProductImageError}
                style={{ width: 100, height: 100, borderRadius: 'var(--radius-sm)', objectFit: 'cover', marginTop: '1rem' }}
              />
            )}
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="organicToggle"
              checked={form.organic}
              onChange={(e) => setForm({ ...form, organic: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
            />
            <label htmlFor="organicToggle" style={{ fontWeight: 600, cursor: 'pointer' }}>
              🌿 Mark as 100% Certified Organic Produce
            </label>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg btn-block" style={{ marginTop: '1.5rem' }}>
            {submitting ? 'Saving...' : isEdit ? 'Update Produce Listing' : 'Publish Product Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};
