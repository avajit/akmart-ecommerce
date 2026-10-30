import React, { useEffect, useState, useContext, useMemo } from 'react';
import { browseProducts, getCategoryTree, getBrands, getCategoryFilters } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { 
  FiFilter, 
  FiChevronRight, 
  FiChevronDown, 
  FiX, 
  FiChevronLeft, 
  FiCheck, 
  FiSliders, 
  FiSearch,
  FiBox,
  FiRefreshCw,
  FiTag
} from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useDocumentTitle from '../hooks/useDocumentTitle';

const PRICE_BRACKETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under NPR 1,000', min: '', max: '1000' },
  { label: 'NPR 1,000 – 5,000', min: '1000', max: '5000' },
  { label: 'NPR 5,000 – 15,000', min: '5000', max: '15000' },
  { label: 'Above NPR 15,000', min: '15000', max: '' },
];

const ITEMS_PER_PAGE = 12;

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { search: contextSearch, currency } = useContext(ShopContext) || { search: '', currency: 'NPR ' };

  // Read URL Params as Single Source of Truth
  const urlCategory = searchParams.get('category') || '';
  const categoryTitle = urlCategory ? `${urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1)} Collection` : 'All Collections';
  useDocumentTitle(categoryTitle);
  const urlBrand = searchParams.get('brand') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlSort = searchParams.get('sort') || 'newest';
  const urlMinPrice = searchParams.get('minPrice') || '';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlInStock = searchParams.get('inStock') === 'true';
  const urlPage = parseInt(searchParams.get('page') || '1', 10) || 1;

  // Local state
  const [products, setProducts] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [dynamicAttributeConfigs, setDynamicAttributeConfigs] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Custom price input local buffer
  const [customMin, setCustomMin] = useState(urlMinPrice);
  const [customMax, setCustomMax] = useState(urlMaxPrice);
  const [brandSearch, setBrandSearch] = useState('');

  // Sync custom price inputs when URL changes
  useEffect(() => {
    setCustomMin(urlMinPrice);
    setCustomMax(urlMaxPrice);
  }, [urlMinPrice, urlMaxPrice]);

  // Load Categories & Brands with deduplication
  useEffect(() => {
    getCategoryTree()
      .then((res: any) => {
        const rawTree = res.data || [];
        const uniqueCatMap = new Map<string, any>();
        rawTree.forEach((cat: any) => {
          const key = (cat.name || cat.slug || '').toLowerCase().trim();
          if (!key) return;
          if (!uniqueCatMap.has(key)) {
            uniqueCatMap.set(key, { ...cat, children: [] });
          }
          const existingCat = uniqueCatMap.get(key);
          const childMap = new Map<string, any>();
          (existingCat.children || []).forEach((c: any) => {
            childMap.set((c.name || '').toLowerCase().trim(), c);
          });
          (cat.children || []).forEach((c: any) => {
            const cName = (c.name || '').toLowerCase().trim();
            if (!cName) return;
            const existingChild = childMap.get(cName);
            const isMoreSpecific = c.slug?.startsWith(`${cat.slug}-`) || (c.slug && c.slug.includes('-'));
            if (!existingChild || isMoreSpecific) {
              childMap.set(cName, c);
            }
          });
          existingCat.children = Array.from(childMap.values());
        });
        const tree = Array.from(uniqueCatMap.values());
        setCategoryTree(tree);

        // Auto-expand parents if selected
        const expanded: Record<string, boolean> = {};
        tree.forEach((root: any) => {
          if (root.slug === urlCategory || root.children?.some((c: any) => c.slug === urlCategory)) {
            expanded[root.id] = true;
          }
        });
        setExpandedCategories(expanded);
      })
      .catch(() => {});

    getBrands()
      .then((res: any) => setBrands(res.data || []))
      .catch(() => {});
  }, []);

  // Ensure active category parent remains expanded when URL changes
  useEffect(() => {
    if (urlCategory && categoryTree.length > 0) {
      setExpandedCategories(prev => {
        const next = { ...prev };
        categoryTree.forEach((root: any) => {
          if (root.slug === urlCategory || root.children?.some((c: any) => c.slug === urlCategory)) {
            next[root.id] = true;
          }
        });
        return next;
      });
    }
  }, [urlCategory, categoryTree]);

  // Fetch dynamic category attributes when active category changes (Amazon/Flipkart style)
  useEffect(() => {
    if (urlCategory) {
      getCategoryFilters(urlCategory)
        .then((res: any) => {
          setDynamicAttributeConfigs(res.data?.filters || []);
        })
        .catch(() => setDynamicAttributeConfigs([]));
    } else {
      setDynamicAttributeConfigs([]);
    }
  }, [urlCategory]);

  // Update URL helper
  const updateParams = (updates: Record<string, string | null | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });

    if (resetPage && updates.page === undefined) {
      next.delete('page'); // defaults to 1
    }

    setSearchParams(next);
  };

  // Toggle dynamic attribute option (multi-select with comma separation)
  const handleAttributeToggle = (key: string, value: string) => {
    const raw = searchParams.get(key) || '';
    const current = raw.split(',').map(s => s.trim()).filter(Boolean);
    let next: string[];
    if (current.includes(value)) {
      next = current.filter(v => v !== value);
    } else {
      next = [...current, value];
    }
    updateParams({ [key]: next.length > 0 ? next.join(',') : null });
  };

  // Fetch Products from Server
  const fetchProducts = () => {
    setLoading(true);

    const activeSearch = urlSearch || contextSearch || undefined;
    const apiParams: Record<string, any> = {
      page: String(urlPage),
      limit: String(ITEMS_PER_PAGE),
      sort: urlSort,
    };

    if (urlCategory) apiParams.category = urlCategory;
    if (urlBrand) apiParams.brand = urlBrand;
    if (activeSearch) apiParams.search = activeSearch;
    if (urlMinPrice) apiParams.minPrice = urlMinPrice;
    if (urlMaxPrice) apiParams.maxPrice = urlMaxPrice;
    if (urlInStock) apiParams.inStock = 'true';

    // Forward any dynamic attribute parameters from URL (e.g. ram, storage, size, color)
    searchParams.forEach((val, key) => {
      if (!['category', 'brand', 'search', 'sort', 'minPrice', 'maxPrice', 'inStock', 'page'].includes(key) && val) {
        apiParams[key] = val;
      }
    });

    browseProducts(apiParams)
      .then((res: any) => {
        const payload = res.data || {};
        setProducts(payload.products || []);
        setTotalProducts(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
        setLoading(false);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || err.message || "Failed to load products");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    // Only scroll window to top if user was scrolled down significantly
    if (typeof window !== 'undefined' && window.scrollY > 200) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [
    urlCategory,
    urlBrand,
    urlSearch,
    contextSearch,
    urlSort,
    urlMinPrice,
    urlMaxPrice,
    urlInStock,
    urlPage,
    searchParams.toString()
  ]);

  // Handlers
  const handleCategorySelect = (catSlug: string) => {
    // If clicking already selected category or empty string, toggle it off; otherwise switch category while preserving sort & stock
    if (urlCategory === catSlug || !catSlug) {
      updateParams({ category: null });
    } else {
      updateParams({ category: catSlug });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrandSelect = (brandSlug: string) => {
    updateParams({ brand: brandSlug === urlBrand ? null : (brandSlug || null) });
  };

  const handlePriceBracket = (bracket: { min: string; max: string }) => {
    // Toggle off if clicking the active bracket
    if (urlMinPrice === (bracket.min || '') && urlMaxPrice === (bracket.max || '')) {
      updateParams({ minPrice: null, maxPrice: null });
    } else {
      updateParams({ minPrice: bracket.min || null, maxPrice: bracket.max || null });
    }
  };

  const applyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ minPrice: customMin || null, maxPrice: customMax || null });
  };

  const handleInStockToggle = () => {
    updateParams({ inStock: urlInStock ? null : 'true' });
  };

  const handleSortChange = (newSort: string) => {
    updateParams({ sort: newSort });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === urlPage) return;
    updateParams({ page: String(newPage) }, false);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setCustomMin('');
    setCustomMax('');
  };

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Find active category label
  const activeCategoryName = useMemo(() => {
    if (!urlCategory) return 'All Collections';
    for (const cat of categoryTree) {
      if (cat.slug === urlCategory) return cat.name;
      const sub = cat.children?.find((c: any) => c.slug === urlCategory);
      if (sub) return `${cat.name} › ${sub.name}`;
    }
    return urlCategory;
  }, [urlCategory, categoryTree]);

  // Active dynamic attribute filters
  const activeDynamicFilters = useMemo(() => {
    const list: { key: string; label: string; values: string[] }[] = [];
    dynamicAttributeConfigs.forEach((cfg) => {
      const val = searchParams.get(cfg.key);
      if (val) {
        list.push({
          key: cfg.key,
          label: cfg.label,
          values: val.split(',').map(s => s.trim()).filter(Boolean),
        });
      }
    });
    return list;
  }, [dynamicAttributeConfigs, searchParams]);

  // Check active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (urlCategory) count++;
    if (urlBrand) count++;
    if (urlMinPrice || urlMaxPrice) count++;
    if (urlInStock) count++;
    if (urlSearch || contextSearch) count++;
    count += activeDynamicFilters.length;
    return count;
  }, [urlCategory, urlBrand, urlMinPrice, urlMaxPrice, urlInStock, urlSearch, contextSearch, activeDynamicFilters]);

  // Filtered brands by local search input
  const visibleBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    return brands.filter(b => b.name?.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brands, brandSearch]);

  // Active price bracket helper
  const isMatchingBracket = (min: string, max: string) => {
    return (urlMinPrice || '') === min && (urlMaxPrice || '') === max;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 md:pb-16 font-poppins text-white min-h-screen">
      {/* ── Top Header & Sorting Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight capitalize text-white">
              {activeCategoryName}
            </h1>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {activeFilterCount} Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {loading ? (
              <span>Updating results...</span>
            ) : totalProducts > 0 ? (
              <>
                Showing <span className="text-white font-medium">{(urlPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(urlPage * ITEMS_PER_PAGE, totalProducts)}</span> of{' '}
                <span className="text-white font-medium">{totalProducts}</span> products
                {(urlSearch || contextSearch) && <span className="text-orange-400 ml-1">for "{urlSearch || contextSearch}"</span>}
              </>
            ) : (
              <span>No products match the selected criteria.</span>
            )}
          </p>
        </div>

        {/* Action Controls: Mobile Filter Toggle + Server Sort Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button 
            onClick={() => setShowMobileFilter(true)}
            className="md:hidden flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border border-gray-800 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-200 transition-colors shadow-sm"
          >
            <FiSliders className="text-orange-500" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider hidden sm:inline">Sort:</span>
            <div className="relative">
              <select
                value={urlSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-[#141414] border border-gray-800 text-xs sm:text-sm text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition-colors cursor-pointer pr-8 appearance-none font-medium hover:border-gray-700"
              >
                <option value="newest">Latest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A &rarr; Z</option>
                <option value="name-desc">Name: Z &rarr; A</option>
                <option value="oldest">Oldest First</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Filter Pills Strip ── */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-gray-800/60">
          <span className="text-xs text-gray-400 font-semibold mr-1">Active:</span>

          {/* Category Pill */}
          {urlCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium">
              <span>Category: {activeCategoryName}</span>
              <button onClick={() => handleCategorySelect('')} className="hover:text-white transition-colors">
                <FiX size={12} />
              </button>
            </span>
          )}

          {/* Brand Pill */}
          {urlBrand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium">
              <span>Brand: {brands.find(b => b.slug === urlBrand)?.name || urlBrand}</span>
              <button onClick={() => updateParams({ brand: null })} className="hover:text-white transition-colors">
                <FiX size={12} />
              </button>
            </span>
          )}

          {/* Price Range Pill */}
          {(urlMinPrice || urlMaxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium">
              <span>
                Price:{' '}
                {urlMinPrice && urlMaxPrice
                  ? `${currency}${Number(urlMinPrice).toLocaleString()} – ${currency}${Number(urlMaxPrice).toLocaleString()}`
                  : urlMinPrice
                  ? `Above ${currency}${Number(urlMinPrice).toLocaleString()}`
                  : `Under ${currency}${Number(urlMaxPrice).toLocaleString()}`}
              </span>
              <button onClick={() => updateParams({ minPrice: null, maxPrice: null })} className="hover:text-white transition-colors">
                <FiX size={12} />
              </button>
            </span>
          )}

          {/* In Stock Pill */}
          {urlInStock && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border border-green-500/30 text-green-400 rounded-lg text-xs font-medium">
              <span>In Stock Only</span>
              <button onClick={() => updateParams({ inStock: null })} className="hover:text-white transition-colors">
                <FiX size={12} />
              </button>
            </span>
          )}

          {/* Dynamic Attribute Pills (e.g. Size, Color, RAM, Storage) */}
          {activeDynamicFilters.map(filter => (
            <span key={filter.key} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium">
              <span>{filter.label}: {filter.values.join(', ')}</span>
              <button onClick={() => updateParams({ [filter.key]: null })} className="hover:text-white transition-colors">
                <FiX size={12} />
              </button>
            </span>
          ))}

          {/* Search Query Pill */}
          {(urlSearch || contextSearch) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium">
              <span>Search: "{urlSearch || contextSearch}"</span>
              <button onClick={() => updateParams({ search: null })} className="hover:text-white transition-colors">
                <FiX size={12} />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-400 hover:text-orange-400 underline ml-2 transition-colors font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      {/* ── Main Catalog Content (Sidebar + Product Grid) ── */}
      <div className="flex gap-8 pt-6 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 flex-shrink-0 space-y-6 sticky top-24">
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <FiSliders className="text-orange-500" /> Filters & Categories
            </span>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-orange-400 hover:underline">
                Reset All
              </button>
            )}
          </div>

          {/* In-Stock Only Toggle Switch */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">In-Stock Only</p>
              <p className="text-[11px] text-gray-500">Hide sold out inventory</p>
            </div>
            <button
              type="button"
              onClick={handleInStockToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                urlInStock ? 'bg-orange-500' : 'bg-[#222]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  urlInStock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Nested Category Tree */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <FiBox className="text-orange-500" /> Department Tree
            </h3>

            <button
              onClick={() => handleCategorySelect('')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                urlCategory === '' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-[#1A1A1A]'
              }`}
            >
              All Categories
            </button>

            <div className="space-y-1 mt-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
              {categoryTree.map((cat: any) => {
                const isSelected = urlCategory === cat.slug;
                const isExpanded = !!expandedCategories[cat.id];
                const hasChildren = cat.children && cat.children.length > 0;

                return (
                  <div key={cat.id} className="space-y-1">
                    <div 
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                        isSelected ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-[#1A1A1A]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {hasChildren && (
                        <button 
                          onClick={(e) => toggleExpand(cat.id, e)} 
                          className="p-1 hover:text-orange-400 text-gray-400"
                          title="Toggle subcategories"
                        >
                          {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasChildren && isExpanded && (
                      <div className="pl-3 space-y-1 border-l-2 border-orange-500/20 ml-3 my-1">
                        {cat.children.map((sub: any) => {
                          const isSubSelected = urlCategory === sub.slug;
                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleCategorySelect(sub.slug)}
                              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition truncate ${
                                isSubSelected 
                                  ? 'bg-orange-500/20 text-orange-400 font-bold' 
                                  : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                              }`}
                            >
                              {sub.name}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Dynamic Category Attribute Facets (Amazon / Flipkart Architecture) ── */}
          {dynamicAttributeConfigs.map((cfg: any) => {
            if (!cfg.options || cfg.options.length === 0) return null;
            const raw = searchParams.get(cfg.key) || '';
            const selectedVals = raw.split(',').map(s => s.trim()).filter(Boolean);

            return (
              <div key={cfg.id} className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FiTag className="text-orange-500" size={12} />
                    <span>{cfg.label} {cfg.unit ? `(${cfg.unit})` : ''}</span>
                  </h3>
                  {selectedVals.length > 0 && (
                    <button
                      onClick={() => updateParams({ [cfg.key]: null })}
                      className="text-[11px] text-orange-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
                  {cfg.options.map((opt: string) => {
                    const isChecked = selectedVals.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleAttributeToggle(cfg.key, opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                            : 'bg-black/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                        }`}
                      >
                        <span>{opt}</span>
                        {isChecked && <FiCheck size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Quick Price Brackets + Custom Inputs */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Range</h3>
            
            {/* Quick Brackets */}
            <div className="space-y-1.5">
              {PRICE_BRACKETS.map((bracket, idx) => {
                const active = isMatchingBracket(bracket.min, bracket.max);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePriceBracket(bracket)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                      active ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <span>{bracket.label}</span>
                    {active && <FiCheck className="text-orange-400" size={14} />}
                  </button>
                );
              })}
            </div>

            {/* Custom Min / Max Form */}
            <form onSubmit={applyCustomPrice} className="pt-2 border-t border-gray-800 space-y-2">
              <span className="text-[11px] text-gray-500 font-medium">Custom Range ({currency.trim()})</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-2 text-xs text-white outline-none focus:border-orange-500 transition-colors"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl p-2 text-xs text-white outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#1F1F1F] hover:bg-orange-500 hover:text-white text-gray-300 font-semibold text-xs rounded-xl transition-colors border border-gray-800"
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* Brands Filter */}
          {brands.length > 0 && (
            <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brands</h3>
                {urlBrand && (
                  <button onClick={() => updateParams({ brand: null })} className="text-[11px] text-orange-400 hover:underline">
                    Clear
                  </button>
                )}
              </div>

              {/* Brand Search input if more than 5 brands */}
              {brands.length > 5 && (
                <div className="relative mb-2">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
              )}

              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
                <label 
                  onClick={() => handleBrandSelect('')}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                    urlBrand === '' ? 'text-orange-400 font-bold bg-orange-500/10' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${urlBrand === '' ? 'border-orange-500 bg-orange-500' : 'border-gray-700'}`}>
                    {urlBrand === '' && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </span>
                  <span>All Brands</span>
                </label>

                {visibleBrands.map((b: any) => {
                  const isChecked = urlBrand === b.slug;
                  return (
                    <label 
                      key={b.id} 
                      onClick={() => handleBrandSelect(b.slug)}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                        isChecked ? 'text-orange-400 font-bold bg-orange-500/10' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isChecked ? 'border-orange-500 bg-orange-500' : 'border-gray-700'}`}>
                        {isChecked && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </span>
                      <span className="truncate">{b.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* ── Product Grid & Pagination Section ── */}
        <main className="flex-1 w-full min-w-0 min-h-[650px]">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#141414] rounded-2xl p-3 border border-gray-800 space-y-3">
                  <div className="bg-[#1F1F1F] rounded-xl aspect-[4/5] w-full" />
                  <div className="h-3 bg-[#1F1F1F] rounded w-1/3" />
                  <div className="h-4 bg-[#1F1F1F] rounded w-3/4" />
                  <div className="h-4 bg-[#1F1F1F] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="text-center py-24 px-4 bg-[#141414] rounded-3xl border border-gray-800/80 max-w-xl mx-auto my-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
                <FiBox className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Products Found</h2>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
                We couldn't find any items matching your active filter criteria. Try clearing some filters or searching for another term.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-500/20"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            /* Products Grid */
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((p) => (
                  <ProductItem
                    key={p.id}
                    slug={p.slug}
                    image={p.primaryImage}
                    name={p.name}
                    price={p.cheapestPrice}
                    brand={p.brand?.name || "AkMart"}
                    variantId={p.variants?.[0]?.id}
                  />
                ))}
              </div>

              {/* ── Numbered Server Pagination Bar ── */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-800/80">
                  <p className="text-xs text-gray-400">
                    Page <span className="font-bold text-white">{urlPage}</span> of{' '}
                    <span className="font-bold text-white">{totalPages}</span>
                  </p>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(urlPage - 1)}
                      disabled={urlPage <= 1}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141414] border border-gray-800 text-gray-300 hover:bg-[#1F1F1F] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Previous Page"
                    >
                      <FiChevronLeft size={16} />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((pNum) => {
                        return (
                          pNum === 1 ||
                          pNum === totalPages ||
                          (pNum >= urlPage - 1 && pNum <= urlPage + 1)
                        );
                      })
                      .map((pNum, index, arr) => {
                        const prevNum = arr[index - 1];
                        const showEllipsis = prevNum && pNum - prevNum > 1;

                        return (
                          <React.Fragment key={pNum}>
                            {showEllipsis && (
                              <span className="px-2 text-gray-600 text-xs select-none">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(pNum)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                                urlPage === pNum
                                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                                  : 'bg-[#141414] border border-gray-800 text-gray-300 hover:bg-[#1F1F1F] hover:text-white'
                              }`}
                            >
                              {pNum}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(urlPage + 1)}
                      disabled={urlPage >= totalPages}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-[#141414] border border-gray-800 text-gray-300 hover:bg-[#1F1F1F] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      aria-label="Next Page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Mobile Filter Slide-Over Drawer ── */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowMobileFilter(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer Sheet */}
          <div className="relative w-full max-w-xs bg-[#0F0F0F] border-l border-gray-800 h-full flex flex-col z-10 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiSliders className="text-orange-500" />
                <span className="font-bold text-sm text-white uppercase tracking-wider">Filters & Refinements</span>
              </div>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-gray-400 hover:text-white"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* In-Stock Toggle */}
              <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">In-Stock Only</p>
                  <p className="text-[10px] text-gray-500">Hide sold out items</p>
                </div>
                <button
                  type="button"
                  onClick={handleInStockToggle}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    urlInStock ? 'bg-orange-500' : 'bg-[#222]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      urlInStock ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Dynamic Category Attributes for Mobile Drawer */}
              {dynamicAttributeConfigs.map((cfg: any) => {
                if (!cfg.options || cfg.options.length === 0) return null;
                const raw = searchParams.get(cfg.key) || '';
                const selectedVals = raw.split(',').map(s => s.trim()).filter(Boolean);

                return (
                  <div key={cfg.id}>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      {cfg.label} {cfg.unit ? `(${cfg.unit})` : ''}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cfg.options.map((opt: string) => {
                        const isChecked = selectedVals.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAttributeToggle(cfg.key, opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                              isChecked
                                ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                                : 'bg-[#141414] border-gray-800 text-gray-300 hover:text-white'
                            }`}
                          >
                            <span>{opt}</span>
                            {isChecked && <FiCheck size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</h4>
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold mb-1 transition ${
                    urlCategory === '' ? 'bg-orange-500 text-white' : 'text-gray-300 bg-[#141414]'
                  }`}
                >
                  All Categories
                </button>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {categoryTree.map((cat: any) => {
                    const isSelected = urlCategory === cat.slug;
                    const hasChildren = cat.children && cat.children.length > 0;
                    return (
                      <div key={cat.id} className="space-y-1">
                        <button
                          onClick={() => handleCategorySelect(cat.slug)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                            isSelected ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-[#1A1A1A]'
                          }`}
                        >
                          <span>{cat.name}</span>
                          {isSelected && <FiCheck size={14} />}
                        </button>
                        {hasChildren && (
                          <div className="pl-4 space-y-1 border-l-2 border-orange-500/20 ml-2">
                            {cat.children.map((sub: any) => {
                              const isSubSelected = urlCategory === sub.slug;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => handleCategorySelect(sub.slug)}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                                    isSubSelected
                                      ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30'
                                      : 'text-gray-400 hover:text-white'
                                  }`}
                                >
                                  <span>{sub.name}</span>
                                  {isSubSelected && <FiCheck size={12} />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Price Brackets</h4>
                <div className="space-y-1.5">
                  {PRICE_BRACKETS.map((bracket, idx) => {
                    const active = isMatchingBracket(bracket.min, bracket.max);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePriceBracket(bracket)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition flex items-center justify-between ${
                          active ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30' : 'text-gray-400 bg-[#141414]'
                        }`}
                      >
                        <span>{bracket.label}</span>
                        {active && <FiCheck className="text-orange-400" size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Brands</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {brands.map((b: any) => (
                      <button
                        key={b.id}
                        onClick={() => handleBrandSelect(b.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition ${
                          urlBrand === b.slug ? 'text-orange-400 font-bold bg-orange-500/10' : 'text-gray-400 hover:bg-[#1A1A1A]'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with mobile safe clearance */}
            <div className="p-4 pb-8 sm:pb-4 border-t border-gray-800 bg-[#141414] flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 bg-[#1F1F1F] hover:bg-[#252525] text-gray-300 font-semibold text-xs rounded-xl transition"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
