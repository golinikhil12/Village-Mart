import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VirtualSupermarket } from '../components/supermarket/VirtualSupermarket.jsx';

export const VirtualStorePage = () => {
  const navigate = useNavigate();

  const handleExit = () => {
    navigate('/shop');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      <VirtualSupermarket onExit={handleExit} />
    </div>
  );
};
