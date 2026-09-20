import React, { useState, useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch } from "react-icons/fi";
import { assets } from "../assets/frontend_assets/assets"; // Ensure this matches your folder path
import { ShopContext } from "../context/ShopContext";
import { useAuthStore } from "../store/authStore";
import { useLogout } from "../hooks/useAuth";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // 1. Get Global State
  const { setShowSearch, getCartCount } = useContext(ShopContext);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const navItemStyle = ({ isActive }) =>
    isActive
      ? "text-amber-500" // Active Link Color (Gold)
      : "text-white hover:text-amber-500 transition";

  const handleProfileClick = () => {
    setMenuOpen(false);
    setProfileOpen((prev) => !prev);
  };

  const handleMenuClick = () => {
    setProfileOpen(false);
    setMenuOpen((prev) => !prev);
  };

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <nav className="w-full bg-[#0D0D0D] text-white shadow-lg fixed top-0 left-0 z-50 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] h-16">

        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center shrink-0" onClick={closeAll}>
          <img
            src={assets.logo}
            alt="AkMart Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* --- DESKTOP MENU (Hidden on Mobile) --- */}
        <ul className="hidden md:flex items-center gap-10 text-lg font-medium tracking-wide">
          <li><NavLink to="/" className={navItemStyle} onClick={closeAll}>Home</NavLink></li>
          <li><NavLink to="/collection" className={navItemStyle} onClick={closeAll}>Collection</NavLink></li>
          <li><NavLink to="/about" className={navItemStyle} onClick={closeAll}>About</NavLink></li>
          <li><NavLink to="/contact" className={navItemStyle} onClick={closeAll}>Contact</NavLink></li>
        </ul>

        {/* --- DESKTOP ICONS --- */}
        <div className="hidden md:flex items-center gap-6 text-2xl relative">
          
          {/* Search Icon */}
          <button className="hover:text-amber-500 transition-colors" onClick={() => setShowSearch(true)}>
            <FiSearch />
          </button>

          {/* Cart Icon with Badge */}
          <NavLink to="/cart" className="hover:text-amber-500 transition-colors relative">
            <FiShoppingCart />
            <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
               {getCartCount()}
            </span>
          </NavLink>

          {/* Profile Dropdown or Login Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={handleProfileClick} className="hover:text-amber-500 transition-colors mt-1">
                  <FiUser />
              </button>

              {profileOpen && (
                  <div className="absolute right-0 top-12 bg-[#1A1A1A] border border-gray-700 rounded-lg w-48 shadow-xl py-2 text-sm z-50">
                      <NavLink to="/profile" className="block px-4 py-3 hover:bg-[#252525] hover:text-amber-500 transition-colors" onClick={closeAll}>
                          My Profile
                      </NavLink>
                      <NavLink to="/orders" className="block px-4 py-3 hover:bg-[#252525] hover:text-amber-500 transition-colors" onClick={closeAll}>
                          Orders
                      </NavLink>
                      <button 
                          onClick={() => { closeAll(); logout(); }}
                          disabled={isLoggingOut}
                          className="block w-full text-left px-4 py-3 hover:bg-[#252525] hover:text-amber-500 transition-colors border-t border-gray-700 disabled:opacity-50"
                      >
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                  </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="text-sm font-bold bg-amber-500 text-black px-4 py-2 rounded-full hover:bg-amber-400 transition-colors">
              Login
            </NavLink>
          )}
        </div>

        {/* --- MOBILE ICONS & HAMBURGER --- */}
        <div className="flex md:hidden items-center gap-4 text-xl relative">
          
          {/* Mobile Search */}
          <button onClick={() => setShowSearch(true)} className="hover:text-amber-500">
            <FiSearch />
          </button>

          {/* Mobile Cart */}
          <NavLink to="/cart" className="relative hover:text-amber-500">
            <FiShoppingCart />
            <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {getCartCount()}
            </span>
          </NavLink>

          {/* Mobile Profile or Login */}
          {isAuthenticated ? (
            <>
              <button onClick={handleProfileClick} className="hover:text-amber-500">
                <FiUser />
              </button>
              {profileOpen && (
                  <div className="absolute right-4 top-16 bg-[#1A1A1A] border border-gray-700 rounded-lg w-40 shadow-xl py-2 text-sm z-50">
                      <NavLink to="/profile" className="block px-4 py-2 hover:bg-[#252525]" onClick={closeAll}>My Profile</NavLink>
                      <NavLink to="/orders" className="block px-4 py-2 hover:bg-[#252525]" onClick={closeAll}>Orders</NavLink>
                      <button 
                          onClick={() => { closeAll(); logout(); }}
                          disabled={isLoggingOut}
                          className="block w-full text-left px-4 py-2 hover:bg-[#252525] border-t border-gray-700 disabled:opacity-50"
                      >
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                  </div>
              )}
            </>
          ) : (
            <NavLink to="/login" className="text-sm font-bold bg-amber-500 text-black px-3 py-1.5 rounded-full hover:bg-amber-400 transition-colors">
              Login
            </NavLink>
          )}

          {/* Mobile Menu Toggle */}
          <button className="text-2xl text-amber-500 ml-2" onClick={handleMenuClick}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      <div className={`md:hidden bg-[#0D0D0D] overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-[500px] border-b border-gray-800" : "max-h-0"}`}>
        <ul className="flex flex-col gap-1 px-6 py-6 text-lg">
          <NavLink to="/" className="py-3 border-b border-gray-800" onClick={closeAll}>Home</NavLink>
          <NavLink to="/collection" className="py-3 border-b border-gray-800" onClick={closeAll}>Collection</NavLink>
          <NavLink to="/about" className="py-3 border-b border-gray-800" onClick={closeAll}>About</NavLink>
          <NavLink to="/contact" className="py-3" onClick={closeAll}>Contact</NavLink>
        </ul>
      </div>

    </nav>
  );
}

export default Navbar;