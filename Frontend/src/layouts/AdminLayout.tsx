import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiBox, 
  FiUsers, 
  FiGrid, 
  FiTag, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiShoppingBag,
  FiShield
} from 'react-icons/fi';
import { useLogout } from '../hooks/useAuth';
import SignOutModal from '../components/SignOutModal';
import BrandLogo from '../components/BrandLogo';

export default function AdminLayout() {
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
        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm' 
        : 'text-gray-400 hover:bg-gray-900/80 hover:text-white'
    }`;

  const navItems = [
    { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard', end: true },
    { to: '/admin/orders', icon: FiShoppingBag, label: 'Order Management' },
    { to: '/admin/products', icon: FiBox, label: 'Products Queue' },
    { to: '/admin/sellers', icon: FiUsers, label: 'Manage Sellers' },
    { to: '/admin/categories', icon: FiGrid, label: 'Categories & Taxonomy' },
    { to: '/admin/brands', icon: FiTag, label: 'Brand Registry' },
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
            {mobileMenuOpen ? <FiX className="w-5 h-5 text-orange-400" /> : <FiMenu className="w-5 h-5" />}
          </button>
          <BrandLogo size="sm" />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase tracking-wider">
            Admin
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="p-2 text-gray-400 hover:text-orange-400 hover:bg-gray-800/80 rounded-xl transition cursor-pointer"
            title="Customer Storefront"
          >
            <FiShoppingBag className="w-4 h-4" />
          </button>
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

          <div className="px-5 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <FiShield className="text-orange-400" /> Platform Governance
            </span>
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
                <item.icon className="w-4 h-4 text-orange-400 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-800/80 px-2">
              <Link
                to="/"
                className="flex items-center gap-2.5 text-xs font-semibold text-gray-400 hover:text-orange-400 py-2.5 px-3 rounded-xl hover:bg-gray-900 transition"
              >
                <FiShoppingBag className="w-4 h-4 text-orange-400" />
                <span>Customer Storefront →</span>
              </Link>
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
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* ── 4. DESKTOP PERSISTENT SIDEBAR (>= lg) ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#0D0D0D] border-r border-gray-800 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-800/80">
          <BrandLogo size="md" />
          <div className="mt-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Admin Control Center
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.end}
              className={navClass}
            >
              <item.icon className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-800/80 px-2">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-xs font-semibold text-gray-400 hover:text-orange-400 py-2.5 px-3 rounded-xl hover:bg-gray-900 transition min-h-[44px]"
            >
              <FiShoppingBag className="w-4 h-4 text-orange-400" />
              <span>Customer Storefront →</span>
            </Link>
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
            <span>Sign Out Admin</span>
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
        title="Sign Out of Admin Control Center?"
        description="You will be signed out of platform administration and returned to the store catalog."
      />

    </div>
  );
}
