import React, { useEffect, useState, useMemo } from 'react';
import { getAllProductsAdmin } from '../../api/admin.api';
import { useNavigate } from 'react-router-dom';
import { 
  FiBox, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiSearch, 
  FiArrowRight, 
  FiRefreshCw, 
  FiLayers,
  FiShoppingBag
} from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = () => {
    setLoading(true);
    getAllProductsAdmin(statusFilter === 'ALL' ? {} : { status: statusFilter })
      .then((res: any) => {
        setProducts(res.data?.products || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const shop = (p.createdBy?.sellerProfile?.shopName || p.createdBy?.fullName || '').toLowerCase();
      const cat = (p.category?.name || '').toLowerCase();
      const brand = (p.brand?.name || '').toLowerCase();
      return name.includes(q) || shop.includes(q) || cat.includes(q) || brand.includes(q);
    });
  }, [products, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Catalog Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 uppercase">Product Moderation</h1>
          <p className="text-sm text-gray-400 mt-0.5">Review seller catalog submissions, approve verified listings, or request compliance revisions</p>
        </div>

        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#242424] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-semibold transition self-start md:self-auto"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing..." : "Refresh Catalog"}
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('PENDING_REVIEW')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'PENDING_REVIEW'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            <FiClock size={13} />
            Pending Review
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            <FiCheckCircle size={13} />
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            <FiXCircle size={13} />
            Rejected
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'ALL'
                ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            All Products
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Search title, seller, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/80 transition"
          />
        </div>
      </div>

      {/* ── MOBILE CARD VIEW (< md) ── */}
      <div className="block md:hidden space-y-3.5">
        {loading ? (
          <div className="p-12 text-center text-gray-400 bg-[#141414] rounded-2xl border border-gray-800">
            <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs">Loading moderation queue...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-[#141414] rounded-2xl border border-gray-800">
            <FiBox className="w-10 h-10 mx-auto text-gray-600 mb-2" />
            <p className="text-sm font-bold text-white">No Products Found</p>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? `No products match "${searchQuery}"` : 'No submissions found in this status.'}
            </p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const shop = p.createdBy?.sellerProfile?.shopName || p.createdBy?.fullName || "AkMart Supplier";
            const variantCount = p._count?.variants || p.variants?.length || 0;

            return (
              <div 
                key={p.id}
                onClick={() => navigate(`/admin/products/${p.id}`)}
                className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 space-y-3 shadow-lg active:border-orange-500/50 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm truncate">{p.name}</h3>
                    <p className="text-xs text-orange-400/90 font-medium mt-0.5">{shop}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      p.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : p.status === 'PENDING_REVIEW'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : p.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span className="bg-black/50 border border-gray-800 px-2 py-0.5 rounded text-[11px]">
                    {p.category?.name || "General"}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <FiLayers size={11} /> {variantCount} variant{variantCount !== 1 ? 's' : ''}
                  </span>
                  {p.brand?.name && (
                    <span className="text-[11px] text-gray-400">
                      • Brand: {p.brand.name}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-800/80">
                  <div className="w-full py-2.5 bg-[#1A1A1A] hover:bg-orange-500 text-gray-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                    Review Submission <FiArrowRight size={13} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP TABLE VIEW (>= md) ── */}
      <div className="hidden md:block bg-[#141414] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/60 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                <th className="p-4">Product Name</th>
                <th className="p-4">Supplier / Merchant</th>
                <th className="p-4">Category & Taxa</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-400">
                    <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-3 text-xs">Loading moderation queue...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-gray-500">
                    <FiBox size={32} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-base text-gray-300 font-bold">No Products Found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchQuery ? `No products match "${searchQuery}"` : 'No submissions found in this status.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const shop = p.createdBy?.sellerProfile?.shopName || p.createdBy?.fullName || "AkMart Supplier";
                  const variantCount = p._count?.variants || p.variants?.length || 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                      className="hover:bg-[#1A1A1A] cursor-pointer transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-bold text-white text-sm group-hover:text-orange-400 transition">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <FiLayers size={11} />
                            {variantCount} variant{variantCount !== 1 ? 's' : ''}
                          </span>
                          {p.brand?.name && (
                            <>
                              <span className="text-gray-600">&bull;</span>
                              <span className="text-[11px] text-gray-400">Brand: {p.brand.name}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-white font-medium text-xs block">{shop}</span>
                        <span className="text-[10px] text-gray-500">Merchant Partner</span>
                      </td>

                      <td className="p-4">
                        <span className="text-xs text-gray-300 bg-black/40 border border-gray-800 px-2.5 py-1 rounded-lg inline-block">
                          {p.category?.name || "General"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'PENDING_REVIEW'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : p.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/products/${p.id}`);
                          }}
                          className="px-3.5 py-1.5 bg-[#1F1F1F] hover:bg-orange-500 text-gray-300 hover:text-white rounded-xl text-xs font-bold border border-gray-800 hover:border-orange-500 transition inline-flex items-center gap-1.5 shadow"
                        >
                          Review <FiArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
