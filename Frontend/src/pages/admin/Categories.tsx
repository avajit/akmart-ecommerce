import React, { useState, useEffect } from 'react';
import { 
  createCategory, 
  deactivateCategory, 
  getCategoryAttributes, 
  addCategoryAttribute, 
  deleteCategoryAttribute 
} from '../../api/admin.api';
import { getCategories } from '../../api/seller.api';
import { toast } from 'react-toastify';
import { 
  FiLayers, 
  FiSliders, 
  FiPlus, 
  FiTrash2, 
  FiX, 
  FiSearch, 
  FiTag, 
  FiCheckCircle, 
  FiInfo, 
  FiChevronRight,
  FiZap
} from 'react-icons/fi';

interface CategoryAttribute {
  id: string;
  categoryId: string;
  key: string;
  label: string;
  filterType: 'MULTISELECT' | 'RANGE' | 'BOOLEAN';
  unit?: string | null;
  order: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [flattenedCategories, setFlattenedCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentFilter, setSelectedParentFilter] = useState('ALL');
  const [newCategory, setNewCategory] = useState({ name: '', parentId: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);

  // Attribute Studio State
  const [activeCategoryForAttrs, setActiveCategoryForAttrs] = useState<any | null>(null);
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [attrsLoading, setAttrsLoading] = useState(false);
  const [attrSubmitting, setAttrSubmitting] = useState(false);
  const [newAttr, setNewAttr] = useState<{
    key: string;
    label: string;
    filterType: 'MULTISELECT' | 'RANGE' | 'BOOLEAN';
    unit: string;
    order: number;
  }>({
    key: '',
    label: '',
    filterType: 'MULTISELECT',
    unit: '',
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const flattenTree = (nodes: any[], parentName = ''): any[] => {
    let result: any[] = [];
    for (const node of nodes) {
      result.push({ ...node, fullPath: parentName ? `${parentName} › ${node.name}` : node.name });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, node.name));
      }
    }
    return result;
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const tree = res.data || [];
      setCategories(tree);
      setFlattenedCategories(flattenTree(tree));
    } catch {
      toast.error('Failed to load categories');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    setLoading(true);
    try {
      await createCategory(newCategory);
      toast.success('Category created successfully!');
      setNewCategory({ name: '', parentId: '', imageUrl: '' });
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  // Open Attribute Studio Modal
  const openAttributeStudio = async (category: any) => {
    setActiveCategoryForAttrs(category);
    setAttrsLoading(true);
    setNewAttr({
      key: '',
      label: '',
      filterType: 'MULTISELECT',
      unit: '',
      order: 0,
    });
    try {
      const res = await getCategoryAttributes(category.id);
      setAttributes(res.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load category attributes');
      setAttributes([]);
    } finally {
      setAttrsLoading(false);
    }
  };

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategoryForAttrs) return;
    if (!newAttr.key.trim() || !newAttr.label.trim()) {
      return toast.error('Key and Label are required');
    }

    setAttrSubmitting(true);
    try {
      await addCategoryAttribute(activeCategoryForAttrs.id, {
        key: newAttr.key.trim().toLowerCase().replace(/\s+/g, '_'),
        label: newAttr.label.trim(),
        filterType: newAttr.filterType,
        unit: newAttr.unit.trim() || undefined,
        order: Number(newAttr.order) || 0,
      });
      toast.success(`Attribute "${newAttr.label}" saved!`);
      // Reload attributes
      const res = await getCategoryAttributes(activeCategoryForAttrs.id);
      setAttributes(res.data || []);
      setNewAttr({
        key: '',
        label: '',
        filterType: 'MULTISELECT',
        unit: '',
        order: (res.data?.length || 0),
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add attribute');
    } finally {
      setAttrSubmitting(false);
    }
  };

  const handleDeleteAttribute = async (attrId: string, attrLabel: string) => {
    if (!activeCategoryForAttrs) return;
    if (!confirm(`Delete attribute "${attrLabel}"? This removes it from future variant schemas.`)) return;
    try {
      await deleteCategoryAttribute(activeCategoryForAttrs.id, attrId);
      toast.success(`Attribute "${attrLabel}" deleted`);
      setAttributes(prev => prev.filter(a => a.id !== attrId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete attribute');
    }
  };

  // Quick preset helper for rapid category onboarding (Fish, Tech, Apparel, Kitchen, Produce)
  const applyPreset = (preset: { key: string; label: string; filterType: 'MULTISELECT' | 'RANGE' | 'BOOLEAN'; unit: string }) => {
    setNewAttr(prev => ({
      ...prev,
      key: preset.key,
      label: preset.label,
      filterType: preset.filterType,
      unit: preset.unit,
      order: attributes.length,
    }));
  };

  const filteredCategories = flattenedCategories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedParentFilter === 'ROOT') return matchesSearch && !cat.parentId;
    if (selectedParentFilter === 'CHILD') return matchesSearch && cat.parentId;
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">
            <FiLayers /> Taxonomy & Attribute Architecture
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Category & Attribute Studio</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage 1,000+ categories and configure dynamic multi-axis variant schemas for Groceries, Tech, Apparel & more.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create Form (Left Column) */}
        <div className="lg:col-span-1">
          <div className="bg-[#141414] border border-gray-800 p-5 sm:p-6 rounded-2xl shadow-xl lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FiPlus className="text-emerald-400" /> Add New Category
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Create root departments or subcategories. Child categories inherit attributes from parent tiers.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Category Name *
                </label>
                <input 
                  required
                  type="text" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" 
                  placeholder="e.g. Fresh Seafood, Kitchenware..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Parent Category
                </label>
                <select
                  value={newCategory.parentId}
                  onChange={e => setNewCategory({ ...newCategory, parentId: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="">None (Top Level Root Department)</option>
                  {flattenedCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullPath || c.name}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Top level categories become main department tabs in the store navigation.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Image URL (Optional)
                </label>
                <input 
                  type="url" 
                  value={newCategory.imageUrl}
                  onChange={e => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500 transition" 
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                {loading ? 'Creating Category...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Categories Table (Right Column) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-[#141414] border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                placeholder="Search across all categories & slugs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSelectedParentFilter('ALL')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  selectedParentFilter === 'ALL' ? 'bg-orange-500 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
                }`}
              >
                All ({flattenedCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedParentFilter('ROOT')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  selectedParentFilter === 'ROOT' ? 'bg-orange-500 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
                }`}
              >
                Root
              </button>
              <button
                type="button"
                onClick={() => setSelectedParentFilter('CHILD')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  selectedParentFilter === 'CHILD' ? 'bg-orange-500 text-white' : 'bg-gray-800/60 text-gray-400 hover:text-white'
                }`}
              >
                Subcategories
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1f1f1f] text-gray-400 font-semibold border-b border-gray-800 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Category</th>
                    <th className="p-4">Hierarchy</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4 text-center">Attributes</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-500">
                        No categories found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map(cat => (
                      <tr key={cat.id} className="hover:bg-gray-900/40 transition">
                        {/* Name & Image */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {cat.imageUrl ? (
                              <img src={cat.imageUrl} alt={cat.name} className="h-9 w-9 object-cover rounded-lg border border-gray-800 flex-shrink-0" />
                            ) : (
                              <div className="h-9 w-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs flex-shrink-0">
                                {cat.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white text-sm">{cat.name}</div>
                              <div className="text-[11px] text-gray-500 font-mono">ID: {cat.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>

                        {/* Hierarchy Path */}
                        <td className="p-4">
                          {cat.parentId ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-800/80 text-gray-300 text-[11px] border border-gray-700/50">
                              Subcategory
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[11px] border border-blue-500/20 font-semibold">
                              Root Department
                            </span>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="p-4 text-gray-400 font-mono text-[11px]">
                          {cat.slug}
                        </td>

                        {/* Configure Attributes Trigger */}
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => openAttributeStudio(cat)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold text-xs transition active:scale-95"
                          >
                            <FiSliders className="text-xs" />
                            <span>Attributes Studio</span>
                          </button>
                        </td>

                        {/* Deactivate Action */}
                        <td className="p-4 text-right">
                          <button 
                            type="button"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to deactivate ${cat.name}?`)) {
                                try {
                                  await deactivateCategory(cat.id);
                                  toast.success(`Category "${cat.name}" deactivated`);
                                  fetchCategories();
                                } catch (err: any) {
                                  toast.error(err.response?.data?.message || 'Failed to deactivate category');
                                }
                              }
                            }}
                            className="text-red-400 hover:text-red-300 font-medium text-xs px-2.5 py-1 rounded hover:bg-red-500/10 transition"
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

      {/* ── Category Attribute Studio Slide-Over / Modal ─────────────────── */}
      {activeCategoryForAttrs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121212] border border-gray-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#181818]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg">
                  <FiSliders />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeCategoryForAttrs.name}
                    <span className="text-xs font-normal text-gray-400 font-mono">({activeCategoryForAttrs.slug})</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Define multi-axis variant attributes (RAM, Size, Weight, Cut Type) for sellers and buyer filter facets.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveCategoryForAttrs(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl bg-gray-800/50 hover:bg-gray-800 transition"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Info banner */}
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-200">
                <FiInfo className="text-base text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-blue-300">Enterprise Dynamic Taxonomy:</strong> When sellers list products under <strong>{activeCategoryForAttrs.name}</strong>, they are automatically prompted to fill in these specific variant attributes. The catalog automatically indexes them into faceted navigation filters for shoppers!
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiZap className="text-amber-400" /> One-Click Presets for Fast Setup
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset({ key: 'weight', label: 'Pack Weight', filterType: 'RANGE', unit: 'kg' })}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700/60 font-medium"
                  >
                    + Weight (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ key: 'cut_type', label: 'Cutting Style', filterType: 'MULTISELECT', unit: '' })}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700/60 font-medium"
                  >
                    + Cut Style (Curry, Fillet)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ key: 'ram', label: 'RAM Size', filterType: 'MULTISELECT', unit: 'GB' })}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700/60 font-medium"
                  >
                    + RAM (GB)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ key: 'storage', label: 'Internal Storage', filterType: 'MULTISELECT', unit: 'GB' })}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700/60 font-medium"
                  >
                    + Storage (GB)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ key: 'size', label: 'Apparel Size', filterType: 'MULTISELECT', unit: '' })}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700/60 font-medium"
                  >
                    + Size (S, M, L, XL)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ key: 'is_organic', label: 'Certified Organic', filterType: 'BOOLEAN', unit: '' })}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700/60 font-medium"
                  >
                    + Organic (Yes/No)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset({ key: 'material', label: 'Material', filterType: 'MULTISELECT', unit: '' })}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 transition border border-gray-700/60 font-medium"
                  >
                    + Material / Fabric
                  </button>
                </div>
              </div>

              {/* Add New Attribute Form */}
              <form onSubmit={handleAddAttribute} className="bg-[#181818] border border-gray-800/80 p-5 rounded-2xl space-y-4">
                <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Add Attribute Definition</span>
                  <span className="text-gray-500 font-normal">Saves immediately to database</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Key * (e.g. cut_type)</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. weight, ram"
                      value={newAttr.key}
                      onChange={e => setNewAttr({ ...newAttr, key: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Label * (e.g. Pack Weight)</label>
                    <input
                      required
                      type="text"
                      placeholder="Display label"
                      value={newAttr.label}
                      onChange={e => setNewAttr({ ...newAttr, label: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Filter Type *</label>
                    <select
                      value={newAttr.filterType}
                      onChange={e => setNewAttr({ ...newAttr, filterType: e.target.value as any })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="MULTISELECT">Multi-select (Buttons/Pills)</option>
                      <option value="RANGE">Range Slider (Numeric)</option>
                      <option value="BOOLEAN">Boolean (Toggle)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Unit (e.g. kg, GB, L)</label>
                    <input
                      type="text"
                      placeholder="Optional unit"
                      value={newAttr.unit}
                      onChange={e => setNewAttr({ ...newAttr, unit: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={attrSubmitting}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
                  >
                    <FiPlus />
                    {attrSubmitting ? 'Saving...' : 'Add Attribute to Category'}
                  </button>
                </div>
              </form>

              {/* Current Attributes List */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Configured Attributes ({attributes.length})
                </h4>

                {attrsLoading ? (
                  <div className="py-8 text-center text-xs text-gray-500">Loading attributes...</div>
                ) : attributes.length === 0 ? (
                  <div className="bg-[#181818] border border-dashed border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-xs">
                    No custom attributes configured for this category yet.
                    <br />
                    Use the presets above or enter a key & label to enable dynamic variant axes!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attributes.map(attr => (
                      <div 
                        key={attr.id}
                        className="bg-[#181818] border border-gray-800 rounded-xl p-3.5 flex items-center justify-between gap-4 hover:border-gray-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-md bg-gray-800 text-gray-400 text-[11px] font-mono flex items-center justify-center">
                            #{attr.order}
                          </span>
                          <div>
                            <div className="font-bold text-white text-xs flex items-center gap-2">
                              {attr.label}
                              <span className="font-mono text-[10px] text-gray-400 bg-black/60 px-2 py-0.5 rounded">
                                key: {attr.key}
                              </span>
                              {attr.unit && (
                                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                                  unit: {attr.unit}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                              <span>Type: <strong className="text-gray-300">{attr.filterType}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAttribute(attr.id, attr.label)}
                          className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition"
                          title="Delete attribute"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#181818] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveCategoryForAttrs(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-xl text-xs transition"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
