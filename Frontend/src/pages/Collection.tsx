import React, { useEffect, useState, useContext } from 'react';
import { browseProducts, getCategoryTree, getBrands } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { FiFilter, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  const [filters, setFilters] = useState({
    category: urlCategory,
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const { search } = useContext(ShopContext) || { search: '' };

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: urlCategory }));
  }, [urlCategory]);

  useEffect(() => {
    getCategoryTree().then((res: any) => {
      setCategoryTree(res.data || []);
      // Auto-expand parents if a child is selected
      const roots = res.data || [];
      const expanded: Record<string, boolean> = {};
      roots.forEach((root: any) => {
        if (root.slug === urlCategory || root.children?.some((c: any) => c.slug === urlCategory)) {
          expanded[root.id] = true;
        }
      });
      setExpandedCategories(expanded);
    });

    getBrands().then((res: any) => setBrands(res.data || []));
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const apiFilters: any = { ...filters };
    const activeSearch = urlSearch || search;
    if (activeSearch) apiFilters.search = activeSearch;
    if (!apiFilters.minPrice) delete apiFilters.minPrice;
    if (!apiFilters.maxPrice) delete apiFilters.maxPrice;
    if (!apiFilters.category) delete apiFilters.category;
    if (!apiFilters.brand) delete apiFilters.brand;

    browseProducts(apiFilters)
      .then((res: any) => {
        let items = res.data?.products || [];
        if (filters.sort === 'price-low') {
          items = [...items].sort((a, b) => (Number(a.cheapestPrice) || 0) - (Number(b.cheapestPrice) || 0));
        } else if (filters.sort === 'price-high') {
          items = [...items].sort((a, b) => (Number(b.cheapestPrice) || 0) - (Number(a.cheapestPrice) || 0));
        }
        setProducts(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, search, urlSearch]);

  const handleCategorySelect = (catSlug: string) => {
    setFilters(prev => ({ ...prev, category: catSlug }));
    if (catSlug) {
      setSearchParams({ category: catSlug });
    } else {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  const toggleExpand = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins text-white">
      {/* Top Banner & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
            {filters.category ? `${filters.category} Collection` : 'All Collections'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Showing <span className="text-white font-medium">{products.length}</span> results {(urlSearch || search) && <span>for "{urlSearch || search}"</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="sm:hidden flex items-center gap-2 bg-[#1A1A1A] border border-gray-800 px-4 py-2 rounded-xl text-sm text-gray-300"
          >
            <FiFilter /> Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-semibold">Sort:</span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="bg-[#1A1A1A] border border-gray-800 text-sm text-white rounded-xl px-3 py-2 outline-none focus:border-orange-500"
            >
              <option value="newest">Latest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 pt-6 items-start">
        {/* Filters Sidebar */}
        <div className={`w-full sm:w-72 flex-shrink-0 ${showMobileFilter ? 'block' : 'hidden sm:block'} space-y-6 sticky top-24`}>
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-300">Category Tree & Filters</span>
            {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
              <button onClick={clearFilters} className="text-xs text-orange-400 hover:underline">
                Reset All
              </button>
            )}
          </div>

          {/* Nested Category Tree */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4">
            <button
              onClick={() => handleCategorySelect('')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition ${
                filters.category === '' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-[#1A1A1A]'
              }`}
            >
              All Categories
            </button>

            <div className="space-y-1 mt-2 max-h-80 overflow-y-auto pr-1">
              {categoryTree.map((cat: any) => {
                const isSelected = filters.category === cat.slug;
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
                      <span>{cat.name}</span>
                      {hasChildren && (
                        <button 
                          onClick={(e) => toggleExpand(cat.id, e)} 
                          className="p-1 hover:text-orange-400"
                        >
                          {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasChildren && isExpanded && (
                      <div className="pl-4 space-y-1 border-l border-gray-800 ml-3 my-1">
                        {cat.children.map((sub: any) => {
                          const isSubSelected = filters.category === sub.slug;
                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleCategorySelect(sub.slug)}
                              className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                                isSubSelected ? 'bg-orange-500/20 text-orange-400 font-bold' : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
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

          {/* Brands */}
          {brands.length > 0 && (
            <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Brands</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <label className="flex items-center gap-2.5 text-sm text-gray-300 hover:text-white cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    checked={filters.brand === ''}
                    onChange={() => setFilters({ ...filters, brand: '' })}
                    className="text-orange-500 focus:ring-orange-500 bg-black border-gray-700"
                  />
                  All Brands
                </label>
                {brands.map((b: any) => (
                  <label key={b.id} className="flex items-center gap-2.5 text-sm text-gray-300 hover:text-white cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      checked={filters.brand === b.slug}
                      onChange={() => setFilters({ ...filters, brand: b.slug })}
                      className="text-orange-500 focus:ring-orange-500 bg-black border-gray-700"
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price (NPR)</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#141414] rounded-2xl aspect-[4/5] border border-gray-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-[#141414] rounded-2xl border border-gray-800">
              <p className="text-lg text-gray-300 font-semibold mb-1">No products found</p>
              <p className="text-sm text-gray-500">Try selecting a different category or resetting filters.</p>
              {(filters.category || filters.brand || filters.minPrice || filters.maxPrice || urlSearch || search) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-5 py-2.5 bg-orange-500 text-white font-semibold text-xs rounded-xl hover:bg-orange-600 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductItem
                  key={p.id}
                  slug={p.slug}
                  image={p.primaryImage}
                  name={p.name}
                  price={p.cheapestPrice}
                  brand={p.brand?.name || "AkMart"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
