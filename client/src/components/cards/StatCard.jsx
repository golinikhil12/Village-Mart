import React from 'react';

export const StatCard = ({ icon: Icon, label, value, color = 'var(--primary-mint)', textColor = 'var(--primary-deep)' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color, color: textColor }}>
        <Icon size={24} />
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <h4 className="stat-value" style={{ color: textColor }}>{value}</h4>
      </div>
    </div>
  );
};
