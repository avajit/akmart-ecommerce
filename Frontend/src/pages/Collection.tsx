import React, { useEffect, useState, useContext } from 'react';
import { browseProducts, getCategoryTree, getBrands } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem';
import { FiFilter, FiChevronDown, FiX } from 'react-icons/fi';

export default function Collection() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const { search } = useContext(ShopContext) || { search: '' };

  useEffect(() => {
    getCategoryTree().then((res: any) => setCategories(res.data || []));
    getBrands().then((res: any) => setBrands(res.data || []));
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const apiFilters: any = { ...filters };
    if (search) apiFilters.search = search;
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
  }, [filters, search]);

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">ALL COLLECTIONS</h1>
          <p className="text-sm text-gray-400 mt-1">
            Showing <span className="text-white font-medium">{products.length}</span> results {search && <span>for "{search}"</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="sm:hidden flex items-center gap-2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg text-sm text-gray-300"
          >
            <FiFilter /> Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-semibold">Sort By:</span>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="bg-gray-900 border border-gray-800 text-sm text-white rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
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
        <div className={`w-full sm:w-64 flex-shrink-0 ${showMobileFilter ? 'block' : 'hidden sm:block'} space-y-6 sticky top-24`}>
          <div className="flex justify-between items-center pb-2 border-b border-gray-800">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Refine By</span>
            {(filters.category || filters.brand || filters.minPrice || filters.maxPrice) && (
              <button onClick={clearFilters} className="text-xs text-emerald-400 hover:underline">
                Reset All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-2.5 text-sm text-gray-300 hover:text-white cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === ''}
                  onChange={() => setFilters({ ...filters, category: '' })}
                  className="text-emerald-500 focus:ring-emerald-500 bg-black border-gray-700"
                />
                All Categories
              </label>
              {categories.map((c: any) => (
                <label key={c.id} className="flex items-center gap-2.5 text-sm text-gray-300 hover:text-white cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === c.slug}
                    onChange={() => setFilters({ ...filters, category: c.slug })}
                    className="text-emerald-500 focus:ring-emerald-500 bg-black border-gray-700"
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Brands</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <label className="flex items-center gap-2.5 text-sm text-gray-300 hover:text-white cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    checked={filters.brand === ''}
                    onChange={() => setFilters({ ...filters, brand: '' })}
                    className="text-emerald-500 focus:ring-emerald-500 bg-black border-gray-700"
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
                      className="text-emerald-500 focus:ring-emerald-500 bg-black border-gray-700"
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price (NPR)</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full bg-black border border-gray-700 rounded-lg p-2 text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 rounded-xl aspect-square border border-gray-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/40 rounded-2xl border border-gray-800">
              <p className="text-lg text-gray-300 font-semibold mb-1">No products found</p>
              <p className="text-sm text-gray-500">Try changing your search keywords or filter criteria.</p>
              {(filters.category || filters.brand || filters.minPrice || filters.maxPrice || search) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-emerald-500 text-black font-semibold text-xs rounded-lg hover:bg-emerald-400 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-6">
              {products.map((p) => (
                <ProductItem
                  key={p.id}
                  slug={p.slug}
                  image={p.primaryImage}
                  name={p.name}
                  price={p.cheapestPrice}
                  bestseller={p.reviewCount > 5}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
