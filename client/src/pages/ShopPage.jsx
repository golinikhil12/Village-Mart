import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { ProductCard } from '../components/cards/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/common/Skeleton.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';

const FALLBACK_SHOWCASE_PRODUCTS = [
  {
    id: 1,
    name: 'Farm Fresh Organic Tomatoes',
    description: 'Vine-ripened red tomatoes grown organically in Warangal. Sweet, juicy, and perfect for salads, curries, and gravies.',
    price: 40,
    unit: 'kg',
    quantity: 150,
    harvest_date: '2026-09-07',
    farming_method: '100% Organic compost nurtured',
    organic: 1,
    location: 'Warangal, Telangana',
    status: 'published',
    category_id: 1,
    category_name: 'Vegetables',
    category_slug: 'vegetables',
    farmer_id: 2,
    farmer_name: 'Ravi Kumar',
    farm_name: 'Green Valley Farms',
    farmer_location: 'Warangal, Telangana',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 24
  },
  {
    id: 2,
    name: 'Nashik Red Onions',
    description: 'High-quality crunchy Nashik red onions with long shelf life. Rich flavor and intense aroma.',
    price: 35,
    unit: 'kg',
    quantity: 300,
    harvest_date: '2026-09-05',
    farming_method: 'Soil-drip drip irrigation',
    organic: 0,
    location: 'Nashik, Maharashtra',
    status: 'published',
    category_id: 1,
    category_name: 'Vegetables',
    category_slug: 'vegetables',
    farmer_id: 5,
    farmer_name: 'Mahesh Rao',
    farm_name: 'Rural Roots Farm',
    farmer_location: 'Nashik, Maharashtra',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.8,
    review_count: 18
  },
  {
    id: 3,
    name: 'Farm Fresh Potatoes',
    description: 'Clean, firm potatoes harvested directly from earthy Nashik soil. Great for roasting, frying, or boiling.',
    price: 30,
    unit: 'kg',
    quantity: 200,
    harvest_date: '2026-09-06',
    farming_method: 'Traditional Crop Rotation',
    organic: 0,
    location: 'Nashik, Maharashtra',
    status: 'published',
    category_id: 1,
    category_name: 'Vegetables',
    category_slug: 'vegetables',
    farmer_id: 5,
    farmer_name: 'Mahesh Rao',
    farm_name: 'Rural Roots Farm',
    farmer_location: 'Nashik, Maharashtra',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.7,
    review_count: 15
  },
  {
    id: 4,
    name: 'Kolar Sweet Alphonso Mangoes',
    description: 'Handpicked naturally ripened Alphonso mangoes. Heavenly fragrance and rich creamy pulp.',
    price: 350,
    unit: 'dozen',
    quantity: 50,
    harvest_date: '2026-09-08',
    farming_method: 'Tree-ripened organic orchard',
    organic: 1,
    location: 'Kolar, Karnataka',
    status: 'published',
    category_id: 2,
    category_name: 'Fruits',
    category_slug: 'fruits',
    farmer_id: 4,
    farmer_name: 'Anitha Devi',
    farm_name: 'Fresh Harvest Farm',
    farmer_location: 'Kolar, Karnataka',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 32
  },
  {
    id: 5,
    name: 'Fresh Robusta Bananas',
    description: 'Naturally grown nutrient-packed sweet Robusta bananas from Kolar orchards.',
    price: 60,
    unit: 'dozen',
    quantity: 120,
    harvest_date: '2026-09-07',
    farming_method: 'Natural Mulching',
    organic: 1,
    location: 'Kolar, Karnataka',
    status: 'published',
    category_id: 2,
    category_name: 'Fruits',
    category_slug: 'fruits',
    farmer_id: 4,
    farmer_name: 'Anitha Devi',
    farm_name: 'Fresh Harvest Farm',
    farmer_location: 'Kolar, Karnataka',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.8,
    review_count: 20
  },
  {
    id: 6,
    name: 'Pure Sona Masoori Unpolished Rice',
    description: 'Aromatic, low glycemic index Sona Masoori raw rice unpolished to retain natural fiber and vitamins.',
    price: 75,
    unit: 'kg',
    quantity: 500,
    harvest_date: '2026-08-20',
    farming_method: 'Natural Zero Budget Farming',
    organic: 1,
    location: 'Guntur, Andhra Pradesh',
    status: 'published',
    category_id: 3,
    category_name: 'Grains',
    category_slug: 'grains',
    farmer_id: 3,
    farmer_name: 'Suresh Reddy',
    farm_name: 'Sri Lakshmi Organic Farms',
    farmer_location: 'Guntur, Andhra Pradesh',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    avg_rating: 5.0,
    review_count: 45
  },
  {
    id: 7,
    name: 'Guntur Red Chilli Powder',
    description: 'Authentic stone-ground fiery Guntur red chilli powder. Vibrant natural color with distinct pungency.',
    price: 240,
    unit: '500g',
    quantity: 80,
    harvest_date: '2026-08-15',
    farming_method: 'Sun-dried traditional processing',
    organic: 1,
    location: 'Guntur, Andhra Pradesh',
    status: 'published',
    category_id: 6,
    category_name: 'Spices',
    category_slug: 'spices',
    farmer_id: 3,
    farmer_name: 'Suresh Reddy',
    farm_name: 'Sri Lakshmi Organic Farms',
    farmer_location: 'Guntur, Andhra Pradesh',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 28
  },
  {
    id: 8,
    name: 'Organic Salem Turmeric Powder',
    description: 'High-curcumin pure turmeric powder cultivated without chemical additives.',
    price: 180,
    unit: '500g',
    quantity: 100,
    harvest_date: '2026-08-10',
    farming_method: 'Organic & Sun Dried',
    organic: 1,
    location: 'Guntur, Andhra Pradesh',
    status: 'published',
    category_id: 6,
    category_name: 'Spices',
    category_slug: 'spices',
    farmer_id: 3,
    farmer_name: 'Suresh Reddy',
    farm_name: 'Sri Lakshmi Organic Farms',
    farmer_location: 'Guntur, Andhra Pradesh',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.8,
    review_count: 14
  },
  {
    id: 9,
    name: 'Fresh Organic Baby Spinach (Palak)',
    description: 'Tender, crisp, iron-packed organic spinach bundle harvested early in the morning.',
    price: 25,
    unit: 'bunch',
    quantity: 40,
    harvest_date: '2026-09-09',
    farming_method: 'Hydroponic / Clean Soil',
    organic: 1,
    location: 'Warangal, Telangana',
    status: 'published',
    category_id: 7,
    category_name: 'Leafy Greens',
    category_slug: 'leafy-greens',
    farmer_id: 2,
    farmer_name: 'Ravi Kumar',
    farm_name: 'Green Valley Farms',
    farmer_location: 'Warangal, Telangana',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
    avg_rating: 4.9,
    review_count: 19
  },
  {
    id: 10,
    name: 'Pure Gir Cow A2 Bilona Ghee',
    description: 'Traditional Vedic Bilona method curd-churned A2 ghee made from grass-fed Gir cows.',
    price: 1450,
    unit: 'liter',
    quantity: 25,
    harvest_date: '2026-09-01',
    farming_method: 'Free-range Grass-fed Dairy',
    organic: 1,
    location: 'Warangal, Telangana',
    status: 'published',
    category_id: 5,
    category_name: 'Dairy',
    category_slug: 'dairy',
    farmer_id: 2,
    farmer_name: 'Ravi Kumar',
    farm_name: 'Green Valley Farms',
    farmer_location: 'Warangal, Telangana',
    verification_status: 'approved',
    primary_image: 'https://images.unsplash.com/photo-1528750997573-59b89d66f4f7?w=800&auto=format&fit=crop&q=80',
    avg_rating: 5.0,
    review_count: 36
  }
];

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(FALLBACK_SHOWCASE_PRODUCTS);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: FALLBACK_SHOWCASE_PRODUCTS.length });
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
      if (res && res.success && res.categories && res.categories.length > 0) {
        setCategories(res.categories);
      }
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
      if (res && res.success && res.products && res.products.length > 0) {
        setProducts(res.products);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: res.products.length });
      } else {
        // Fallback showcase products filtering
        let filtered = [...FALLBACK_SHOWCASE_PRODUCTS];
        if (currentCategory) filtered = filtered.filter(p => p.category_slug === currentCategory);
        if (currentOrganic) filtered = filtered.filter(p => p.organic === 1);
        if (currentSearch) {
          const s = currentSearch.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
        }
        setProducts(filtered);
        setPagination({ page: 1, totalPages: 1, total: filtered.length });
      }
    } catch (err) {
      console.error('Error fetching shop products, using fallback:', err);
      setProducts(FALLBACK_SHOWCASE_PRODUCTS);
      setPagination({ page: 1, totalPages: 1, total: FALLBACK_SHOWCASE_PRODUCTS.length });
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
