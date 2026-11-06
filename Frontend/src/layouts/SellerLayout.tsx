import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiBox, 
  FiList, 
  FiSettings, 
  FiLogOut, 
  FiShoppingBag,
  FiMenu,
  FiX,
  FiPlusCircle,
  FiTruck
} from 'react-icons/fi';
import { useLogout } from '../hooks/useAuth';
import SignOutModal from '../components/SignOutModal';
import BrandLogo from '../components/BrandLogo';

export default function SellerLayout() {
  const { mutate: logout, isPending } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive 
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm' 
        : 'text-gray-400 hover:bg-gray-900/80 hover:text-white'
    }`;

  const navItems = [
    { to: '/seller/dashboard', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/seller/orders', icon: FiTruck, label: 'Orders & Fulfillment' },
    { to: '/seller/products', icon: FiBox, label: 'My Products' },
    { to: '/seller/listings', icon: FiList, label: 'Manage Listings' },
    { to: '/seller/settings', icon: FiSettings, label: 'Shop Settings' },
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white font-poppins flex flex-col lg:flex-row">
      
      {/* ── 1. MOBILE & TABLET STICKY TOPBAR (< lg) ── */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-gray-800 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-1 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <FiX className="w-5 h-5 text-emerald-400" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <BrandLogo size="sm" />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Seller
          </span>
          <Link
            to="/seller/products/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition shadow-sm shadow-orange-500/20"
            title="Create New Product"
          >
            <FiPlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </Link>
        </div>
      </header>

      {/* ── 2. MOBILE DRAWER BACKDROP (< lg) ── */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ── 3. MOBILE SLIDE-OVER DRAWER (< lg) ── */}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0D0D0D] border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <BrandLogo size="sm" />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
              aria-label="Close drawer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <Link
              to="/seller/products/new"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99]"
            >
              <FiPlusCircle className="w-4 h-4" />
              <span>Create Product</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 flex-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                end={item.end}
                className={navClass}
              >
                <item.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-800/80 px-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/';
                }}
                className="flex items-center gap-2.5 text-xs font-semibold text-gray-400 hover:text-orange-400 py-2.5 px-3 rounded-xl hover:bg-gray-900 transition w-full text-left cursor-pointer min-h-[44px]"
              >
                <FiShoppingBag className="w-4 h-4 text-orange-400" />
                <span>Customer Storefront →</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Drawer Bottom Logout */}
        <div className="p-4 border-t border-gray-800">
          <button 
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isPending}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px]"
          >
            <FiLogOut className="w-4 h-4" /> 
            <span>Sign Out Merchant</span>
          </button>
        </div>
      </aside>

      {/* ── 4. DESKTOP PERSISTENT SIDEBAR (>= lg) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#0D0D0D] border-r border-gray-800 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-800/80">
          <BrandLogo size="md" />
          <div className="mt-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Merchant Hub
            </span>
          </div>
        </div>

        <div className="p-4 pb-0">
          <Link
            to="/seller/products/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99] min-h-[44px]"
          >
            <FiPlusCircle className="w-4 h-4" />
            <span>Create Product</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.end}
              className={navClass}
            >
              <item.icon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-800/80 px-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
              className="flex items-center gap-2.5 text-xs font-semibold text-gray-400 hover:text-orange-400 py-2.5 px-3 rounded-xl hover:bg-gray-900 transition w-full text-left cursor-pointer min-h-[44px]"
            >
              <FiShoppingBag className="w-4 h-4 text-orange-400" />
              <span>Customer Storefront →</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={isPending}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px]"
          >
            <FiLogOut className="w-4 h-4" /> 
            <span>Sign Out Merchant</span>
          </button>
        </div>
      </aside>

      {/* ── 5. MAIN CONTENT AREA (Bounded & Centered on Ultra-Wide / Zoom Out) ── */}
      <main className="flex-1 min-w-0 overflow-y-auto min-h-screen bg-black">
        <div className="w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── 6. LOGOUT CONFIRMATION MODAL ── */}
      <SignOutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        isLoading={isPending}
        title="Sign Out of Merchant Hub?"
        description="You will be signed out of your merchant store and returned to the store catalog."
      />

    </div>
  );
}
