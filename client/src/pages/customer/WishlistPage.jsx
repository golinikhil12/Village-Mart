import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const WishlistPage = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your Wishlist is Empty"
        description="Save your favorite fresh produce and farm items here to order anytime."
        actionText="Discover Direct Farm Produce"
        actionLink="/shop"
      />
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-deep)', marginBottom: '1.5rem' }}>Saved Wishlist ({wishlist.length})</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {wishlist.map((item) => (
          <div key={item.wishlist_id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <img
                src={item.primary_image || '/placeholder-product.jpg'}
                alt={item.product_name}
                onError={handleProductImageError}
                style={{ width: '100%', height: 180, borderRadius: 'var(--radius-md)', objectFit: 'cover', marginBottom: '1rem' }}
              />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-deep)', marginBottom: '0.3rem' }}>{item.product_name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Producer: {item.farm_name || item.farmer_name}</p>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-deep)', margin: '0.5rem 0' }}>
                ₹{item.price} / {item.unit}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={() => addToCart(item.product_id, 1)} className="btn btn-primary btn-sm">
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button onClick={() => toggleWishlist(item.product_id)} className="btn btn-outline btn-sm" title="Remove">
                <Trash2 size={16} color="var(--danger)" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
