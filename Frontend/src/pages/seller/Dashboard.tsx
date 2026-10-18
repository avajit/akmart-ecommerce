import React, { useEffect, useState } from 'react';
import { getSellerProfile, getSellerProducts, getListings } from '../../api/seller.api';
import { Link, useNavigate } from 'react-router-dom';
import { FiBox, FiList, FiClock, FiPlus, FiSettings, FiArrowRight } from 'react-icons/fi';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSellerProfile()
      .then((res: any) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        if (err.response?.status === 404) {
          navigate('/seller/onboarding');
        } else {
          setLoading(false);
        }
      });
      
    getSellerProducts().then((res: any) => setProducts(res.data?.products || []));
    getListings().then((res: any) => setListings(res.data || []));
  }, [navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading seller dashboard...</p>
      </div>
    );
  }

  if (!profile) return null;

  const pendingCount = products.filter((p: any) => p.status === 'PENDING_REVIEW').length;
  const activeListingsCount = listings.filter((l: any) => l.isActive).length;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-800">
        <div>
          <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Supplier Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">{profile.shopName}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your inventory, pricing, and store operations</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/seller/products/new"
            className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <FiPlus /> Add Product
          </Link>
          <Link
            to="/seller/settings"
            className="bg-[#1A1A1A] hover:bg-[#222222] border border-gray-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <FiSettings /> Settings
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <FiBox className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-4">{products.length}</p>
        </div>

        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Listings</span>
            <FiList className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-white mt-4">{activeListingsCount}</p>
        </div>

        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <FiClock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-4">{pendingCount}</p>
        </div>
      </div>

      {/* Quick Actions / Recent Status */}
      <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <h2 className="text-base font-bold uppercase tracking-wider">Quick Links</h2>
          <span className="text-xs text-gray-500">Supplier Dashboard v1.0</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <Link to="/seller/products" className="p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl hover:border-orange-500/50 transition flex items-center justify-between group">
            <span className="font-semibold text-white">Manage Products</span>
            <FiArrowRight className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/seller/listings" className="p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl hover:border-orange-500/50 transition flex items-center justify-between group">
            <span className="font-semibold text-white">Pricing & Inventory</span>
            <FiArrowRight className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/seller/orders" className="p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl hover:border-orange-500/50 transition flex items-center justify-between group">
            <span className="font-semibold text-white">Store Orders</span>
            <FiArrowRight className="text-gray-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
