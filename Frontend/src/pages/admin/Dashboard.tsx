import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin.api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiBox, FiUsers, FiClock, FiCheckCircle, FiArrowRight, FiGrid, FiTag } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard().then((res: any) => {
      setStats(res.data);
      setLoading(false);
    }).catch((err: any) => { toast.error(err.response?.data?.message || err.message || 'Failed to load dashboard stats'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="mb-8 pb-6 border-b border-gray-800">
        <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Administration</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 uppercase">Platform Control Center</h1>
        <p className="text-sm text-gray-400 mt-0.5">Oversee marketplace products, vendors, and taxonomies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Products</span>
            <FiClock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-4">{stats?.pendingProducts || 0}</p>
        </div>

        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Sellers</span>
            <FiUsers className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-4">{stats?.pendingSellers || 0}</p>
        </div>

        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <FiBox className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-4">{stats?.totalProducts || 0}</p>
        </div>

        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sellers</span>
            <FiUsers className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-4">{stats?.totalSellers || 0}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/products" className="p-5 bg-[#141414] border border-gray-800 rounded-2xl hover:border-orange-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <FiCheckCircle className="text-orange-500 w-5 h-5" />
            <span className="font-bold text-white text-sm">Review Products</span>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link to="/admin/sellers" className="p-5 bg-[#141414] border border-gray-800 rounded-2xl hover:border-orange-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <FiUsers className="text-orange-500 w-5 h-5" />
            <span className="font-bold text-white text-sm">Manage Sellers</span>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link to="/admin/categories" className="p-5 bg-[#141414] border border-gray-800 rounded-2xl hover:border-orange-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <FiGrid className="text-orange-500 w-5 h-5" />
            <span className="font-bold text-white text-sm">Manage Categories</span>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
        </Link>

        <Link to="/admin/brands" className="p-5 bg-[#141414] border border-gray-800 rounded-2xl hover:border-orange-500/50 transition flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <FiTag className="text-orange-500 w-5 h-5" />
            <span className="font-bold text-white text-sm">Manage Brands</span>
          </div>
          <FiArrowRight className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
