import React, { useState, useEffect } from 'react';
import { createBrand } from '../../api/admin.api';
import { getBrands } from '../../api/seller.api';
import { toast } from 'react-toastify';

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [newBrand, setNewBrand] = useState({ name: '', logoUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = () => {
    getBrands().then((res: any) => setBrands(res.data || []));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.name) return;
    setLoading(true);
    try {
      await createBrand(newBrand);
      toast.success("Brand created!");
      setNewBrand({ name: '', logoUrl: '' });
      fetchBrands();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to create brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Brand Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="md:col-span-1">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New Brand</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Brand Name</label>
                <input 
                  required
                  type="text" 
                  value={newBrand.name}
                  onChange={e => setNewBrand({...newBrand, name: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
                  placeholder="e.g. Sony"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Logo URL (Optional)</label>
                <input 
                  type="url" 
                  value={newBrand.logoUrl}
                  onChange={e => setNewBrand({...newBrand, logoUrl: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
                  placeholder="https://..."
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "Adding..." : "Add Brand"}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="p-4 text-gray-400 font-medium w-16">Logo</th>
                  <th className="p-4 text-gray-400 font-medium">Brand Name</th>
                  <th className="p-4 text-gray-400 font-medium">Slug</th>
                  <th className="p-4 text-gray-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {brands.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No brands found.</td></tr>
                ) : (
                  brands.map(b => (
                    <tr key={b.id} className="hover:bg-gray-800/30">
                      <td className="p-4">
                        {b.logoUrl ? (
                           <img src={b.logoUrl} alt={b.name} className="h-8 w-auto object-contain bg-white rounded p-1" />
                        ) : (
                           <div className="h-8 w-8 bg-gray-800 rounded flex items-center justify-center text-xs">N/A</div>
                        )}
                      </td>
                      <td className="p-4 text-white font-medium">{b.name}</td>
                      <td className="p-4 text-gray-400">{b.slug}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={async () => {
                            if(confirm(`Are you sure you want to deactivate ${b.name}?`)) {
                              try {
                                await import('../../api/admin.api').then(m => m.deactivateBrand(b.id));
                                toast.success("Brand deactivated");
                                fetchBrands();
                              } catch (err: any) {
                                toast.error(err.response?.data?.error?.message || "Failed to deactivate brand");
                              }
                            }
                          }}
                          className="text-red-500 hover:text-red-400 font-medium text-sm"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
