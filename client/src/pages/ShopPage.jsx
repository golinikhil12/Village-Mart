import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/cards/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [organicOnly, setOrganicOnly] = useState(searchParams.get('organic') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  useEffect(() => {
    api.get('/products/categories').then((res) => {
      if (res.success) setCategories(res.categories || []);
    });
  }, []);

  const fetchProducts = async (overrideParams = null) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      const currentSearch = overrideParams?.search !== undefined ? overrideParams.search : search;
      const currentCategory = overrideParams?.category !== undefined ? overrideParams.category : selectedCategory;
      const currentMinPrice = overrideParams?.minPrice !== undefined ? overrideParams.minPrice : minPrice;
      const currentMaxPrice = overrideParams?.maxPrice !== undefined ? overrideParams.maxPrice : maxPrice;
      const currentMinRating = overrideParams?.minRating !== undefined ? overrideParams.minRating : minRating;
      const currentOrganic = overrideParams?.organic !== undefined ? overrideParams.organic : organicOnly;
      const currentSortBy = overrideParams?.sortBy !== undefined ? overrideParams.sortBy : sortBy;
      const currentPage = overrideParams?.page !== undefined ? overrideParams.page : page;

      if (currentSearch) queryParams.set('search', currentSearch);
      if (currentCategory) queryParams.set('category', currentCategory);
      if (currentMinPrice) queryParams.set('minPrice', currentMinPrice);
      if (currentMaxPrice) queryParams.set('maxPrice', currentMaxPrice);
      if (currentMinRating) queryParams.set('minRating', currentMinRating);
      if (currentOrganic) queryParams.set('organic', 'true');
      if (currentSortBy) queryParams.set('sortBy', currentSortBy);
      queryParams.set('page', currentPage);

      setSearchParams(queryParams);

      const res = await api.get(`/products?${queryParams.toString()}`);
      if (res && res.success) {
        setProducts(res.products || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      } else {
        setProducts([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Error fetching shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, organicOnly, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts({ page: 1 });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setOrganicOnly(false);
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
    fetchProducts({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      organic: false,
      sortBy: 'newest',
      page: 1
    });
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* HEADER */}
      <div className="page-header">
        <div className="container">
          <h1>Direct Farm Shop</h1>
          <p>Browse fresh organic produce, grains, fruits, and dairy direct from verified local farmers.</p>
        </div>
      </div>

      <div className="container">
        {/* Search Bar & Sorting Header */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 280 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input
                type="text"
                placeholder="Search products, farmers, or locations..."
                className="form-input"
                style={{ paddingLeft: 42 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={18} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sort by:</span>
              <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* CATEGORY CHIPS */}
        <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`btn btn-sm ${selectedCategory === '' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
              className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* MAIN SHOP LAYOUT */}
        <div className="shop-layout">
          {/* FILTER PANEL SIDEBAR */}
          <aside className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} /> Filters
              </h3>
              <button onClick={handleResetFilters} style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <RefreshCw size={14} /> Reset
              </button>
            </div>

            {/* Price Filter */}
            <div className="form-group">
              <label className="form-label">Price Range (₹)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  className="form-input"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="form-input"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Minimum Rating */}
            <div className="form-group">
              <label className="form-label">Minimum Rating</label>
              <select className="form-select" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4.5">4.5 Stars & above</option>
                <option value="4.0">4.0 Stars & above</option>
                <option value="3.5">3.5 Stars & above</option>
              </select>
            </div>

            {/* Organic Toggle */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1rem' }}>
              <input
                type="checkbox"
                id="organicCheck"
                checked={organicOnly}
                onChange={(e) => { setOrganicOnly(e.target.checked); setPage(1); }}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              <label htmlFor="organicCheck" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                🌿 Organic Produce Only
              </label>
            </div>

            <button onClick={() => { setPage(1); fetchProducts(); }} className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }}>
              Apply Filters
            </button>
          </aside>

          {/* PRODUCTS GRID */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
                Showing <strong style={{ color: 'var(--primary-deep)' }}>{pagination.total}</strong> fresh produce items
              </p>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No Produce Found"
                description="We couldn't find any agricultural products matching your filter criteria. Try adjusting your search keywords or resetting filters."
                actionText="Reset All Filters"
                onActionClick={handleResetFilters}
              />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* PAGINATION */}
                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => { setPage(pNum); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`btn btn-sm ${page === pNum ? 'btn-primary' : 'btn-outline'}`}
                        style={{ minWidth: 38 }}
                      >
                        {pNum}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
