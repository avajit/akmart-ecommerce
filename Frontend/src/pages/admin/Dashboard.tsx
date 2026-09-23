import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../api/admin.api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAdminDashboard().then((res: any) => setStats(res.data));
  }, []);

  if (!stats) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-gray-400 font-medium">Pending Products</p>
          <p className="text-4xl font-bold text-yellow-500 mt-2">{stats.pendingProducts}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-gray-400 font-medium">Pending Sellers</p>
          <p className="text-4xl font-bold text-blue-500 mt-2">{stats.pendingSellers}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-gray-400 font-medium">Total Products</p>
          <p className="text-4xl font-bold text-emerald-500 mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <p className="text-gray-400 font-medium">Total Sellers</p>
          <p className="text-4xl font-bold text-white mt-2">{stats.totalSellers}</p>
        </div>
      </div>
      
      <div className="flex gap-4 flex-wrap">
        <Link to="/admin/products" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Review Product Queue
        </Link>
        <Link to="/admin/sellers" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Manage Sellers
        </Link>
        <Link to="/admin/categories" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Manage Categories
        </Link>
        <Link to="/admin/brands" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Manage Brands
        </Link>
      </div>
    </div>
  );
}
