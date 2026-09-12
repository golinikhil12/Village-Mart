import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      if (res.success) {
        setWishlist(res.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) {
      addToast('Please login to save items to wishlist.', 'error');
      return;
    }

    const isWishlisted = wishlist.some((item) => item.product_id === productId);

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${productId}`);
        addToast('Removed from wishlist.', 'info');
      } else {
        await api.post('/wishlist', { product_id: productId });
        addToast('Saved to wishlist!', 'success');
      }
      fetchWishlist();
    } catch (err) {
      addToast(err.message || 'Wishlist update failed.', 'error');
    }
  };

  const isWishlisted = (productId) => wishlist.some((item) => item.product_id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistCount: wishlist.length, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
