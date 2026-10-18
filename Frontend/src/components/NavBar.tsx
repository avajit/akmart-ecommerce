import React, { useState, useContext, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiHeart } from "react-icons/fi";
import { assets } from "../assets/frontend_assets/assets";
import { ShopContext } from "../context/ShopContext";
import { useAuthStore } from "../store/authStore";
import { useLogout } from "../hooks/useAuth";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { setShowSearch, getCartCount } = useContext(ShopContext) as any;
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const role = user?.roleName || user?.role || 'CONSUMER';
  const cartCount = typeof getCartCount === 'function' ? getCartCount() : 0;

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setProfileOpen(!profileOpen);
    }
  };

  return (
    <nav className="w-full bg-[#0D0D0D]/90 backdrop-blur-md text-white sticky top-0 left-0 z-50 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] h-16">

        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center shrink-0 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded" onClick={closeAll}>
          <img src={assets.logo} alt="AkMart" className="h-8 sm:h-10 w-auto object-contain" />
        </Link>

        {/* CENTER: CATEGORY LINKS */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
          <li>
            <NavLink 
              to="/collection?category=men" 
              className={({ isActive }) => `relative py-1 transition-colors hover:text-orange-500 ${isActive ? 'text-orange-500 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500' : 'text-gray-300'}`}
            >
              Men
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/collection?category=women" 
              className={({ isActive }) => `relative py-1 transition-colors hover:text-orange-500 ${isActive ? 'text-orange-500 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500' : 'text-gray-300'}`}
            >
              Women
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/collection?category=kids" 
              className={({ isActive }) => `relative py-1 transition-colors hover:text-orange-500 ${isActive ? 'text-orange-500 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500' : 'text-gray-300'}`}
            >
              Kids
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/collection?category=home" 
              className={({ isActive }) => `relative py-1 transition-colors hover:text-orange-500 ${isActive ? 'text-orange-500 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500' : 'text-gray-300'}`}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/collection?category=beauty" 
              className={({ isActive }) => `relative py-1 transition-colors hover:text-orange-500 ${isActive ? 'text-orange-500 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-orange-500' : 'text-gray-300'}`}
            >
              Beauty
            </NavLink>
          </li>
        </ul>

        {/* RIGHT: DESKTOP SEARCH, WISHLIST, CART, PROFILE */}
        <div className="hidden md:flex items-center gap-5 text-lg relative">
          
          {/* Desktop Search Pill */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-[#1A1A1A] border border-gray-800 rounded-full px-3.5 py-1.5 focus-within:border-orange-500 transition-colors">
            <FiSearch className="text-gray-400 w-4 h-4 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search essentials, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-44 lg:w-56"
            />
          </form>

          {/* Wishlist */}
          <NavLink 
            to="/wishlist" 
            aria-label="Wishlist"
            className="text-gray-300 hover:text-orange-500 transition-colors relative p-1 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded"
          >
            <FiHeart className="w-5 h-5" />
          </NavLink>

          {/* Cart */}
          <NavLink 
            to="/cart" 
            aria-label="Cart"
            className="text-gray-300 hover:text-orange-500 transition-colors relative p-1 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded"
          >
            <FiShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* Profile / Auth */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={handleProfileClick} 
              aria-label="User profile menu"
              className="text-gray-300 hover:text-orange-500 transition-colors p-1 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded flex items-center gap-1"
            >
              <FiUser className="w-5 h-5" />
            </button>

            {isAuthenticated && profileOpen && (
              <div className="absolute right-0 top-11 bg-[#141414] border border-gray-800 rounded-xl w-52 shadow-2xl py-2 text-xs z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-800 text-gray-400 truncate">
                  Signed in as <br />
                  <span className="font-semibold text-white">{user?.fullName || user?.email || 'User'}</span>
                </div>
                {role === 'CONSUMER' && (
                  <>
                    <NavLink to="/profile" className="block px-4 py-2.5 hover:bg-[#222222] hover:text-orange-500 transition-colors" onClick={closeAll}>My Profile</NavLink>
                    <NavLink to="/orders" className="block px-4 py-2.5 hover:bg-[#222222] hover:text-orange-500 transition-colors" onClick={closeAll}>Orders</NavLink>
                  </>
                )}
                {role === 'SELLER' && (
                  <NavLink to="/seller/dashboard" className="block px-4 py-2.5 hover:bg-[#222222] hover:text-orange-500 transition-colors" onClick={closeAll}>Seller Dashboard</NavLink>
                )}
                {role === 'ADMIN' && (
                  <NavLink to="/admin/dashboard" className="block px-4 py-2.5 hover:bg-[#222222] hover:text-orange-500 transition-colors" onClick={closeAll}>Admin Dashboard</NavLink>
                )}
                <button 
                  onClick={() => { closeAll(); logout(); }}
                  disabled={isLoggingOut}
                  className="block w-full text-left px-4 py-2.5 hover:bg-[#222222] transition-colors border-t border-gray-800 text-red-400 font-medium"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE: SEARCH ICON & HAMBURGER */}
        <div className="flex md:hidden items-center gap-3 text-xl">
          <button 
            onClick={() => setShowSearch(true)} 
            aria-label="Search"
            className="text-gray-300 hover:text-orange-500 p-1"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          <NavLink 
            to="/cart" 
            aria-label="Cart"
            className="text-gray-300 hover:text-orange-500 relative p-1"
          >
            <FiShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </NavLink>

          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            aria-label="Toggle menu"
            className="text-gray-300 hover:text-orange-500 p-1 ml-1"
          >
            {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE SIDE DRAWER MENU */}
      <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-xs bg-[#0D0D0D] border-l border-gray-800 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-gray-800">
              <span className="font-bold text-sm tracking-wider uppercase text-gray-400">Menu</span>
              <button onClick={closeAll} aria-label="Close menu" className="text-gray-400 hover:text-white p-1">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <ul className="flex flex-col gap-4 pt-6 text-base font-medium">
              <li><NavLink to="/collection?category=men" className="block py-1 hover:text-orange-500" onClick={closeAll}>Men</NavLink></li>
              <li><NavLink to="/collection?category=women" className="block py-1 hover:text-orange-500" onClick={closeAll}>Women</NavLink></li>
              <li><NavLink to="/collection?category=kids" className="block py-1 hover:text-orange-500" onClick={closeAll}>Kids</NavLink></li>
              <li><NavLink to="/collection?category=home" className="block py-1 hover:text-orange-500" onClick={closeAll}>Home</NavLink></li>
              <li><NavLink to="/collection?category=beauty" className="block py-1 hover:text-orange-500" onClick={closeAll}>Beauty</NavLink></li>
              <li className="pt-4 border-t border-gray-800"><NavLink to="/collection" className="block py-1 text-orange-500" onClick={closeAll}>All Collections</NavLink></li>
              {role === 'CONSUMER' && (
                <>
                  <li><NavLink to="/wishlist" className="block py-1 hover:text-orange-500" onClick={closeAll}>Wishlist</NavLink></li>
                  <li><NavLink to="/profile" className="block py-1 hover:text-orange-500" onClick={closeAll}>My Profile</NavLink></li>
                  <li><NavLink to="/orders" className="block py-1 hover:text-orange-500" onClick={closeAll}>Orders</NavLink></li>
                </>
              )}
              {role === 'SELLER' && <li><NavLink to="/seller/dashboard" className="block py-1 hover:text-orange-500" onClick={closeAll}>Seller Dashboard</NavLink></li>}
              {role === 'ADMIN' && <li><NavLink to="/admin/dashboard" className="block py-1 hover:text-orange-500" onClick={closeAll}>Admin Dashboard</NavLink></li>}
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-800">
            {isAuthenticated ? (
              <button 
                onClick={() => { closeAll(); logout(); }}
                disabled={isLoggingOut}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            ) : (
              <NavLink 
                to="/login" 
                onClick={closeAll}
                className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                Login / Sign Up
              </NavLink>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
}

export default Navbar;
