import React, { useState, useContext, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiHeart, FiChevronDown, 
  FiBriefcase, FiShield, FiHome, FiGrid, FiArrowRight, FiSmartphone, FiCpu, 
  FiShoppingBag, FiTag, FiMonitor, FiTv, FiSmile, FiPackage, FiZap, FiFeather, FiLayers
} from "react-icons/fi";
import { assets } from "../assets/frontend_assets/assets";
import { ShopContext } from "../context/ShopContext";
import { useAuthStore } from "../store/authStore";
import { useLogout } from "../hooks/useAuth";
import { getCategoryTree, browseProducts } from "../api/consumer.api";

// Modern vector icon for Home & Living (interior / furniture) so shoppers never confuse it with Website Homepage
const HomeLivingIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
    <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5z" />
    <path d="M4 18v2" />
    <path d="M20 18v2" />
    <path d="M8 11v4" />
    <path d="M16 11v4" />
  </svg>
);

// Department icon resolver using crisp vector SVG icons (industry standard)
const getDepartmentIcon = (slug?: string): React.ComponentType<{ className?: string }> => {
  const s = (slug || '').toLowerCase();
  if (s.includes('electron') || s.includes('gadget')) return FiCpu;
  if (s.includes('laptop') || s.includes('computer')) return FiMonitor;
  if (s.includes('phone') || s.includes('mobile')) return FiSmartphone;
  if (s.includes('home') || s.includes('living') || s.includes('furnitur') || s.includes('decor')) return HomeLivingIcon;
  if (s.includes('women')) return FiShoppingBag;
  if (s.includes('men')) return FiUser;
  if (s.includes('kid') || s.includes('baby') || s.includes('toy')) return FiSmile;
  if (s.includes('beauty') || s.includes('cosmetic')) return FiFeather;
  if (s.includes('appliance')) return FiTv;
  if (s.includes('grocer') || s.includes('food') || s.includes('fresh')) return FiPackage;
  if (s.includes('fashion') || s.includes('apparel') || s.includes('cloth')) return FiTag;
  return FiLayers;
};

// Automatically disambiguate "Home" into "Home & Living" so consumers clearly know it's the furniture & decor department
const getDepartmentDisplayName = (name: string): string => {
  if (name.trim().toLowerCase() === 'home') return 'Home & Living';
  return name;
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentCategory = queryParams.get('category');

  const { getCartCount, currency } = useContext(ShopContext) as any;
  const displayCurrency = currency || 'NPR ';
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const role = user?.roleName || user?.role || 'CONSUMER';
  const cartCount = typeof getCartCount === 'function' ? getCartCount() : 0;

  // Fetch full category hierarchy once
  useEffect(() => {
    getCategoryTree().then((res: any) => {
      setCategories(res.data || []);
    }).catch(() => {});
  }, []);

  // Debounced search autocomplete
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setMatchingCategories([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await browseProducts({ search: searchQuery.trim(), limit: 5 });
        setSuggestions(res.data?.products || []);

        const q = searchQuery.trim().toLowerCase();
        const matched: any[] = [];
        categories.forEach((cat: any) => {
          if (cat.name.toLowerCase().includes(q)) {
            matched.push({ name: cat.name, slug: cat.slug, isParent: true });
          }
          if (cat.children) {
            cat.children.forEach((sub: any) => {
              if (sub.name.toLowerCase().includes(q)) {
                matched.push({ name: sub.name, slug: sub.slug, parentName: cat.name, isParent: false });
              }
            });
          }
        });
        setMatchingCategories(matched.slice(0, 3));
        setShowSuggestions(true);
      } catch {
        // Non-fatal fallback
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, categories]);

  // Outside click listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        // keep open if user is typing
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
    setCategoryOpen(false);
    setShowSuggestions(false);
    setActiveMegaMenu(null);
    setMobileSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      closeAll();
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    closeAll();
  };

  const handleCategoryClick = (catSlug: string) => {
    navigate(`/collection?category=${catSlug}`);
    closeAll();
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setProfileOpen(!profileOpen);
    }
  };

  // Top departments for the sub-navigation strip
  const topDepartments = categories.slice(0, 6);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#0D0D0D] border-b border-gray-800 font-poppins shadow-lg">
      
      {/* ── 1. PRIMARY NAVBAR ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">

        {/* LEFT: BRAND LOGO */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" onClick={closeAll} className="flex items-center gap-2 group focus:outline-none">
            <img src={assets.logo} alt="AkMart" className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" />
            <span className="hidden xl:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-md">
              Nepal Hub
            </span>
          </Link>
        </div>

        {/* CENTER: FLIPKART/AMAZON PROMINENT SEARCH BAR (DESKTOP) */}
        <div className="hidden sm:flex flex-1 max-w-2xl relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="w-full flex items-center relative">
            <div className="w-full flex items-center bg-[#181818] border border-gray-700/80 hover:border-gray-600 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-xl transition-all duration-200 overflow-hidden shadow-inner">
              <span className="pl-3.5 pr-2 text-gray-400">
                <FiSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim().length >= 2) setShowSuggestions(true); }}
                placeholder="Search for products, brands, categories..."
                className="w-full bg-transparent py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                  className="px-2 text-gray-400 hover:text-white"
                  title="Clear search"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs sm:text-sm px-4 py-2.5 transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* LIVE AUTOCOMPLETE DROPDOWN */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn text-sm">
              
              {/* Category Matches */}
              {matchingCategories.length > 0 && (
                <div className="p-3 border-b border-gray-800/80 bg-[#161616]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-2 block mb-1.5">
                    Suggested Categories
                  </span>
                  <div className="flex flex-wrap gap-2 px-2">
                    {matchingCategories.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCategoryClick(c.slug)}
                        className="inline-flex items-center gap-1.5 text-xs bg-[#202020] hover:bg-orange-500/10 hover:text-orange-400 border border-gray-700/60 rounded-lg px-2.5 py-1 text-gray-300 transition-colors"
                      >
                        <FiTag className="w-3 h-3 text-orange-400" />
                        <span>{c.name}</span>
                        {c.parentName && <span className="text-gray-500 text-[10px]">in {c.parentName}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              <div className="py-2 max-h-80 overflow-y-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-4 py-1 block">
                  Products ({suggestions.length})
                </span>

                {isSearching ? (
                  <div className="px-5 py-4 text-xs text-gray-400 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Searching live catalog...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-5 py-4 text-xs text-gray-400">
                    No products found matching "{searchQuery}". Press Enter to see full results.
                  </div>
                ) : (
                  suggestions.map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.slug)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-[#1E1E1E] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={p.primaryImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop"}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-gray-900 border border-gray-800 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white group-hover:text-orange-400 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-gray-400 capitalize">
                            {p.category?.name || "Marketplace"} {p.brand ? `• ${p.brand.name}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-3">
                        <p className="text-xs font-bold text-orange-400">
                          {p.cheapestPrice ? `NPR ${Number(p.cheapestPrice).toLocaleString()}` : "Browse"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* View all footer */}
              <div 
                onClick={handleSearchSubmit}
                className="p-3 text-center bg-[#1A1A1A] hover:bg-orange-500/10 hover:text-orange-400 text-xs font-semibold text-gray-300 cursor-pointer border-t border-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <span>View all results for "{searchQuery}"</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: NAVIGATION ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">

          {/* Become a Seller / Merchant / Admin Center Buttons */}
          {role === 'SELLER' ? (
            <Link 
              to="/seller/dashboard" 
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-semibold transition-all"
            >
              <FiBriefcase className="w-3.5 h-3.5" />
              <span>Merchant Center</span>
            </Link>
          ) : role === 'ADMIN' ? (
            <Link 
              to="/admin/dashboard" 
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all"
            >
              <FiShield className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </Link>
          ) : (
            <Link 
              to={isAuthenticated ? "/seller/dashboard" : "/register"}
              className="hidden lg:flex items-center gap-1 px-3 py-1.5 text-xs text-gray-300 hover:text-orange-400 transition-colors font-medium border border-gray-800 hover:border-gray-700 rounded-xl"
            >
              <span>Become a Seller</span>
            </Link>
          )}

          {/* Mobile search trigger */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden p-2 text-gray-300 hover:text-orange-500 rounded-xl hover:bg-[#1A1A1A] transition-colors"
            aria-label="Search"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          {/* Wishlist (Consumers & Guests only) */}
          {(!isAuthenticated || role === 'CONSUMER') && (
            <NavLink 
              to="/wishlist" 
              aria-label="Wishlist"
              className={({ isActive }) => `p-2 text-gray-300 hover:text-orange-500 rounded-xl hover:bg-[#1A1A1A] transition-colors relative ${isActive ? 'text-orange-500' : ''}`}
            >
              <FiHeart className="w-5 h-5" />
            </NavLink>
          )}

          {/* Cart with count badge (Consumers & Guests only) */}
          {(!isAuthenticated || role === 'CONSUMER') && (
            <NavLink 
              to="/cart" 
              aria-label="Cart"
              className={({ isActive }) => `p-2 text-gray-300 hover:text-orange-500 rounded-xl hover:bg-[#1A1A1A] transition-colors relative ${isActive ? 'text-orange-500' : ''}`}
            >
              <FiShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#0D0D0D]">
                  {cartCount}
                </span>
              )}
            </NavLink>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            {isAuthenticated ? (
              <button 
                onClick={handleProfileClick}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl hover:bg-[#1A1A1A] border border-transparent hover:border-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-white max-w-[100px] truncate">
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">
                    {role}
                  </span>
                </div>
                <FiChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <Link 
                to="/login"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20"
              >
                Sign In
              </Link>
            )}

            {/* Profile Dropdown Menu */}
            {isAuthenticated && profileOpen && (
              <div className="absolute right-0 top-12 bg-[#121212] border border-gray-800 rounded-2xl w-64 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2 text-sm z-50 animate-fadeIn">
                <div className="px-5 py-3 border-b border-gray-800 text-gray-400">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">Signed in as</p>
                  <p className="font-bold text-white text-sm truncate mt-0.5">
                    {user?.fullName || user?.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-bold rounded uppercase tracking-wider border border-orange-500/20">
                    {role}
                  </span>
                </div>

                <div className="py-1">
                  <NavLink to="/profile" className="flex items-center gap-3 px-5 py-2.5 text-xs text-gray-300 hover:bg-[#1E1E1E] hover:text-orange-400 transition-colors font-medium" onClick={closeAll}>
                    <FiUser className="w-4 h-4" /> My Profile
                  </NavLink>
                  {role === 'CONSUMER' && (
                    <NavLink to="/orders" className="flex items-center gap-3 px-5 py-2.5 text-xs text-gray-300 hover:bg-[#1E1E1E] hover:text-orange-400 transition-colors font-medium" onClick={closeAll}>
                      <FiShoppingBag className="w-4 h-4" /> My Orders & Tracking
                    </NavLink>
                  )}
                  {role === 'SELLER' && (
                    <NavLink to="/seller/dashboard" className="flex items-center gap-3 px-5 py-2.5 text-xs text-gray-300 hover:bg-[#1E1E1E] hover:text-orange-400 transition-colors font-medium" onClick={closeAll}>
                      <FiBriefcase className="w-4 h-4" /> Seller Dashboard
                    </NavLink>
                  )}
                  {role === 'ADMIN' && (
                    <NavLink to="/admin/dashboard" className="flex items-center gap-3 px-5 py-2.5 text-xs text-gray-300 hover:bg-[#1E1E1E] hover:text-orange-400 transition-colors font-medium" onClick={closeAll}>
                      <FiShield className="w-4 h-4" /> Admin Dashboard
                    </NavLink>
                  )}
                </div>

                <div className="pt-1 border-t border-gray-800">
                  <button 
                    onClick={() => { closeAll(); logout(); }}
                    disabled={isLoggingOut}
                    className="w-full text-left px-5 py-2.5 hover:bg-red-500/10 transition-colors text-red-400 font-semibold text-xs flex items-center justify-between"
                  >
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger toggle */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            aria-label="Toggle menu"
            className="md:hidden p-2 text-gray-300 hover:text-orange-500 rounded-xl hover:bg-[#1A1A1A] transition-colors"
          >
            {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ── MOBILE EXPANDED SEARCH BAR ──────────────────────────────── */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 bg-[#0D0D0D] border-b border-gray-800 animate-fadeIn" ref={mobileSearchRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#1A1A1A] border border-gray-700 rounded-xl overflow-hidden px-3 py-1.5">
            <FiSearch className="text-gray-400 w-4 h-4 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 mr-2">
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
            <button type="submit" className="text-orange-400 text-xs font-semibold shrink-0">
              Go
            </button>
          </form>

          {/* Live Mobile Autocomplete Suggestions */}
          {showSuggestions && (
            <div className="mt-2 bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden text-sm max-h-72 overflow-y-auto">
              {matchingCategories.length > 0 && (
                <div className="p-2.5 border-b border-gray-800/80 bg-[#161616]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 block mb-1">
                    Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {matchingCategories.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCategoryClick(c.slug)}
                        className="inline-flex items-center gap-1.5 text-xs bg-[#202020] hover:bg-orange-500/10 hover:text-orange-400 border border-gray-700/60 rounded-lg px-2.5 py-1 text-gray-300"
                      >
                        <FiTag className="w-3 h-3 text-orange-400" />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="py-1">
                {isSearching ? (
                  <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-400">
                    No products found. Press Go to search all.
                  </div>
                ) : (
                  suggestions.map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.slug)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-[#1E1E1E] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={p.primaryImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200&auto=format&fit=crop"}
                          alt={p.name}
                          className="w-9 h-9 object-cover rounded-lg bg-gray-900 border border-gray-800 shrink-0"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{displayCurrency}{Number(p.cheapestPrice || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <FiArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 2. FLIPKART-STYLE CATEGORY SUB-NAV STRIP (DESKTOP) ────────── */}
      <div className="hidden md:block bg-[#111111]/95 backdrop-blur-md border-t border-gray-800/60 border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-2 text-xs font-medium text-gray-300">
          
          <div className="flex items-center gap-1.5 lg:gap-2">
            <Link 
              to="/collection"
              onClick={() => setActiveMegaMenu(null)}
              className={`px-3 py-1.5 rounded-lg border transition-colors duration-150 flex items-center gap-2 font-medium ${
                !currentCategory && location.pathname === '/collection' 
                  ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' 
                  : 'text-gray-300 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <FiGrid className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>All Products</span>
            </Link>

            {topDepartments.map((dept: any) => {
              const IconComp = getDepartmentIcon(dept.slug);
              const hasSub = dept.children && dept.children.length > 0;
              const isActive = currentCategory === dept.slug || dept.children?.some((c: any) => c.slug === currentCategory);

              return (
                <div 
                  key={dept.id} 
                  className="relative group"
                  onMouseEnter={() => hasSub && setActiveMegaMenu(dept.id)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <Link
                    to={`/collection?category=${dept.slug}`}
                    onClick={() => setActiveMegaMenu(null)}
                    className={`px-3 py-1.5 rounded-lg border transition-colors duration-150 flex items-center gap-2 font-medium ${
                      isActive 
                        ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' 
                        : 'text-gray-300 border-transparent hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComp className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-orange-400' : 'text-gray-400 group-hover:text-orange-400'}`} />
                    <span className="tracking-wide">{getDepartmentDisplayName(dept.name)}</span>
                    {hasSub && (
                      <FiChevronDown className="w-3 h-3 text-gray-500 group-hover:text-orange-400 transition-transform duration-200 group-hover:rotate-180 shrink-0" />
                    )}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {hasSub && activeMegaMenu === dept.id && (
                    <div className="absolute left-0 top-full pt-1.5 z-50 animate-fadeIn">
                      <div className="bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl p-4 w-64 backdrop-blur-md">
                        <div className="pb-2.5 mb-2.5 border-b border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500 flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <IconComp className="w-3.5 h-3.5 text-orange-400" />
                            {getDepartmentDisplayName(dept.name)}
                          </span>
                          <Link to={`/collection?category=${dept.slug}`} className="text-orange-400 hover:underline">
                            View All →
                          </Link>
                        </div>
                        <div className="space-y-1">
                          {dept.children.map((sub: any) => (
                            <Link
                              key={sub.id}
                              to={`/collection?category=${sub.slug}`}
                              className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all ${
                                currentCategory === sub.slug 
                                  ? 'text-orange-400 bg-orange-500/10 font-semibold border border-orange-500/20' 
                                  : 'text-gray-300 hover:bg-[#1E1E1E] hover:text-white'
                              }`}
                              onClick={closeAll}
                            >
                              <span>{sub.name}</span>
                              <FiArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 shrink-0 pl-4 border-l border-gray-800">
            <Link 
              to="/collection?sort=price-low" 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-[11px] font-semibold tracking-wide transition-all shadow-sm group"
            >
              <FiZap className="w-3.5 h-3.5 text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Lowest Price Guarantee</span>
            </Link>
          </div>

        </div>
      </div>

      {/* ── 3. MOBILE SLIDE DRAWER MENU ──────────────────────────────── */}
      <div className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-xs bg-[#0D0D0D] border-l border-gray-800 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <span className="font-bold text-xs tracking-wider uppercase text-gray-400">Navigation</span>
              <button onClick={closeAll} aria-label="Close menu" className="text-gray-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <ul className="flex flex-col gap-2 pt-4 text-sm font-medium">
              <li>
                <NavLink to="/" className="block py-2 text-gray-300 hover:text-orange-500" onClick={closeAll}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/collection" className="block py-2 text-orange-400 font-semibold" onClick={closeAll}>
                  All Collections
                </NavLink>
              </li>

              <li className="pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Categories
              </li>
              {categories.map((c: any) => (
                <li key={c.id}>
                  <NavLink 
                    to={`/collection?category=${c.slug}`} 
                    className="block py-1.5 text-xs text-gray-400 hover:text-white" 
                    onClick={closeAll}
                  >
                    {c.name}
                  </NavLink>
                </li>
              ))}

              <li className="pt-3 border-t border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Account
              </li>
              {role === 'CONSUMER' && (
                <>
                  <li><NavLink to="/wishlist" className="block py-1 text-xs text-gray-300" onClick={closeAll}>Wishlist</NavLink></li>
                  <li><NavLink to="/orders" className="block py-1 text-xs text-gray-300" onClick={closeAll}>Orders & History</NavLink></li>
                  <li><NavLink to="/profile" className="block py-1 text-xs text-gray-300" onClick={closeAll}>My Profile</NavLink></li>
                </>
              )}
              {role === 'SELLER' && <li><NavLink to="/seller/dashboard" className="block py-1 text-xs text-orange-400" onClick={closeAll}>Seller Dashboard</NavLink></li>}
              {role === 'ADMIN' && <li><NavLink to="/admin/dashboard" className="block py-1 text-xs text-purple-400" onClick={closeAll}>Admin Dashboard</NavLink></li>}
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-800">
            {isAuthenticated ? (
              <button 
                onClick={() => { closeAll(); logout(); }}
                disabled={isLoggingOut}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            ) : (
              <NavLink 
                to="/login" 
                onClick={closeAll}
                className="block text-center bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                Login / Register
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. MOBILE BOTTOM NAVIGATION BAR (FLIPKART/AMAZON APP STYLE) ─ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-md border-t border-gray-800/90 md:hidden flex justify-around items-center pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] px-2 shadow-2xl">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => `flex flex-col items-center justify-center min-w-[48px] py-1 gap-0.5 text-[10px] font-medium transition-colors ${isActive ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <FiHome className="w-4 h-4" />
          <span>Home</span>
        </NavLink>

        <NavLink 
          to="/collection" 
          className={({ isActive }) => `flex flex-col items-center justify-center min-w-[48px] py-1 gap-0.5 text-[10px] font-medium transition-colors ${isActive ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <FiGrid className="w-4 h-4" />
          <span>Explore</span>
        </NavLink>

        {(!isAuthenticated || role === 'CONSUMER') && (
          <NavLink 
            to="/wishlist" 
            className={({ isActive }) => `flex flex-col items-center justify-center min-w-[48px] py-1 gap-0.5 text-[10px] font-medium transition-colors relative ${isActive ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
          >
            <FiHeart className="w-4 h-4" />
            <span>Wishlist</span>
          </NavLink>
        )}

        {(!isAuthenticated || role === 'CONSUMER') && (
          <NavLink 
            to="/cart" 
            className={({ isActive }) => `flex flex-col items-center justify-center min-w-[48px] py-1 gap-0.5 text-[10px] font-medium transition-colors relative ${isActive ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
          >
            <div className="relative">
              <FiShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </NavLink>
        )}

        <NavLink 
          to={isAuthenticated ? "/profile" : "/login"} 
          className={({ isActive }) => `flex flex-col items-center justify-center min-w-[48px] py-1 gap-0.5 text-[10px] font-medium transition-colors ${isActive ? 'text-orange-500 font-bold' : 'text-gray-400'}`}
        >
          <FiUser className="w-4 h-4" />
          <span>{isAuthenticated ? 'Account' : 'Login'}</span>
        </NavLink>
      </div>

    </header>
  );
}
