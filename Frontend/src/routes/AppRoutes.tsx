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

// Fallback
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      {/* ----- Public Store Pages (Guest Access) ----- */}
      <Route path="/" element={<Home />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/product/:productId" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/search" element={<Search />} />
      
      {/* ----- Authentication ----- */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ----- The "Auth Wall" ----- */}
      {/* Everything inside here requires the user to be logged in */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Route>

      {/* ----- 404 ----- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
