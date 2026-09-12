import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar.jsx';
import { Footer } from '../common/Footer.jsx';

export const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
