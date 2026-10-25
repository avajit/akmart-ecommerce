import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSellerProfile } from '../../api/seller.api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export default function Onboarding() {
  const [formData, setFormData] = useState({ shopName: '', phoneNumber: '', address: '', city: '', state: '', pincode: '', country: 'NP' });
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSellerProfile(formData);
      updateUser({ role: 'SELLER', roleName: 'SELLER' });
      toast.success('Seller profile created! Welcome to your Seller Dashboard.');
      navigate('/seller/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to create profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-white">Setup Your Seller Profile</h1>
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-2xl border border-gray-800 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Shop Name</label>
          <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
          <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
            <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
            <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
            <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Pincode</label>
            <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-lg p-3 mt-6 hover:scale-[1.02] transition-transform">Complete Setup</button>
      </form>
    </div>
  );
}
