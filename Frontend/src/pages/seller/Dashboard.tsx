import React, { useEffect, useState } from 'react';
import { getSellerProfile, getSellerProducts, getListings } from '../../api/seller.api';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSellerProfile()
      .then((res: any) => setProfile(res.data))
      .catch((err: any) => {
        if (err.response?.status === 404) navigate('/seller/onboarding');
      });
      
    getSellerProducts().then((res: any) => setProducts(res.data?.products || []));
    getListings().then((res: any) => setListings(res.data || []));
  }, [navigate]);

  if (!profile) return <div className="text-center py-20">Loading Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {profile.shopName}</p>
        </div>
        <div className="space-x-4">
          <Link to="/seller/products/new" className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-400 transition-colors">Add Product</Link>
          <Link to="/seller/settings" className="bg-gray-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition-colors">Shop Settings</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-400 font-medium">Total Products</p>
          <p className="text-4xl font-bold text-white mt-2">{products.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-400 font-medium">Active Listings</p>
          <p className="text-4xl font-bold text-white mt-2">{listings.filter((l:any) => l.isActive).length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col justify-center">
          <p className="text-gray-400 font-medium">Pending Approvals</p>
          <p className="text-4xl font-bold text-yellow-500 mt-2">{products.filter((p:any) => p.status === 'PENDING_REVIEW').length}</p>
        </div>
      </div>
    </div>
  );
}
