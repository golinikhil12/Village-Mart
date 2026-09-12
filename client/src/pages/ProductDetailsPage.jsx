import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ShieldCheck, MapPin, Calendar, Sprout, Truck, Plus, Minus, CheckCircle2, MessageSquare } from 'lucide-react';
import { api } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ProductCard } from '../components/cards/ProductCard.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { handleProductImageError, handleUserImageError } from '../utils/imageUtils.js';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.success && res.product) {
        setProduct(res.product);
        if (res.product.images && res.product.images.length > 0) {
          setActiveImage(res.product.images[0].image_url);
        } else {
          setActiveImage('/placeholder-product.jpg');
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--primary-deep)', fontWeight: 600 }}>Loading fresh produce details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p>The requested produce item does not exist or has been removed.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Shop</Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const avgRating = parseFloat(product.avg_rating || 5.0).toFixed(1);

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, quantity);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please login to post a review.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (res.success) {
        addToast(res.message, 'success');
        setReviewModalOpen(false);
        setReviewComment('');
        fetchProduct();
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <Link to="/">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt; <Link to={`/shop?category=${product.category_slug}`}>{product.category_name}</Link> &gt; <strong style={{ color: 'var(--primary-deep)' }}>{product.name}</strong>
        </div>

        {/* TOP PRODUCT SECTION */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <div className="product-detail-layout">
            {/* IMAGE GALLERY */}
            <div>
              <div style={{ position: 'relative', height: 400, borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: '#f0f2f0', marginBottom: '1rem' }}>
                <img src={activeImage} alt={product.name} onError={handleProductImageError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {product.organic === 1 && (
                  <span className="badge badge-organic" style={{ position: 'absolute', top: 15, left: 15 }}>
                    🌿 100% Certified Organic
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.image_url}
                      alt={`${product.name} thumbnail`}
                      onError={handleProductImageError}
                      onClick={() => setActiveImage(img.image_url)}
                      style={{
                        width: 75,
                        height: 75,
                        borderRadius: 'var(--radius-md)',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: activeImage === img.image_url ? '3px solid var(--primary)' : '1px solid var(--border-color)'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT DETAILS */}
            <div>
              <span className="badge badge-verified" style={{ marginBottom: '0.5rem' }}>
                {product.category_name}
              </span>

              <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-deep)', margin: '0.5rem 0 0.75rem 0' }}>{product.name}</h1>

              {/* Rating & Seller summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="star-rating">
                  <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{avgRating}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.review_count} customer reviews)</span>
                </div>
                <span style={{ color: 'var(--border-color)' }}>|</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={15} color="var(--primary-light)" /> {product.location}
                </span>
              </div>

              {/* Price & Unit */}
              <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-deep)' }}>₹{product.price}</span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {product.unit}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 700, color: product.quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {product.quantity > 0 ? `In Stock (${product.quantity} ${product.unit} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Specs List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="var(--primary)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Harvest Date: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{product.harvest_date || 'Fresh Daily'}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sprout size={18} color="var(--primary)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Farming Method: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{product.farming_method || 'Organic/Natural'}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={18} color="var(--primary)" />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Est. Delivery: </span>
                    <strong style={{ color: 'var(--text-main)' }}>Within 24-36 Hours</strong>
                  </div>
                </div>
              </div>

              {/* Quantity Selector & Actions */}
              {product.quantity > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ padding: '0.6rem 0.9rem', border: 'none', background: '#ffffff', cursor: 'pointer' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ padding: '0.6rem 1.25rem', fontWeight: 800, minWidth: 40, textAlign: 'center' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      style={{ padding: '0.6rem 0.9rem', border: 'none', background: '#ffffff', cursor: 'pointer' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => addToCart(product.id, quantity)}
                  disabled={product.quantity <= 0}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.quantity <= 0}
                  className="btn btn-accent btn-lg"
                  style={{ flex: 1 }}
                >
                  Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="btn btn-outline btn-lg"
                  title="Wishlist"
                >
                  <Heart size={20} color={wishlisted ? '#ef4444' : '#6b7280'} fill={wishlisted ? '#ef4444' : 'none'} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FARMER INFORMATION CARD */}
        <div className="card" style={{ padding: '2rem', marginBottom: '3rem', background: 'linear-gradient(135deg, #ffffff 0%, #f3f6f3 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img
                src={product.farmer_profile_image || '/placeholder-user.jpg'}
                alt={product.farmer_name}
                onError={handleUserImageError}
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-deep)', margin: 0 }}>{product.farmer_name}</h3>
                  {product.verification_status === 'approved' && (
                    <span className="badge badge-verified">
                      <CheckCircle2 size={14} /> Verified Producer
                    </span>
                  )}
                </div>
                <p style={{ fontWeight: 700, color: 'var(--primary)', margin: '0.2rem 0' }}>{product.farm_name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location: {product.farmer_location || product.location}</p>
              </div>
            </div>

            <Link to={`/farmer/${product.farmer_id}`} className="btn btn-secondary">
              View Verified Farmer Profile
            </Link>
          </div>
        </div>

        {/* DESCRIPTION & REVIEWS TABS */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-deep)', marginBottom: '1rem' }}>Product Description</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '2.5rem' }}>
            {product.description || 'Harvested directly from local village farms adhering to high standards of fresh agricultural cultivation.'}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '2rem 0' }} />

          {/* REVIEWS SECTION */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-deep)', margin: 0 }}>
                Customer Reviews & Ratings ({product.reviews ? product.reviews.length : 0})
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real feedback from verified Village Mart buyers.</p>
            </div>
            <button onClick={() => setReviewModalOpen(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> Write a Review
            </button>
          </div>

          {product.reviews && product.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {product.reviews.map((rev) => (
                <div key={rev.id} style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-mint)', color: 'var(--primary-deep)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {rev.user_name ? rev.user_name.charAt(0) : 'U'}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--primary-deep)' }}>{rev.user_name}</span>
                    </div>
                    <div className="star-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={15} fill={i < rev.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>{rev.comment}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: '0.5rem' }}>
                    Posted on {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews yet. Be the first customer to review this farm produce!</p>
          )}
        </div>

        {/* RECOMMENDED PRODUCTS */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>You May Also Like</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {product.relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WRITE REVIEW MODAL */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Write a Produce Review">
        <form onSubmit={handleReviewSubmit}>
          <div className="form-group">
            <label className="form-label">Overall Rating (1 to 5 Stars)</label>
            <select className="form-select" value={reviewRating} onChange={(e) => setReviewRating(parseInt(e.target.value))}>
              <option value="5">★★★★★ (5 - Excellent Produce)</option>
              <option value="4">★★★★☆ (4 - Very Good)</option>
              <option value="3">★★★☆☆ (3 - Average)</option>
              <option value="2">★★☆☆☆ (2 - Poor)</option>
              <option value="1">★☆☆☆☆ (1 - Terrible)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Your Review Comment</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Share your experience regarding freshness, taste, packaging, and direct farm quality..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={submittingReview} className="btn btn-primary btn-block">
            {submittingReview ? 'Submitting...' : 'Submit Product Review'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
