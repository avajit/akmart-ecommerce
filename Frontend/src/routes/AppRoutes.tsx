import React from 'react';
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from './ProtectedRoute';

// Public Pages (Guests can browse)
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Collection from "../pages/Collection";
import Product from "../pages/Product";
import Search from "../pages/Search";

// Auth
import Login from "../pages/Login";
import VerifyOTP from "../pages/VerifyOTP";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Protected Pages (Require Login)
import PlaceOrder from "../pages/PlaceOrder";
import Orders from "../pages/Orders";
import Checkout from "../pages/Checkout";
import Profile from "../pages/Profile";
import Wishlist from "../pages/Wishlist";

// Seller Pages
import SellerOnboarding from "../pages/seller/Onboarding";
import SellerDashboard from "../pages/seller/Dashboard";
import SellerProducts from "../pages/seller/Products";
import SellerCreateProduct from "../pages/seller/CreateProduct";
import SellerListings from "../pages/seller/Listings";
import SellerSettings from "../pages/seller/Settings";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/Products";
import AdminProductReview from "../pages/admin/ProductReview";
import AdminSellers from "../pages/admin/Sellers";
import AdminCategories from "../pages/admin/Categories";
import AdminBrands from "../pages/admin/Brands";

// Fallback
import NotFound from "../pages/NotFound";

import ConsumerLayout from '../layouts/ConsumerLayout';
import AdminLayout from '../layouts/AdminLayout';
import SellerLayout from '../layouts/SellerLayout';

function AppRoutes() {
  return (
    <Routes>
      {/* ----- Public Store Pages (Guest Access) ----- */}
      <Route element={<ConsumerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/product/:slug" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<Search />} />
        
        {/* ----- Authentication ----- */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ----- The "Auth Wall" (Consumer Protected) ----- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>
      </Route>

      {/* ----- Seller Wall ----- */}
      <Route element={<ProtectedRoute allowedRoles={['SELLER', 'ADMIN']} />}>
        <Route element={<SellerLayout />}>
          <Route path="/seller/onboarding" element={<SellerOnboarding />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/new" element={<SellerCreateProduct />} />
          <Route path="/seller/listings" element={<SellerListings />} />
          <Route path="/seller/settings" element={<SellerSettings />} />
        </Route>
      </Route>

      {/* ----- Admin Wall ----- */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/products/:id" element={<AdminProductReview />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/brands" element={<AdminBrands />} />
        </Route>
      </Route>

      {/* ----- 404 ----- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
