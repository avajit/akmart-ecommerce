import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories, getBrands } from '../../api/seller.api';
import { toast } from 'react-toastify';

export default function CreateProduct() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
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
    try {
      await createProduct(formData);
      toast.success("Product drafted successfully!");
      navigate('/seller/products');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to create product");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Basic Info</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Product Name</label>
            <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select required className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Brand</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.brandId} onChange={e => setFormData({...formData, brandId: e.target.value})}>
                <option value="">No Brand</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
          <h2 className="text-xl font-semibold text-white border-b border-gray-800 pb-2">Variant Info (Default)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Variant Name (e.g. Black / 256GB)</label>
              <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.variants[0].name} onChange={e => {
                const newV = [...formData.variants]; newV[0].name = e.target.value; setFormData({...formData, variants: newV})
              }} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">SKU</label>
              <input required type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.variants[0].sku} onChange={e => {
                const newV = [...formData.variants]; newV[0].sku = e.target.value; setFormData({...formData, variants: newV})
              }} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Primary Image URL</label>
            <input required type="url" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" value={formData.variants[0].images[0].url} onChange={e => {
                const newV = [...formData.variants]; newV[0].images[0].url = e.target.value; setFormData({...formData, variants: newV})
              }} />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/seller/products')} className="px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white">Cancel</button>
          <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black px-8 py-3 rounded-lg font-bold hover:scale-[1.02] transition-transform">Save as Draft</button>
        </div>
      </form>
    </div>
  );
}
