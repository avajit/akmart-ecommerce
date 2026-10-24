import React, { useState, useEffect } from 'react';
import { createCategory } from '../../api/admin.api';
import { getCategories } from '../../api/seller.api';
import { toast } from 'react-toastify';

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', parentId: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    getCategories().then((res: any) => setCategories(res.data || []));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    setLoading(true);
    try {
      await createCategory(newCategory);
      toast.success("Category created!");
      setNewCategory({ name: '', parentId: '', imageUrl: '' });
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Category Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="md:col-span-1">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Add New Category</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category Name</label>
                <input 
                  required
                  type="text" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
                  placeholder="e.g. Laptops"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Parent Category</label>
                <select
                  value={newCategory.parentId}
                  onChange={e => setNewCategory({...newCategory, parentId: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={newCategory.imageUrl}
                  onChange={e => setNewCategory({...newCategory, imageUrl: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
                  placeholder="https://..."
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-colors"
              >
                {loading ? "Adding..." : "Add Category"}
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
                  <th className="p-4 text-gray-400 font-medium">Image</th>
                  <th className="p-4 text-gray-400 font-medium">Category Name</th>
                  <th className="p-4 text-gray-400 font-medium">Slug</th>
                  <th className="p-4 text-gray-400 font-medium">Sub-categories</th>
                  <th className="p-4 text-gray-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {categories.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">No categories found.</td></tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.id} className="hover:bg-gray-800/30">
                      <td className="p-4">
                        {c.imageUrl ? (
                           <img src={c.imageUrl} alt={c.name} className="h-8 w-8 object-cover rounded" />
                        ) : (
                           <div className="h-8 w-8 bg-gray-800 rounded flex items-center justify-center text-xs">N/A</div>
                        )}
                      </td>
                      <td className="p-4 text-white font-medium">{c.name}</td>
                      <td className="p-4 text-gray-400">{c.slug}</td>
                      <td className="p-4 text-gray-400">{c.children?.length || 0}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={async () => {
                            if(confirm(`Are you sure you want to deactivate ${c.name}?`)) {
                              try {
                                await import('../../api/admin.api').then(m => m.deactivateCategory(c.id));
                                toast.success("Category deactivated");
                                fetchCategories();
                              } catch (err: any) {
                                toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to deactivate category");
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
