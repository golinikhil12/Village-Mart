import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, User, Tractor, Mail, Phone, Lock, MapPin, Award, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'farmer' ? 'farmer' : 'customer';

  const [role, setRole] = useState(initialRole);
  const { registerCustomer, registerFarmer } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    farm_name: '',
    location: '',
    farming_experience: '5 Years',
    farming_method: 'Organic & Traditional'
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (role === 'customer') {
        const res = await registerCustomer({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        if (res.success) {
          addToast('Customer account created successfully!', 'success');
          navigate('/customer');
        }
      } else {
        const res = await registerFarmer({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          farm_name: formData.farm_name,
          location: formData.location,
          farming_experience: formData.farming_experience,
          farming_method: formData.farming_method
        });
        if (res.success) {
          addToast('Farmer registration submitted! Pending admin verification.', 'info');
          navigate('/farmer');
        }
      }
    } catch (err) {
      addToast(err.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: 620 }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-deep)', marginBottom: '0.4rem' }}>
              Create Village Mart Account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join India's direct farmer digital marketplace</p>
          </div>

          {/* ROLE SWITCHER TABS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.35rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-sm)', border: 'none' }}
            >
              <User size={18} /> I am a Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`btn ${role === 'farmer' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-sm)', border: 'none' }}
            >
              <Tractor size={18} /> I am a Farmer
            </button>
          </div>

          {role === 'farmer' && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--warning-bg)',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)',
                color: '#b45309',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                lineHeight: 1.5
              }}
            >
              ℹ️ <strong>Farmer Verification Policy:</strong> Farmer accounts receive a <em>Pending Verification</em> status upon registration until verified by Village Mart Administrators to ensure farm authenticity.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Ramesh Reddy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  placeholder="+91 98480 12345"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* FARMER SPECIFIC FIELDS */}
            {role === 'farmer' && (
              <div style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-deep)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tractor size={18} color="var(--primary)" /> Farm Information
                </h4>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Farm Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Sri Venkateswara Farms"
                      value={formData.farm_name}
                      onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Farm Location (City/State) *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Warangal, Telangana"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Farming Experience</label>
                    <select
                      className="form-select"
                      value={formData.farming_experience}
                      onChange={(e) => setFormData({ ...formData, farming_experience: e.target.value })}
                    >
                      <option value="1-3 Years">1-3 Years</option>
                      <option value="5 Years">5 Years</option>
                      <option value="10+ Years">10+ Years</option>
                      <option value="Generational Farm">Generational Farm</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Primary Farming Method</label>
                    <select
                      className="form-select"
                      value={formData.farming_method}
                      onChange={(e) => setFormData({ ...formData, farming_method: e.target.value })}
                    >
                      <option value="Organic & Traditional">Organic & Traditional</option>
                      <option value="Zero Budget Natural Farming">Zero Budget Natural Farming</option>
                      <option value="Hydroponic">Hydroponic</option>
                      <option value="Sub-surface Drip Irrigated">Sub-surface Drip Irrigated</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg btn-block" style={{ marginTop: '1rem' }}>
              <UserPlus size={20} /> {submitting ? 'Creating Account...' : `Register as ${role === 'farmer' ? 'Farmer' : 'Customer'}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already registered? </span>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Login Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
