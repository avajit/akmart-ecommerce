import React, { useEffect, useState } from 'react';
import { getSellerProfile, updateSellerProfile } from '../../api/seller.api';
import { toast } from 'react-toastify';

export default function SellerSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  });

  useEffect(() => {
    getSellerProfile().then((res: any) => {
      const data = res.data;
      setProfile(data);
      if (data) {
        setFormData({
          shopName: data.shopName || '',
          shopDescription: data.shopDescription || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          country: data.country || ''
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSellerProfile(formData);
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="text-center py-20 text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Shop Settings</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Shop Name</label>
          <input 
            required 
            type="text" 
            value={formData.shopName}
            onChange={e => setFormData({...formData, shopName: e.target.value})}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Shop Description</label>
          <textarea 
            rows={3}
            value={formData.shopDescription}
            onChange={e => setFormData({...formData, shopDescription: e.target.value})}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
          <input 
            required 
            type="text" 
            value={formData.phoneNumber}
            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
            <input 
              required 
              type="text" 
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">City</label>
            <input 
              required 
              type="text" 
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">State / Province</label>
            <input 
              required 
              type="text" 
              value={formData.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Pincode / ZIP</label>
            <input 
              required 
              type="text" 
              value={formData.pincode}
              onChange={e => setFormData({...formData, pincode: e.target.value})}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-8 rounded-lg transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
