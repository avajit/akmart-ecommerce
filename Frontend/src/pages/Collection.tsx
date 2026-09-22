import React, { useEffect, useState, useContext } from 'react';
import { browseProducts, getCategoryTree } from '../api/consumer.api';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

export default function Collection() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '' });
  const navigate = useNavigate();

  const { search } = useContext(ShopContext) || { search: '' };
  
  useEffect(() => {
    getCategoryTree().then((res: any) => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    // Merge local filters with global search
    const apiFilters = { ...filters };
    if (search) (apiFilters as any).search = search;
    
    browseProducts(apiFilters).then((res: any) => {
      setProducts(res.data?.products || []);
      setLoading(false);
    });
  }, [filters, search]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t border-gray-800 items-start max-w-7xl mx-auto px-4">
      <div className="min-w-60 sticky top-20 text-white">
        <p className="my-2 text-xl font-medium uppercase">Filters</p>
        <div className="border-b border-gray-800 py-6">
          <p className="mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</p>
          <div className="flex flex-col gap-2">
            <label className="flex gap-3 cursor-pointer text-sm">
              <input type="radio" name="cat" value="" onChange={() => setFilters({...filters, category: ''})} /> All
            </label>
            {categories.map(c => (
              <label key={c.id} className="flex gap-3 cursor-pointer text-sm hover:text-emerald-500">
                <input type="radio" name="cat" value={c.slug} onChange={() => setFilters({...filters, category: c.slug})} /> {c.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl text-white font-bold">ALL COLLECTIONS</h1>
        </div>
        
        {loading ? (
          <div className="text-gray-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-gray-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group cursor-pointer">
                <div className="overflow-hidden rounded-lg bg-gray-900 border border-gray-800 aspect-square flex items-center justify-center">
                  {p.primaryImage ? (
                    <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                     <span className="text-gray-600">No Image</span>
                  )}
                </div>
                <p className="pt-3 pb-1 text-sm text-gray-300 font-medium truncate">{p.name}</p>
                <p className="text-sm text-emerald-500 font-bold">Starting at NPR {p.variants?.[0]?.listings?.[0]?.price || 'N/A'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
