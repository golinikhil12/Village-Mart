import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { handleProductImageError } from '../../utils/imageUtils.js';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="You haven't added any fresh farm produce to your cart yet. Explore local verified farmers!"
          actionText="Explore Direct Farm Produce"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-deep)', marginBottom: '2rem' }}>Shopping Cart ({cart.items.length} items)</h1>

        <div className="cart-layout">
          {/* CART ITEMS LIST */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Produce Details</span>
              <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cart.items.map((item) => (
                <div key={item.cart_item_id} className="cart-item-row">
                  <img
                    src={item.primary_image || '/placeholder-product.jpg'}
                    alt={item.product_name}
                    onError={handleProductImageError}
                    style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />

                  <div style={{ minWidth: 0, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-deep)', margin: '0 0 0.3rem 0', wordBreak: 'break-word' }}>{item.product_name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-word' }}>
                      Farmer: <strong>{item.farm_name || item.farmer_name}</strong>
                    </p>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-deep)' }}>
                      ₹{item.price} / {item.unit}
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: '0.35rem 0.65rem', fontWeight: 800, fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      style={{ padding: '0.35rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-deep)', display: 'block' }}>
                      ₹{item.price * item.quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.cart_item_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', marginTop: 4 }}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUMMARY SIDEBAR */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-deep)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Produce Subtotal</span>
                <strong style={{ color: 'var(--primary-deep)' }}>₹{cart.subtotal}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery Fee</span>
                <strong style={{ color: cart.shipping_fee === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                  {cart.shipping_fee === 0 ? 'FREE' : `₹${cart.shipping_fee}`}
                </strong>
              </div>

              {cart.subtotal <= 500 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-earth)', margin: 0 }}>
                  💡 Add ₹{500 - cart.subtotal} more to qualify for Free Shipping!
                </p>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                <span style={{ fontWeight: 800, color: 'var(--primary-deep)' }}>Total Pay</span>
                <strong style={{ color: 'var(--primary-deep)' }}>₹{cart.total}</strong>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-lg btn-block">
              Proceed to Checkout <ArrowRight size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.25rem', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="var(--primary)" /> 100% Direct Farmer Payment Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
