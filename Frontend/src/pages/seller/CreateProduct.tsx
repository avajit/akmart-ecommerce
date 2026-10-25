import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getCategories, getBrands, getCategoryFilters } from '../../api/seller.api';
import { toast } from 'react-toastify';
import { 
  FiBox, 
  FiArrowLeft, 
  FiPlus, 
  FiTrash2, 
  FiLayers, 
  FiSliders, 
  FiCheckCircle, 
  FiImage, 
  FiInfo,
  FiTag
} from 'react-icons/fi';

interface CategoryAttributeConfig {
  id: string;
  key: string;
  label: string;
  filterType: 'MULTISELECT' | 'RANGE' | 'BOOLEAN';
  unit?: string | null;
  options?: string[];
}

interface VariantFormItem {
  name: string;
  sku: string;
  images: { url: string; isPrimary: boolean }[];
  attributes: Record<string, string>;
}

export default function CreateProduct() {
  const [categories, setCategories] = useState<any[]>([]);
  const [flattenedCategories, setFlattenedCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttributeConfig[]>([]);
  const [loadingCategoryAttrs, setLoadingCategoryAttrs] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    categoryId: string;
    brandId: string;
    variants: VariantFormItem[];
  }>({
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    variants: [
      {
        name: '',
        sku: '',
        images: [{ url: '', isPrimary: true }],
        attributes: {},
      },
    ],
  });

  useEffect(() => {
    fetchInitialData();
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

  const fetchInitialData = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        getCategories(),
        getBrands(),
      ]);
      const tree = catRes.data || [];
      setCategories(tree);
      setFlattenedCategories(flattenTree(tree));
      setBrands(brandRes.data || []);
    } catch {
      toast.error('Failed to load initial catalog data');
    }
  };

  // When a seller selects a category, dynamically fetch its configured attribute schemas
  const handleCategoryChange = async (categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }));
    setCategoryAttributes([]);

    if (!categoryId) return;

    setLoadingCategoryAttrs(true);
    try {
      const res = await getCategoryFilters(categoryId);
      const filters: CategoryAttributeConfig[] = res.data?.filters || [];
      setCategoryAttributes(filters);

      // Pre-seed attributes map for existing variants
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v => {
          const updatedAttrs = { ...v.attributes };
          filters.forEach(attr => {
            if (!updatedAttrs[attr.key]) {
              updatedAttrs[attr.key] = '';
            }
          });
          return { ...v, attributes: updatedAttrs };
        }),
      }));
    } catch {
      // Non-fatal if category has no custom attributes
      setCategoryAttributes([]);
    } finally {
      setLoadingCategoryAttrs(false);
    }
  };

  // Helper to update specific variant field
  const updateVariant = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  // Helper to update attribute value on a specific variant
  const updateVariantAttribute = (variantIndex: number, attrKey: string, value: string) => {
    setFormData(prev => {
      const updated = [...prev.variants];
      const currentAttrs = { ...updated[variantIndex].attributes, [attrKey]: value };
      
      // Auto-suggest variant name if empty or user wants helpful auto-naming
      let newName = updated[variantIndex].name;
      if (!newName || newName.startsWith('Variant')) {
        const parts = Object.values(currentAttrs).filter(Boolean);
        if (parts.length > 0) {
          newName = parts.join(' / ');
        }
      }

      updated[variantIndex] = {
        ...updated[variantIndex],
        attributes: currentAttrs,
        name: newName,
      };
      return { ...prev, variants: updated };
    });
  };

  // Add another variant slot
  const addVariantSlot = () => {
    const initialAttrs: Record<string, string> = {};
    categoryAttributes.forEach(attr => {
      initialAttrs[attr.key] = '';
    });

    const nextIndex = formData.variants.length + 1;
    const baseSku = formData.name ? formData.name.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'PROD';

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: `Variant ${nextIndex}`,
          sku: `${baseSku}-VAR-${nextIndex}`,
          images: [{ url: '', isPrimary: true }],
          attributes: initialAttrs,
        },
      ],
    }));
  };

  // Remove variant slot
  const removeVariantSlot = (index: number) => {
    if (formData.variants.length <= 1) {
      return toast.warn('A product must contain at least one variant.');
    }
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.categoryId) return toast.error('Please select a category');

    // Validate variants
    for (let i = 0; i < formData.variants.length; i++) {
      const v = formData.variants[i];
      if (!v.name.trim()) return toast.error(`Variant #${i + 1} name is required`);
      if (!v.sku.trim()) return toast.error(`Variant #${i + 1} SKU is required`);
      if (!v.images[0]?.url.trim()) return toast.error(`Variant #${i + 1} primary image URL is required`);
    }

    setLoading(true);
    try {
      // Clean attributes by removing empty strings
      const payload = {
        ...formData,
        variants: formData.variants.map(v => {
          const cleanAttrs: Record<string, any> = {};
          Object.entries(v.attributes).forEach(([k, val]) => {
            if (val && val.trim() !== '') {
              cleanAttrs[k] = val.trim();
            }
          });
          return {
            ...v,
            attributes: cleanAttrs,
          };
        }),
      };

      await createProduct(payload);
      toast.success('Product submitted as draft for admin review!');
      navigate('/seller/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <button 
            type="button"
            onClick={() => navigate('/seller/products')} 
            className="text-xs text-orange-400 hover:underline flex items-center gap-1.5 mb-2 font-semibold"
          >
            <FiArrowLeft /> Back to My Product Listings
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
            Create New Product Listing
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            List fresh groceries, seafood, electronics, fashion, or kitchenware with category-specific variant attributes.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Basic Information */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 sm:p-8 rounded-3xl space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <FiBox className="text-orange-400 text-lg" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">
              1. Basic Product Overview
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Product Title *
            </label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Fresh Himalayan Trout, MacBook Pro M3, Slim-Fit Linen Shirt..." 
              className="w-full bg-black border border-gray-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-orange-500 transition" 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea 
              required 
              placeholder="Provide a detailed description covering origin, materials, freshness, specifications..." 
              className="w-full bg-black border border-gray-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-orange-500 transition" 
              rows={4} 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select 
                required 
                className="w-full bg-black border border-gray-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-orange-500 transition" 
                value={formData.categoryId} 
                onChange={e => handleCategoryChange(e.target.value)}
              >
                <option value="">Select Category...</option>
                {flattenedCategories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.fullPath || c.name}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500 mt-1.5 block">
                Variants will adapt to this category's dynamic attribute specifications.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Brand (Optional)
              </label>
              <select 
                className="w-full bg-black border border-gray-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-orange-500 transition" 
                value={formData.brandId} 
                onChange={e => setFormData({ ...formData, brandId: e.target.value })}
              >
                <option value="">No Brand / Generic</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Category Attributes Architecture Info Banner */}
        {formData.categoryId && (
          <div className="bg-[#141414] border border-gray-800 p-5 rounded-2xl flex items-start gap-3">
            <FiSliders className="text-orange-400 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                Category Schema Active
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {loadingCategoryAttrs ? (
                  'Discovering dynamic attributes for this category...'
                ) : categoryAttributes.length > 0 ? (
                  <>
                    This category requires/supports attributes:{' '}
                    <span className="text-orange-400 font-semibold">
                      {categoryAttributes.map(a => `${a.label}${a.unit ? ` (${a.unit})` : ''}`).join(', ')}
                    </span>
                    . Fill these in below for each variant to enable multi-axis buttons & facet filtering!
                  </>
                ) : (
                  'This category currently has standard variant attributes (Size, Color, Custom Options).'
                )}
              </p>
            </div>
          </div>
        )}

        {/* 3. Multi-Axis Variants Section */}
        <div className="bg-[#141414] border border-gray-800/80 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2">
              <FiLayers className="text-orange-400 text-lg" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-200">
                  2. Product Variants & Dynamic Attributes ({formData.variants.length})
                </h2>
                <p className="text-xs text-gray-400">
                  Define SKU, primary image, and specific attributes (e.g. 500g vs 1kg, 8GB vs 16GB RAM)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addVariantSlot}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider transition active:scale-95"
            >
              <FiPlus /> Add Another Variant
            </button>
          </div>

          <div className="space-y-6">
            {formData.variants.map((variant, vIdx) => (
              <div 
                key={vIdx} 
                className="bg-black/60 border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-gray-700 transition"
              >
                {/* Variant Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-800/70">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center">
                      {vIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Variant {vIdx + 1}: {variant.name || 'Untitled Variant'}
                    </span>
                  </div>

                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariantSlot(vIdx)}
                      className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition px-2 py-1 rounded hover:bg-red-500/10"
                    >
                      <FiTrash2 /> Remove
                    </button>
                  )}
                </div>

                {/* Variant Name & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Variant Title * (e.g. 1 kg / Curry Cut or 16GB / Space Gray)
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. 1 kg / Curry Cut" 
                      className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                      value={variant.name} 
                      onChange={e => updateVariant(vIdx, 'name', e.target.value)} 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      SKU (Stock Keeping Unit) *
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. FISH-1KG-CC" 
                      className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 font-mono" 
                      value={variant.sku} 
                      onChange={e => updateVariant(vIdx, 'sku', e.target.value)} 
                    />
                  </div>
                </div>

                {/* Primary Image URL */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <FiImage className="text-gray-400" /> Primary Photo URL *
                  </label>
                  <input 
                    required 
                    type="url" 
                    placeholder="https://images.unsplash.com/..." 
                    className="w-full bg-[#121212] border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                    value={variant.images[0]?.url || ''} 
                    onChange={e => {
                      const updatedImages = [{ url: e.target.value, isPrimary: true }];
                      updateVariant(vIdx, 'images', updatedImages);
                    }} 
                  />
                  {variant.images[0]?.url && (
                    <div className="mt-2 flex items-center gap-2">
                      <img 
                        src={variant.images[0].url} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded-lg border border-gray-800"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-[11px] text-gray-400">Photo preview</span>
                    </div>
                  )}
                </div>

                {/* Dynamic Category Attributes Fields */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <FiTag className="text-orange-400" /> Dynamic Category Attributes
                  </div>

                  {categoryAttributes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#111111] p-4 rounded-xl border border-gray-800/80">
                      {categoryAttributes.map(attr => (
                        <div key={attr.key}>
                          <label className="block text-[11px] text-gray-300 font-medium mb-1">
                            {attr.label}
                            {attr.unit && <span className="text-emerald-400 font-mono ml-1">({attr.unit})</span>}
                          </label>

                          {/* If known options exist from active products in category, provide auto-suggest dropdown */}
                          {attr.options && attr.options.length > 0 ? (
                            <div className="relative">
                              <input
                                type="text"
                                list={`options-${attr.key}-${vIdx}`}
                                placeholder={`Enter or select ${attr.label}`}
                                className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                                value={variant.attributes[attr.key] || ''}
                                onChange={e => updateVariantAttribute(vIdx, attr.key, e.target.value)}
                              />
                              <datalist id={`options-${attr.key}-${vIdx}`}>
                                {attr.options.map((opt, i) => (
                                  <option key={i} value={opt} />
                                ))}
                              </datalist>
                            </div>
                          ) : attr.filterType === 'BOOLEAN' ? (
                            <select
                              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                              value={variant.attributes[attr.key] || ''}
                              onChange={e => updateVariantAttribute(vIdx, attr.key, e.target.value)}
                            >
                              <option value="">Not Specified</option>
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                            </select>
                          ) : (
                            <input
                              type={attr.filterType === 'RANGE' ? 'text' : 'text'}
                              placeholder={`e.g. ${attr.unit ? `1 ${attr.unit}` : 'Standard'}`}
                              className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                              value={variant.attributes[attr.key] || ''}
                              onChange={e => updateVariantAttribute(vIdx, attr.key, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback standard attributes when category has no custom schema */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#111111] p-4 rounded-xl border border-gray-800/80">
                      <div>
                        <label className="block text-[11px] text-gray-300 font-medium mb-1">Color / Finish</label>
                        <input
                          type="text"
                          placeholder="e.g. Jet Black, Olive, Silver"
                          className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                          value={variant.attributes['color'] || ''}
                          onChange={e => updateVariantAttribute(vIdx, 'color', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-300 font-medium mb-1">Size / Dimension</label>
                        <input
                          type="text"
                          placeholder="e.g. S, M, L, XL, 1 kg, 500g"
                          className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                          value={variant.attributes['size'] || ''}
                          onChange={e => updateVariantAttribute(vIdx, 'size', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4">
          <button 
            type="button" 
            onClick={() => navigate('/seller/products')} 
            className="px-6 py-3.5 rounded-xl font-semibold text-xs text-gray-400 hover:text-white transition bg-gray-900 border border-gray-800"
          >
            Cancel Listing
          </button>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99] disabled:opacity-60 flex items-center gap-2"
          >
            <FiCheckCircle className="text-base" />
            {loading ? 'Submitting Product...' : 'Save & Submit Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
