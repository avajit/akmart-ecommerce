import React, { useState, useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart, FiUser, FiSearch, FiHeart } from "react-icons/fi";
import { assets } from "../assets/frontend_assets/assets";
import { ShopContext } from "../context/ShopContext";
import { useAuthStore } from "../store/authStore";
import { useLogout } from "../hooks/useAuth";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { setShowSearch } = useContext(ShopContext);
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const role = user?.roleName || user?.role || 'CONSUMER';

  const navItemStyle = ({ isActive }) =>
    isActive
      ? "text-emerald-500"
      : "text-white hover:text-emerald-500 transition";

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <nav className="w-full bg-[#0D0D0D] text-white shadow-lg fixed top-0 left-0 z-50 border-b border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] h-16">

        {/* LOGO */}
        <Link to="/" className="flex items-center shrink-0" onClick={closeAll}>
          <img src={assets.logo} alt="Logo" className="h-10 sm:h-12 w-auto object-contain filter invert" />
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex items-center gap-10 text-lg font-medium tracking-wide">
          <li><NavLink to="/" className={navItemStyle} onClick={closeAll}>Home</NavLink></li>
          <li><NavLink to="/collection" className={navItemStyle} onClick={closeAll}>Collection</NavLink></li>
          {role === 'ADMIN' && <li><NavLink to="/admin/dashboard" className={navItemStyle} onClick={closeAll}>Admin Dashboard</NavLink></li>}
          {role === 'SELLER' && <li><NavLink to="/seller/dashboard" className={navItemStyle} onClick={closeAll}>Seller Dashboard</NavLink></li>}
        </ul>

        {/* DESKTOP ICONS */}
        <div className="hidden md:flex items-center gap-6 text-2xl relative">
          
          <button className="hover:text-emerald-500 transition-colors" onClick={() => setShowSearch(true)}>
            <FiSearch />
          </button>
          
          {role === 'CONSUMER' && (
            <NavLink to="/wishlist" className="hover:text-emerald-500 transition-colors">
              <FiHeart />
            </NavLink>
          )}

          {role === 'CONSUMER' && (
            <NavLink to="/cart" className="hover:text-emerald-500 transition-colors relative">
              <FiShoppingCart />
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => { setMenuOpen(false); setProfileOpen(!profileOpen); }} className="hover:text-emerald-500 transition-colors mt-1">
                  <FiUser />
              </button>

              {profileOpen && (
                  <div className="absolute right-0 top-12 bg-[#1A1A1A] border border-gray-700 rounded-lg w-48 shadow-xl py-2 text-sm z-50">
                      {role === 'CONSUMER' && (
                        <>
                          <NavLink to="/profile" className="block px-4 py-3 hover:bg-[#252525] hover:text-emerald-500" onClick={closeAll}>My Profile</NavLink>
                          <NavLink to="/orders" className="block px-4 py-3 hover:bg-[#252525] hover:text-emerald-500" onClick={closeAll}>Orders</NavLink>
                        </>
                      )}
                      {role === 'SELLER' && (
                        <NavLink to="/seller/dashboard" className="block px-4 py-3 hover:bg-[#252525] hover:text-emerald-500" onClick={closeAll}>Seller Dashboard</NavLink>
                      )}
                      {role === 'ADMIN' && (
                        <NavLink to="/admin/dashboard" className="block px-4 py-3 hover:bg-[#252525] hover:text-emerald-500" onClick={closeAll}>Admin Dashboard</NavLink>
                      )}
                      <button 
                          onClick={() => { closeAll(); logout(); }}
                          disabled={isLoggingOut}
                          className="block w-full text-left px-4 py-3 hover:bg-[#252525] hover:text-emerald-500 transition-colors border-t border-gray-700 text-red-500"
                      >
                          {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                  </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="text-sm font-bold bg-emerald-500 text-black px-4 py-2 rounded-full hover:bg-emerald-400 transition-colors">
              Login
            </NavLink>
          )}
        </div>

        {/* MOBILE ICONS & HAMBURGER */}
        <div className="flex md:hidden items-center gap-4 text-xl relative">
          {isAuthenticated ? (
            <button onClick={() => { setProfileOpen(false); setMenuOpen(!menuOpen); }} className="text-2xl text-emerald-500 ml-2">
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          ) : (
             <NavLink to="/login" className="text-sm font-bold bg-emerald-500 text-black px-4 py-2 rounded-full hover:bg-emerald-400 transition-colors">Login</NavLink>
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <div className={`md:hidden bg-[#0D0D0D] overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-[500px] border-b border-gray-800" : "max-h-0"}`}>
        <ul className="flex flex-col gap-1 px-6 py-6 text-lg">
          <NavLink to="/" className="py-3 border-b border-gray-800" onClick={closeAll}>Home</NavLink>
          <NavLink to="/collection" className="py-3 border-b border-gray-800" onClick={closeAll}>Collection</NavLink>
          {role === 'ADMIN' && <NavLink to="/admin/dashboard" className="py-3 border-b border-gray-800" onClick={closeAll}>Admin Dashboard</NavLink>}
          {role === 'SELLER' && <NavLink to="/seller/dashboard" className="py-3 border-b border-gray-800" onClick={closeAll}>Seller Dashboard</NavLink>}
          {isAuthenticated && (
            <button onClick={() => { closeAll(); logout(); }} className="py-3 text-left text-red-500">Logout</button>
          )}
        </ul>
      </div>

    </nav>
  );
}

export default Navbar;