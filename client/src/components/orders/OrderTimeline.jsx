import React from 'react';
import { Check, Clock, PackageCheck, Truck, Home, AlertCircle } from 'lucide-react';

export const OrderTimeline = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div
        style={{
          padding: '1rem',
          background: 'var(--danger-bg)',
          color: 'var(--danger)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 700,
          margin: '1.5rem 0'
        }}
      >
        <AlertCircle size={22} />
        <span>Order Cancelled</span>
      </div>
    );
  }

  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: Check },
    { key: 'preparing', label: 'Farmer Packing', icon: PackageCheck },
    { key: 'shipped', label: 'Dispatched', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home }
  ];

  const statusOrder = ['pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="timeline">
      {steps.map((step, idx) => {
        const stepIndex = statusOrder.indexOf(step.key);
        const isCompleted = currentIndex >= stepIndex && currentIndex !== -1;
        const isActive = currentIndex === stepIndex;

        const StepIcon = step.icon;

        return (
          <div
            key={step.key}
            className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
          >
            <div className="timeline-icon">
              {isCompleted ? <Check size={20} /> : <StepIcon size={18} />}
            </div>
            <span className="timeline-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};
