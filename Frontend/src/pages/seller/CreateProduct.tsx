import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories, getBrands } from '../../api/seller.api';
import { toast } from 'react-toastify';
import { FiBox, FiArrowLeft } from 'react-icons/fi';

export default function CreateProduct() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    variants: [{ name: '', sku: '', images: [{ url: '', isPrimary: true }] }]
  });

  useEffect(() => {
    getCategories().then((res: any) => setCategories(res.data || []));
    getBrands().then((res: any) => setBrands(res.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error("Please select a category");
    setLoading(true);
    try {
      await createProduct(formData);
      toast.success("Product drafted successfully!");
      navigate('/seller/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <button onClick={() => navigate('/seller/products')} className="text-xs text-orange-400 hover:underline flex items-center gap-1 mb-2">
            <FiArrowLeft /> Back to Products
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Add New Product</h1>
          <p className="text-sm text-gray-400 mt-0.5">Submit a new product for admin review and listing</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 border-b border-gray-800 pb-3">Basic Information</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Product Name *</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Premium Cotton Hoodie" 
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description *</label>
            <textarea 
              required 
              placeholder="Detailed product overview..." 
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
              rows={4} 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
              <select 
                required 
                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                value={formData.categoryId} 
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Brand</label>
              <select 
                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                value={formData.brandId} 
                onChange={e => setFormData({...formData, brandId: e.target.value})}
              >
                <option value="">No Brand</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Default Variant Info */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-300 border-b border-gray-800 pb-3">Default Variant</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Variant Name (e.g. Black / L) *</label>
              <input 
                required 
                type="text" 
                placeholder="Black / L" 
                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                value={formData.variants[0].name} 
                onChange={e => {
                  const newV = [...formData.variants]; newV[0].name = e.target.value; setFormData({...formData, variants: newV})
                }} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">SKU *</label>
              <input 
                required 
                type="text" 
                placeholder="HOODIE-BLK-L" 
                className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                value={formData.variants[0].sku} 
                onChange={e => {
                  const newV = [...formData.variants]; newV[0].sku = e.target.value; setFormData({...formData, variants: newV})
                }} 
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Primary Image URL *</label>
            <input 
              required 
              type="url" 
              placeholder="https://images.unsplash.com/..." 
              className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
              value={formData.variants[0].images[0].url} 
              onChange={e => {
                const newV = [...formData.variants]; newV[0].images[0].url = e.target.value; setFormData({...formData, variants: newV})
              }} 
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={() => navigate('/seller/products')} 
            className="px-5 py-3 rounded-xl font-semibold text-xs text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
