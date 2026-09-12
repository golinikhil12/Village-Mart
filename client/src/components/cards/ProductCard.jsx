import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const primaryImage = product.primary_image || (product.images && product.images[0]?.image_url) || '/placeholder-product.jpg';
  const rating = parseFloat(product.avg_rating || 5.0).toFixed(1);
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="card product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Product Image Container */}
      <div style={{ position: 'relative', width: '100%', height: 220, overflow: 'hidden', backgroundColor: '#f0f2f0' }}>
        <img
          src={primaryImage}
          alt={product.name}
          onError={handleProductImageError}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {product.organic === 1 && <span className="badge badge-organic">🌿 Organic</span>}
          {product.verification_status === 'approved' && (
            <span className="badge badge-verified">
              <CheckCircle size={12} /> Verified Farm
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="icon-btn"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title="Save to Wishlist"
        >
          <Heart size={18} color={wishlisted ? '#ef4444' : '#6b7280'} fill={wishlisted ? '#ef4444' : 'none'} />
        </button>

        {/* Stock Status Badge */}
        {product.quantity <= 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(239, 68, 68, 0.9)',
              color: '#ffffff',
              textAlign: 'center',
              padding: '0.3rem',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {product.category_name || 'Produce'}
            </span>
            <div className="star-rating" style={{ fontSize: '0.85rem' }}>
              <Star size={15} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{rating}</span>
            </div>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3
              style={{
                fontSize: '1.1rem',
                marginBottom: '0.4rem',
                color: 'var(--primary-deep)',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: '2.7em'
              }}
            >
              {product.name}
            </h3>
          </Link>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={14} color="var(--primary-light)" />
            <span>{product.farm_name || product.farmer_name || 'Local Farm'} ({product.farmer_location || product.location})</span>
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-deep)' }}>₹{product.price}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}> / {product.unit}</span>
            </div>
            {product.quantity > 0 && product.quantity <= 15 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-earth)' }}>
                Only {product.quantity} left
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
            <Link to={`/product/${product.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
              Details
            </Link>
            <button
              onClick={() => addToCart(product.id, 1)}
              disabled={product.quantity <= 0}
              className="btn btn-primary btn-sm"
              title="Add to Cart"
            >
              <ShoppingBag size={16} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
