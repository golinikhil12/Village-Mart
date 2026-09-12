import React, { useEffect, useState } from 'react';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    is_default: true
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/orders/addresses');
      if (res.success) {
        setAddresses(res.addresses || []);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/orders/addresses', form);
      if (res.success) {
        addToast('Address added successfully!', 'success');
        setShowAddModal(false);
        setForm({ full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '', landmark: '', is_default: true });
        fetchAddresses();
      }
    } catch (err) {
      addToast(err.message || 'Failed to add address.', 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', margin: 0 }}>Saved Delivery Addresses</h2>
        <button onClick={() => setShowAddModal(!showAddModal)} className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {showAddModal && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--bg-main)' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', marginBottom: '1rem' }}>Add New Shipping Address</h3>
          <form onSubmit={handleAddAddress}>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input type="tel" className="form-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street / House Address *</label>
              <input type="text" className="form-input" required value={form.address_line} onChange={(e) => setForm({ ...form, address_line: e.target.value })} />
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input type="text" className="form-input" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input type="text" className="form-input" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input type="text" className="form-input" required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Save Address
              </button>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {addresses.map((addr) => (
          <div key={addr.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', margin: 0 }}>{addr.full_name}</h3>
              {addr.is_default === 1 && <span className="badge badge-verified">Default Address</span>}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0' }}>Phone: {addr.phone}</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
