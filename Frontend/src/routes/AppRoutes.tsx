import React, { Suspense } from 'react';
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from './ProtectedRoute';

// Public Fast-Path Pages (Immediately needed for store visitors)
import Home from "../pages/Home";
import Collection from "../pages/Collection";
import Product from "../pages/Product";
import Cart from "../pages/Cart";
import Search from "../pages/Search";

// Auth Pages (Lazy Loaded on demand)
const Login = React.lazy(() => import("../pages/Login"));
const VerifyOTP = React.lazy(() => import("../pages/VerifyOTP"));
const ForgotPassword = React.lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("../pages/ResetPassword"));

// Protected Consumer Pages (Lazy Loaded)
const PlaceOrder = React.lazy(() => import("../pages/PlaceOrder"));
const Orders = React.lazy(() => import("../pages/Orders"));
const Checkout = React.lazy(() => import("../pages/Checkout"));
const Profile = React.lazy(() => import("../pages/Profile"));
const Wishlist = React.lazy(() => import("../pages/Wishlist"));

// Seller Pages (Lazy Loaded - isolated bundle)
const SellerOnboarding = React.lazy(() => import("../pages/seller/Onboarding"));
const SellerDashboard = React.lazy(() => import("../pages/seller/Dashboard"));
const SellerProducts = React.lazy(() => import("../pages/seller/Products"));
const SellerCreateProduct = React.lazy(() => import("../pages/seller/CreateProduct"));
const SellerListings = React.lazy(() => import("../pages/seller/Listings"));
const SellerSettings = React.lazy(() => import("../pages/seller/Settings"));
const SellerOrders = React.lazy(() => import("../pages/seller/Orders"));

// Admin Pages (Lazy Loaded - isolated bundle)
const AdminDashboard = React.lazy(() => import("../pages/admin/Dashboard"));
const AdminProducts = React.lazy(() => import("../pages/admin/Products"));
const AdminProductReview = React.lazy(() => import("../pages/admin/ProductReview"));
const AdminSellers = React.lazy(() => import("../pages/admin/Sellers"));
const AdminCategories = React.lazy(() => import("../pages/admin/Categories"));
const AdminBrands = React.lazy(() => import("../pages/admin/Brands"));

// Fallback (Lazy Loaded)
const NotFound = React.lazy(() => import("../pages/NotFound"));
const About = React.lazy(() => import("../pages/About"));
const Contact = React.lazy(() => import("../pages/Contact"));
const Refund = React.lazy(() => import("../pages/Refund"));

import ConsumerLayout from '../layouts/ConsumerLayout';
import AdminLayout from '../layouts/AdminLayout';
import SellerLayout from '../layouts/SellerLayout';

const RouteLoader = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center">
    <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
    <span className="mt-3 text-xs tracking-widest text-gray-400 uppercase">Loading...</span>
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* ----- Public Store Pages (Guest Access) ----- */}
        <Route element={<ConsumerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/refund" element={<Refund />} />
          
          {/* ----- Authentication ----- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/verify" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ----- Consumer & Merchant Protected Routes ----- */}
          <Route element={<ProtectedRoute allowedRoles={['CONSUMER', 'SELLER']} />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/place-order" element={<PlaceOrder />} />
            <Route path="/orders" element={<Orders />} />
          </Route>

          {/* ----- General Authenticated User Account (Wishlist & Profile) ----- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ----- Seller Onboarding (Any Logged-in User can apply) ----- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/seller/onboarding" element={<SellerOnboarding />} />
        </Route>

        {/* ----- Seller Merchant Wall (Verified Sellers & Admins Only) ----- */}
        <Route element={<ProtectedRoute allowedRoles={['SELLER', 'ADMIN']} />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/products/new" element={<SellerCreateProduct />} />
            <Route path="/seller/listings" element={<SellerListings />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
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
    </Suspense>
  );
}

export default AppRoutes;
