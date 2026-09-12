import React, { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { api } from '../services/api.js';
import { FarmerCard } from '../components/cards/FarmerCard.jsx';
import { FarmerCardSkeleton } from '../components/common/Skeleton.jsx';

export const FarmersPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (location) params.set('location', location);
      params.set('verification_status', 'approved');

      const res = await api.get(`/farmers?${params.toString()}`);
      if (res.success) {
        setFarmers(res.farmers || []);
      }
    } catch (err) {
      console.error('Failed to fetch farmers directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFarmers();
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      <div className="page-header">
        <div className="container">
          <h1>Meet Our Verified Farmers</h1>
          <p>Discover local farmers empowering rural agriculture by bringing fresh harvest directly to your kitchen.</p>
        </div>
      </div>

      <div className="container">
        {/* Search & Location Filter */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <form onSubmit={handleSearchSubmit} className="farmers-search-form">
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search by farmer name, farm name, or produce..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 14 }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 42 }}
                placeholder="Filter by city or state (e.g. Warangal, Nashik)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '100%' }}>
              Find Farmers
            </button>
          </form>
        </div>

        {/* FARMER DIRECTORY GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <FarmerCardSkeleton key={i} />
            ))}
          </div>
        ) : farmers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h3>No Verified Farmers Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try broadening your search query or removing location filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {farmers.map((farmer) => (
              <FarmerCard key={farmer.user_id} farmer={farmer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
