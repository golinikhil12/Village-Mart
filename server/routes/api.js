import express from 'express';
import { verifyToken, isCustomer, isFarmer, isAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

import * as authController from '../controllers/authController.js';
import * as productController from '../controllers/productController.js';
import * as farmerController from '../controllers/farmerController.js';
import * as cartController from '../controllers/cartController.js';
import * as wishlistController from '../controllers/wishlistController.js';
import * as orderController from '../controllers/orderController.js';
import * as reviewController from '../controllers/reviewController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/register-customer', authController.registerCustomer);
router.post('/auth/register-farmer', authController.registerFarmer);
router.post('/auth/login', authController.login);
router.get('/auth/me', verifyToken, authController.getCurrentUser);

// --- Product & Category Routes ---
router.get('/products/categories', productController.getCategories);
router.get('/products/featured', productController.getFeaturedProducts);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', verifyToken, isFarmer, upload.array('images', 5), productController.createProduct);
router.put('/products/:id', verifyToken, upload.array('images', 5), productController.updateProduct);
router.delete('/products/:id', verifyToken, productController.deleteProduct);

// --- Farmer Routes ---
router.get('/farmers', farmerController.getFarmers);
router.get('/farmers/dashboard/stats', verifyToken, isFarmer, farmerController.getFarmerDashboardStats);
router.get('/farmers/:id', farmerController.getFarmerById);

// --- Cart Routes ---
router.get('/cart', verifyToken, cartController.getCart);
router.post('/cart/add', verifyToken, cartController.addToCart);
router.put('/cart/item/:id', verifyToken, cartController.updateCartItem);
router.delete('/cart/item/:id', verifyToken, cartController.removeFromCart);
router.delete('/cart/clear', verifyToken, cartController.clearCart);

// --- Wishlist Routes ---
router.get('/wishlist', verifyToken, wishlistController.getWishlist);
router.post('/wishlist', verifyToken, wishlistController.addToWishlist);
router.delete('/wishlist/:productId', verifyToken, wishlistController.removeFromWishlist);

// --- Order Routes ---
router.get('/orders/addresses', verifyToken, orderController.getAddresses);
router.post('/orders/addresses', verifyToken, orderController.addAddress);
router.post('/orders', verifyToken, orderController.createOrder);
router.get('/orders/customer', verifyToken, orderController.getCustomerOrders);
router.get('/orders/farmer', verifyToken, isFarmer, orderController.getFarmerOrders);
router.get('/orders/:id', verifyToken, orderController.getOrderById);
router.put('/orders/:id/status', verifyToken, orderController.updateOrderStatus);
router.put('/orders/:id/cancel', verifyToken, orderController.cancelOrder);

// --- Review Routes ---
router.post('/reviews', verifyToken, reviewController.createReview);
router.delete('/reviews/:id', verifyToken, reviewController.deleteReview);

// --- Notification Routes ---
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.put('/notifications/:id/read', verifyToken, notificationController.markNotificationRead);

// --- Admin Routes ---
router.get('/admin/stats', verifyToken, isAdmin, adminController.getAdminStats);
router.get('/admin/users', verifyToken, isAdmin, adminController.getAllUsers);
router.put('/admin/farmer/:farmerId/verification', verifyToken, isAdmin, adminController.updateFarmerVerification);
router.post('/admin/categories', verifyToken, isAdmin, adminController.addCategory);

export default router;
