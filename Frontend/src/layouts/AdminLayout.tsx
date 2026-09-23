import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { FiHome, FiBox, FiUsers, FiGrid, FiTag, FiLogOut } from 'react-icons/fi';
import { useLogout } from '../hooks/useAuth';
import { assets } from '../assets/frontend_assets/assets';
import { Link } from 'react-router-dom';

export default function AdminLayout() {
  const { mutate: logout, isPending } = useLogout();

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-6 py-4 text-lg font-medium transition-colors ${
      isActive ? 'bg-gray-800 text-emerald-500 border-r-4 border-emerald-500' : 'text-gray-400 hover:bg-gray-900 hover:text-white'
    }`;

  return (
    <div className="flex h-screen w-full bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-[#0D0D0D] border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <Link to="/">
            <img src={assets.logo} alt="Logo" className="h-10 object-contain filter invert" />
          </Link>
          <div className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Admin Portal</div>
        </div>

        <nav className="flex-1 mt-6">
          <NavLink to="/admin/dashboard" className={navClass}><FiHome /> Dashboard</NavLink>
          <NavLink to="/admin/products" className={navClass}><FiBox /> Products Queue</NavLink>
          <NavLink to="/admin/sellers" className={navClass}><FiUsers /> Manage Sellers</NavLink>
          <NavLink to="/admin/categories" className={navClass}><FiGrid /> Categories</NavLink>
          <NavLink to="/admin/brands" className={navClass}><FiTag /> Brands</NavLink>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => logout()}
            disabled={isPending}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-gray-900 rounded-lg transition-colors"
          >
            <FiLogOut /> {isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
