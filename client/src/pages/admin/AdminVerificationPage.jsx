import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, X, MapPin, Award, Phone, Mail } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export const AdminVerificationPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchPendingFarmers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.success) {
        setFarmers(res.pendingFarmers || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending farmers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFarmers();
  }, []);

  const handleVerification = async (farmerId, status) => {
    try {
      const res = await api.put(`/admin/farmer/${farmerId}/verification`, { status });
      if (res.success) {
        addToast(res.message, status === 'approved' ? 'success' : 'info');
        fetchPendingFarmers();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update farmer status.', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', margin: 0 }}>Farmer Verification Queue</h2>
        <p style={{ color: 'var(--text-muted)' }}>Review farm credentials and approve verified farmer seller badges.</p>
      </div>

      {loading ? (
        <p>Loading verification queue...</p>
      ) : farmers.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>All Farmer Applications Processed</h3>
          <p>There are currently no pending farmer verification requests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {farmers.map((farmer) => (
            <div key={farmer.user_id} className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', margin: 0 }}>{farmer.name}</h3>
                    <span className="badge badge-pending">Pending Verification</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', margin: '0.3rem 0 0.5rem 0' }}>{farmer.farm_name}</h4>

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={15} color="var(--primary-light)" /> {farmer.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Award size={15} color="var(--primary-light)" /> {farmer.farming_experience || '5 Years'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={15} color="var(--primary-light)" /> {farmer.phone}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Mail size={15} color="var(--primary-light)" /> {farmer.email}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => handleVerification(farmer.user_id, 'approved')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={18} /> Approve & Verify
                  </button>
                  <button onClick={() => handleVerification(farmer.user_id, 'rejected')} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <X size={18} /> Reject
                  </button>
                </div>
              </div>

              {farmer.description && (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <strong>Farm Bio / Methods:</strong> {farmer.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
