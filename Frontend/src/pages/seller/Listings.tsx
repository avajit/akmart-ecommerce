import React, { useEffect, useState, useMemo, useContext } from 'react';
import { getListings, updateListing, deleteListing } from '../../api/seller.api';
import { ShopContext } from '../../context/ShopContext';
import { toast } from 'react-toastify';
import { 
  FiTag, 
  FiTrash2, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle, 
  FiSearch, 
  FiPlus, 
  FiBox, 
  FiTrendingUp, 
  FiRefreshCw,
  FiDollarSign,
  FiLayers
} from 'react-icons/fi';

type ListingFilterTab = 'ALL' | 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'INACTIVE';

export default function Listings() {
  const { currency } = useContext(ShopContext) || { currency: 'NPR ' };
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ListingFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingListing, setDeletingListing] = useState<any | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = () => {
    setLoading(true);
    getListings()
      .then((res: any) => {
        setListings(res.data || []);
        setLoading(false);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || err.message || 'Failed to load listings');
        setLoading(false);
      });
  };

  const handleUpdate = async (id: string, field: string, value: any) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return toast.error("Invalid numeric value");
    
    setUpdatingId(id);
    try {
      await updateListing(id, { [field]: numValue });
      toast.success("Listing updated successfully");
      // Local optimistic update
      setListings(prev => prev.map(l => {
        if (l.id === id) {
          const updated = { ...l, [field]: numValue };
          if (field === 'stock') {
            updated.availableStock = numValue - (l.reservedStock || 0);
          }
          return updated;
        }
        return l;
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to update listing");
      fetchListings();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickRestock = async (id: string, currentStock: number, addQty: number) => {
    const newStock = currentStock + addQty;
    await handleUpdate(id, 'stock', newStock);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setUpdatingId(id);
    try {
      await updateListing(id, { isActive: !currentActive });
      toast.success(`Listing ${!currentActive ? 'activated' : 'deactivated'}`);
      setListings(prev => prev.map(l => l.id === id ? { ...l, isActive: !currentActive } : l));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to toggle status");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingListing) return;
    try {
      await deleteListing(deletingListing.id);
      toast.success("Listing removed from store");
      setListings(prev => prev.filter(l => l.id !== deletingListing.id));
      setDeletingListing(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.message || "Failed to delete listing");
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    let activeCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockUnits = 0;

    listings.forEach(l => {
      if (l.isActive) activeCount += 1;
      const avail = l.availableStock ?? (l.stock - (l.reservedStock || 0));
      if (avail <= 0) {
        outOfStockCount += 1;
      } else if (avail <= 5) {
        lowStockCount += 1;
      }
      totalStockUnits += (l.stock || 0);
    });

    return {
      total: listings.length,
      active: activeCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalUnits: totalStockUnits,
    };
  }, [listings]);

  // Filtered listings
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const avail = l.availableStock ?? (l.stock - (l.reservedStock || 0));

      if (activeTab === 'ACTIVE' && !l.isActive) return false;
      if (activeTab === 'INACTIVE' && l.isActive) return false;
      if (activeTab === 'LOW_STOCK' && (avail > 5 || avail <= 0)) return false;
      if (activeTab === 'OUT_OF_STOCK' && avail > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const productName = (l.variant?.product?.name || '').toLowerCase();
        const variantName = (l.variant?.name || '').toLowerCase();
        const sku = (l.variant?.sku || '').toLowerCase();

        return productName.includes(q) || variantName.includes(q) || sku.includes(q);
      }

      return true;
    });
  }, [listings, activeTab, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Inventory & Pricing</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 uppercase">Manage Listings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Control live selling price, physical warehouse stock, and catalog availability</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchListings}
            disabled={loading}
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#242424] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-semibold transition"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Refresh Inventory"}
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Listings</span>
            <FiLayers className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{metrics.total}</p>
          <span className="text-[11px] text-gray-500 mt-1">{metrics.totalUnits} total units in stock</span>
        </div>

        <div className="bg-[#141414] border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active in Store</span>
            <FiCheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-4">{metrics.active}</p>
          <span className="text-[11px] text-emerald-500/70 mt-1">Live for shoppers</span>
        </div>

        <div className="bg-[#141414] border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Warning</span>
            <FiAlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-4">{metrics.lowStock}</p>
          <span className="text-[11px] text-amber-500/70 mt-1">5 or fewer units remaining</span>
        </div>

        <div className="bg-[#141414] border border-rose-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <FiXCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-4">{metrics.outOfStock}</p>
          <span className="text-[11px] text-rose-500/70 mt-1">Needs urgent restocking</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'ALL'
                ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            All Listings ({metrics.total})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Active ({metrics.active})
          </button>
          <button
            onClick={() => setActiveTab('LOW_STOCK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'LOW_STOCK'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Low Stock ({metrics.lowStock})
          </button>
          <button
            onClick={() => setActiveTab('OUT_OF_STOCK')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'OUT_OF_STOCK'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Out of Stock ({metrics.outOfStock})
          </button>
          <button
            onClick={() => setActiveTab('INACTIVE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'INACTIVE'
                ? 'bg-gray-700 text-white font-bold'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
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
            <p className="mt-3 text-xs">Loading listings catalog...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-[#141414] rounded-2xl border border-gray-800">
            <FiBox className="w-10 h-10 mx-auto text-gray-600 mb-2" />
            <p className="text-sm font-bold text-white">No Listings Found</p>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? `No listings match "${searchQuery}"` : 'No listings in this view.'}
            </p>
          </div>
        ) : (
          filteredListings.map((l: any) => {
            const avail = l.availableStock ?? (l.stock - (l.reservedStock || 0));
            const isUpdating = updatingId === l.id;

            return (
              <div key={l.id} className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 space-y-3.5 shadow-lg">
                {/* Header: Name, SKU, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm truncate">{l.variant?.product?.name || "Product"}</h3>
                    <p className="text-xs text-orange-400 font-medium mt-0.5">{l.variant?.name}</p>
                    <span className="font-mono text-[10px] text-gray-400 bg-black/60 px-2 py-0.5 rounded border border-gray-800 mt-1 inline-block">
                      SKU: {l.variant?.sku}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleActive(l.id, l.isActive)}
                    disabled={isUpdating}
                    className="focus:outline-none shrink-0"
                    title="Toggle active status"
                  >
                    {l.isActive ? (
                      <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase tracking-wide">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px] font-bold bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-md uppercase tracking-wide">
                        INACTIVE
                      </span>
                    )}
                  </button>
                </div>

                {/* Price and Stock Inputs Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-black/40 border border-gray-800 rounded-xl p-2.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Price ({currency.trim()})
                    </label>
                    <input 
                      type="number" 
                      defaultValue={l.price} 
                      disabled={isUpdating}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== l.price) handleUpdate(l.id, 'price', val);
                      }}
                      className="w-full bg-[#161616] border border-gray-700/80 rounded-lg p-2 text-white font-bold text-xs focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div className="bg-black/40 border border-gray-800 rounded-xl p-2.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Stock Units
                    </label>
                    <input 
                      type="number" 
                      defaultValue={l.stock} 
                      disabled={isUpdating}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (val !== l.stock) handleUpdate(l.id, 'stock', val);
                      }}
                      className={`w-full bg-[#161616] border rounded-lg p-2 font-bold text-xs focus:border-orange-500 outline-none ${
                        avail <= 0 ? 'border-rose-500/60 text-rose-400' : avail <= 5 ? 'border-amber-500/60 text-amber-400' : 'border-gray-700/80 text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Quick Restock & Delete Action Bar */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">Restock:</span>
                    <button
                      onClick={() => handleQuickRestock(l.id, l.stock, 5)}
                      disabled={isUpdating}
                      className="bg-[#1F1F1F] hover:bg-orange-500 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-800 transition"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleQuickRestock(l.id, l.stock, 10)}
                      disabled={isUpdating}
                      className="bg-[#1F1F1F] hover:bg-orange-500 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-800 transition"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleQuickRestock(l.id, l.stock, 25)}
                      disabled={isUpdating}
                      className="bg-[#1F1F1F] hover:bg-orange-500 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-800 transition"
                    >
                      +25
                    </button>
                  </div>

                  <button 
                    onClick={() => setDeletingListing(l)}
                    className="text-gray-400 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition"
                    title="Delete listing"
                  >
                    <FiTrash2 size={16} />
                  </button>
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
                <th className="p-4">Product / SKU</th>
                <th className="p-4">Status</th>
                <th className="p-4">Selling Price ({currency.trim()})</th>
                <th className="p-4">Inventory Units</th>
                <th className="p-4">Quick Restock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-400">
                    <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-3 text-xs">Loading listings catalog...</p>
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-500">
                    <FiBox size={32} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-base text-gray-300 font-bold">No Listings Found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchQuery ? `No listings match "${searchQuery}"` : 'No listings in this view.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredListings.map((l: any) => {
                  const avail = l.availableStock ?? (l.stock - (l.reservedStock || 0));
                  const isUpdating = updatingId === l.id;

                  return (
                    <tr key={l.id} className="hover:bg-[#1A1A1A] transition-colors">
                      {/* Product Name & SKU */}
                      <td className="p-4">
                        <p className="text-white font-bold text-sm">{l.variant?.product?.name || "Product"}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{l.variant?.name}</p>
                        <span className="font-mono text-[10px] text-gray-500 bg-black/40 px-1.5 py-0.5 rounded border border-gray-800 mt-1 inline-block">
                          SKU: {l.variant?.sku}
                        </span>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(l.id, l.isActive)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 focus:outline-none"
                          title="Click to toggle active status"
                        >
                          {l.isActive ? (
                            <span className="text-emerald-400 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase tracking-wide hover:bg-emerald-500/20 transition">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px] font-bold bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-md uppercase tracking-wide hover:bg-gray-700 transition">
                              INACTIVE
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Price Input */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{currency.trim()}</span>
                          <input 
                            type="number" 
                            defaultValue={l.price} 
                            disabled={isUpdating}
                            onBlur={(e) => {
                              if (Number(e.target.value) !== Number(l.price)) {
                                handleUpdate(l.id, 'price', e.target.value);
                              }
                            }}
                            className="bg-black border border-gray-800 rounded-xl p-2 text-white w-28 text-xs outline-none focus:border-orange-500 font-semibold transition"
                          />
                        </div>
                      </td>

                      {/* Stock & Availability */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              defaultValue={l.stock} 
                              disabled={isUpdating}
                              onBlur={(e) => {
                                if (Number(e.target.value) !== Number(l.stock)) {
                                  handleUpdate(l.id, 'stock', e.target.value);
                                }
                              }}
                              className="bg-black border border-gray-800 rounded-xl p-2 text-white w-20 text-xs outline-none focus:border-orange-500 font-semibold transition"
                            />
                            <span className="text-xs text-gray-400">Total units</span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-0.5">
                            {avail <= 0 ? (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                Out of Stock
                              </span>
                            ) : avail <= 5 ? (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                Only {avail} Available!
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {avail} Available
                              </span>
                            )}
                            {Boolean(l.reservedStock && l.reservedStock > 0) && (
                              <span className="text-[10px] text-gray-500">
                                ({l.reservedStock} reserved)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Quick Restock Buttons */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleQuickRestock(l.id, l.stock, 5)}
                            disabled={isUpdating}
                            className="bg-[#1F1F1F] hover:bg-[#282828] text-gray-300 hover:text-white px-2 py-1 rounded-lg text-[11px] font-bold border border-gray-800 transition"
                            title="Add 5 units to warehouse stock"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleQuickRestock(l.id, l.stock, 10)}
                            disabled={isUpdating}
                            className="bg-[#1F1F1F] hover:bg-[#282828] text-gray-300 hover:text-white px-2 py-1 rounded-lg text-[11px] font-bold border border-gray-800 transition"
                            title="Add 10 units to warehouse stock"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleQuickRestock(l.id, l.stock, 25)}
                            disabled={isUpdating}
                            className="bg-[#1F1F1F] hover:bg-[#282828] text-gray-300 hover:text-white px-2 py-1 rounded-lg text-[11px] font-bold border border-gray-800 transition"
                            title="Add 25 units to warehouse stock"
                          >
                            +25
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => setDeletingListing(l)}
                          className="text-gray-400 hover:text-rose-400 transition p-2 rounded-xl hover:bg-gray-800"
                          title="Delete listing"
                        >
                          <FiTrash2 size={16} />
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

      {/* Delete Confirmation Modal */}
      {deletingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <FiTrash2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Deactivate Listing</h3>
                <p className="text-xs text-gray-400">Remove product variant from public store</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to deactivate listing for <span className="font-bold text-white">{deletingListing.variant?.product?.name} ({deletingListing.variant?.name})</span>? Shoppers will no longer be able to purchase this variant from your shop.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingListing(null)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition min-h-[44px]"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition min-h-[44px]"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
