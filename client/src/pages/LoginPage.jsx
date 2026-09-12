import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Key, Mail, Lock, User, Tractor, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const LoginPage = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'farmer') navigate('/farmer');
        else navigate('/customer');
      }
    } catch (err) {
      addToast(err.message || 'Login failed. Invalid credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{ padding: '4rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-deep)', marginBottom: '0.4rem' }}>Login to Village Mart</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Access your personalized marketplace account</p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div
            style={{
              padding: '1rem',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--primary-light)',
              marginBottom: '1.5rem'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-deep)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              ⚡ Quick Demo One-Click Login
            </span>
            <div className="demo-login-grid">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillDemoAccount('customer@villagemart.com', 'customer123')}
                style={{ fontSize: '0.75rem', padding: '0.35rem' }}
              >
                <User size={14} /> Customer
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillDemoAccount('farmer@villagemart.com', 'farmer123')}
                style={{ fontSize: '0.75rem', padding: '0.35rem' }}
              >
                <Tractor size={14} /> Farmer
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fillDemoAccount('admin@villagemart.com', 'admin123')}
                style={{ fontSize: '0.75rem', padding: '0.35rem' }}
              >
                <ShieldCheck size={14} /> Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg btn-block" style={{ marginTop: '1.5rem' }}>
              <LogIn size={20} /> {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
