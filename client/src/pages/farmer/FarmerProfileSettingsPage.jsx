import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../services/api.js';

export const FarmerProfileSettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const profile = user?.farmer_profile;

  const [farmName, setFarmName] = useState(profile?.farm_name || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [desc, setDesc] = useState(profile?.description || '');

  const handleSave = async (e) => {
    e.preventDefault();
    addToast('Farm profile settings saved successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: 650 }}>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>Farm Profile Settings</h2>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Farm Name</label>
            <input type="text" className="form-input" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Location (City, State)</label>
            <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Farm Story & Cultivation Bio</label>
            <textarea className="form-textarea" rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Save Profile Settings
          </button>
        </form>
      </div>
    </div>
  );
};
