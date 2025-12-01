import React from 'react';
import { Routes, Route } from "react-router-dom";

// ================== 1. USER MAIN PAGES ==================
import Home from "../pages/Home";
import About from "../pages/About";
import Cart from "../pages/Cart";
import Collection from "../pages/Collection";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Order from "../pages/Orders";
import PlaceOrder from "../pages/PlaceOrder";
import Product from "../pages/Product";
import Verify from "../pages/Verify"; // <--- ADDED: Critical for Payment Success

// ================== 2. EXTRA USER FEATURES ==================
import Profile from "../pages/Profile";
import Wishlist from "../pages/Wishlist";
import Checkout from "../pages/Checkout";
import Search from "../pages/Search";
import NotFound from "../pages/NotFound";

// ================== 3. POLICY PAGES ==================
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import Refund from "../pages/Refund";
import Shipping from "../pages/Shipping";

// ================== 4. ADMIN DASHBOARD ==================
import AdminDashboard from "../pages/AdminDashboard";
import AddProduct from "../pages/AddProduct";
import ManageOrders from "../pages/ManageOrders";
import ManageUsers from "../pages/ManageUsers";
import ManageInventory from "../pages/ManageInventory";

// ================== 5. DYNAMIC COMPONENTS ==================
import heroData from "../../hero.json"; // Adjust path if needed
import Hero from "../components/Hero";

function AppRoutes() {
  return (
    <Routes>

      {/* ----- Main Store Pages ----- */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/order" element={<Order />} />
      <Route path="/place-order" element={<PlaceOrder />} />
      <Route path="/product/:productId" element={<Product />} />
      <Route path="/verify" element={<Verify />} /> {/* Payment Callback */}

      {/* ----- User Account & Features ----- */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/search" element={<Search />} />

      {/* ----- Legal & Policies (Linked from Footer/OurPolicy) ----- */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/shipping" element={<Shipping />} />

      {/* ----- Admin Panel ----- */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/add-product" element={<AddProduct />} />
      <Route path="/admin/manage-orders" element={<ManageOrders />} />
      <Route path="/admin/manage-users" element={<ManageUsers />} />
      <Route path="/admin/manage-inventory" element={<ManageInventory />} />

      {/* ----- Dynamic Hero Routes (from JSON) ----- */}
      {heroData.hero.map((item, index) => (
        <Route 
          key={index} 
          path={`/${item.link}`} 
          element={<Hero/>} 
        />
      ))}

      {/* ----- 404 Fallback ----- */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;