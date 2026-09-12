import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout.jsx';
import { CustomerLayout } from './components/layout/CustomerLayout.jsx';
import { FarmerLayout } from './components/layout/FarmerLayout.jsx';
import { AdminLayout } from './components/layout/AdminLayout.jsx';

// Public Pages
import { HomePage } from './pages/HomePage.jsx';
import { ShopPage } from './pages/ShopPage.jsx';
import { ProductDetailsPage } from './pages/ProductDetailsPage.jsx';
import { FarmersPage } from './pages/FarmersPage.jsx';
import { FarmerProfilePage } from './pages/FarmerProfilePage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { CartPage } from './pages/customer/CartPage.jsx';
import { CheckoutPage } from './pages/customer/CheckoutPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { UnauthorizedPage } from './pages/UnauthorizedPage.jsx';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard.jsx';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage.jsx';
import { WishlistPage } from './pages/customer/WishlistPage.jsx';
import { AddressesPage } from './pages/customer/AddressesPage.jsx';
import { NotificationsPage } from './pages/customer/NotificationsPage.jsx';

// Farmer Pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard.jsx';
import { FarmerProductsPage } from './pages/farmer/FarmerProductsPage.jsx';
import { AddEditProductPage } from './pages/farmer/AddEditProductPage.jsx';
import { FarmerOrdersPage } from './pages/farmer/FarmerOrdersPage.jsx';
import { FarmerInventoryPage } from './pages/farmer/FarmerInventoryPage.jsx';
import { FarmerProfileSettingsPage } from './pages/farmer/FarmerProfileSettingsPage.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminVerificationPage } from './pages/admin/AdminVerificationPage.jsx';
import { AdminProductsPage } from './pages/admin/AdminProductsPage.jsx';
import { AdminUsersPage } from './pages/admin/AdminUsersPage.jsx';

// Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NotificationProvider>
              <Router>
                <Routes>
                  {/* PUBLIC ROUTES */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/farmers" element={<FarmersPage />} />
                    <Route path="/farmer/:id" element={<FarmerProfilePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute allowedRoles={['customer', 'farmer', 'admin']}>
                          <CheckoutPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  </Route>

                  {/* CUSTOMER PORTAL */}
                  <Route
                    path="/customer"
                    element={
                      <ProtectedRoute allowedRoles={['customer', 'farmer', 'admin']}>
                        <CustomerLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<CustomerDashboard />} />
                    <Route path="orders" element={<CustomerOrdersPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="addresses" element={<AddressesPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Route>

                  {/* FARMER PORTAL */}
                  <Route
                    path="/farmer"
                    element={
                      <ProtectedRoute allowedRoles={['farmer', 'admin']}>
                        <FarmerLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<FarmerDashboard />} />
                    <Route path="products" element={<FarmerProductsPage />} />
                    <Route path="products/new" element={<AddEditProductPage />} />
                    <Route path="products/edit/:id" element={<AddEditProductPage />} />
                    <Route path="orders" element={<FarmerOrdersPage />} />
                    <Route path="inventory" element={<FarmerInventoryPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<FarmerProfileSettingsPage />} />
                  </Route>

                  {/* ADMIN PORTAL */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="verification" element={<AdminVerificationPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Route>

                  {/* CATCH ALL 404 */}
                  <Route path="*" element={<PublicLayout />}>
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Router>
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
