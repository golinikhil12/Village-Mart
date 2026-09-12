import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState({ items: [], subtotal: 0, shipping_fee: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, shipping_fee: 0, total: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      addToast('Please login to add products to cart.', 'error');
      return false;
    }
    try {
      const res = await api.post('/cart/add', { product_id: productId, quantity });
      if (res.success) {
        addToast('Product added to cart!', 'success');
        fetchCart();
        return true;
      }
    } catch (err) {
      addToast(err.message || 'Failed to add to cart.', 'error');
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await api.put(`/cart/item/${cartItemId}`, { quantity });
      if (res.success) {
        fetchCart();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update quantity.', 'error');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/item/${cartItemId}`);
      if (res.success) {
        addToast('Item removed from cart.', 'info');
        fetchCart();
      }
    } catch (err) {
      addToast('Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      fetchCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const cartCount = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
