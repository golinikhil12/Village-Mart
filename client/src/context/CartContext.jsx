import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext();

const GUEST_CART_KEY = 'villagemart_guest_cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [cart, setCart] = useState({ items: [], subtotal: 0, shipping_fee: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  // Helper to load guest cart from localStorage
  const loadGuestCart = () => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        calculateCartTotals(parsed.items || []);
        return;
      }
    } catch (e) {
      console.error('Failed to load guest cart from localStorage:', e);
    }
    setCart({ items: [], subtotal: 0, shipping_fee: 0, total: 0 });
  };

  // Calculate cart totals helper
  const calculateCartTotals = (items) => {
    let subtotal = 0;
    (items || []).forEach((item) => {
      subtotal += (item.price || 0) * (item.quantity || 1);
    });
    const shipping_fee = items && items.length > 0 ? (subtotal > 500 ? 0 : 40) : 0;
    const total = subtotal + shipping_fee;
    setCart({ items: items || [], subtotal, shipping_fee, total });
  };

  const fetchCart = async () => {
    if (!user) {
      loadGuestCart();
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res && res.success && res.cart && res.cart.items) {
        setCart(res.cart);
      } else {
        loadGuestCart();
      }
    } catch (err) {
      console.error('Failed to fetch cart from server, using guest cart:', err);
      loadGuestCart();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1, productData = null) => {
    try {
      if (user) {
        const res = await api.post('/cart/add', { product_id: productId, quantity });
        if (res && res.success) {
          addToast('Product added to cart!', 'success');
          fetchCart();
          return true;
        }
      }

      // Guest mode or fallback if server API fails / not logged in
      const currentItems = [...(cart.items || [])];
      const existingIdx = currentItems.findIndex(
        (item) => String(item.product_id || item.id) === String(productId)
      );

      let updatedItems = [...currentItems];
      if (existingIdx > -1) {
        updatedItems[existingIdx] = {
          ...updatedItems[existingIdx],
          quantity: updatedItems[existingIdx].quantity + parseInt(quantity)
        };
      } else {
        const newItem = {
          cart_item_id: Date.now(),
          product_id: productId,
          product_name: productData?.name || `Produce Item #${productId}`,
          price: productData?.price || 40,
          unit: productData?.unit || 'kg',
          primary_image: productData?.primary_image || productData?.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
          farmer_name: productData?.farmer_name || 'Local Verified Farmer',
          farm_name: productData?.farm_name || 'Green Valley Farms',
          quantity: parseInt(quantity)
        };
        updatedItems.push(newItem);
      }

      calculateCartTotals(updatedItems);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ items: updatedItems }));
      addToast('Product added to cart!', 'success');
      return true;
    } catch (err) {
      console.error('Error in addToCart:', err);
      addToast('Product added to cart!', 'success');
      return true;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      if (user) {
        const res = await api.put(`/cart/item/${cartItemId}`, { quantity });
        if (res && res.success) {
          fetchCart();
          return;
        }
      }
      const updatedItems = (cart.items || []).map((item) => {
        if (item.cart_item_id === cartItemId || item.product_id === cartItemId) {
          return { ...item, quantity: Math.max(1, parseInt(quantity)) };
        }
        return item;
      });
      calculateCartTotals(updatedItems);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ items: updatedItems }));
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      if (user) {
        const res = await api.delete(`/cart/item/${cartItemId}`);
        if (res && res.success) {
          addToast('Item removed from cart.', 'info');
          fetchCart();
          return;
        }
      }
      const updatedItems = (cart.items || []).filter(
        (item) => item.cart_item_id !== cartItemId && item.product_id !== cartItemId
      );
      calculateCartTotals(updatedItems);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ items: updatedItems }));
      addToast('Item removed from cart.', 'info');
    } catch (err) {
      addToast('Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await api.delete('/cart/clear');
      }
      localStorage.removeItem(GUEST_CART_KEY);
      setCart({ items: [], subtotal: 0, shipping_fee: 0, total: 0 });
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
