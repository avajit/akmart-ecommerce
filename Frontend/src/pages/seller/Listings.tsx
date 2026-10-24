import React, { useEffect, useState } from 'react';
import { getListings, updateListing, deleteListing } from '../../api/seller.api';
import { toast } from 'react-toastify';
import { FiTag, FiTrash2 } from 'react-icons/fi';

export default function Listings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = () => {
    getListings().then((res: any) => {
      setListings(res.data || []);
      setLoading(false);
    }).catch((err: any) => { toast.error(err.response?.data?.message || err.message || 'Failed to load listings'); setLoading(false); });
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return toast.error("Invalid value");
    try {
      await updateListing(id, { [field]: numValue });
      toast.success("Updated successfully");
      fetchListings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to update listing");
      fetchListings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="mb-8 pb-6 border-b border-gray-800">
        <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Inventory & Pricing</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 uppercase">Manage Listings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Update your pricing and stock in real-time</p>
      </div>

      <div className="bg-[#141414] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/60 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                <th className="p-4">Product / Variant</th>
                <th className="p-4">Status</th>
                <th className="p-4">Price (NPR)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Available</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-500">Loading listings...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-gray-500">No active listings found.</td></tr>
              ) : (
                listings.map((l: any) => (
                  <tr key={l.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="p-4">
                      <p className="text-white font-bold">{l.variant?.product?.name}</p>
                      <p className="text-gray-400 text-xs">{l.variant?.name} (SKU: {l.variant?.sku})</p>
                    </td>
                    <td className="p-4">
                      {l.isActive ? (
                        <span className="text-orange-400 text-[10px] font-bold bg-orange-500/10 px-2.5 py-1 rounded-md uppercase tracking-wide">ACTIVE</span>
                      ) : (
                        <span className="text-gray-400 text-[10px] font-bold bg-gray-800 px-2.5 py-1 rounded-md uppercase tracking-wide">INACTIVE</span>
                      )}
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        defaultValue={l.price} 
                        onBlur={(e) => {
                           if(Number(e.target.value) !== Number(l.price)) handleUpdate(l.id, 'price', e.target.value)
                        }}
                        className="bg-black border border-gray-800 rounded-xl p-2.5 text-white w-28 text-xs outline-none focus:border-orange-500 font-semibold"
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        defaultValue={l.stock} 
                        onBlur={(e) => {
                           if(Number(e.target.value) !== Number(l.stock)) handleUpdate(l.id, 'stock', e.target.value)
                        }}
                        className="bg-black border border-gray-800 rounded-xl p-2.5 text-white w-28 text-xs outline-none focus:border-orange-500 font-semibold"
                      />
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold">{l.availableStock}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={async () => {
                          if(confirm('Are you sure you want to delete this listing?')) {
                            try {
                              await deleteListing(l.id);
                              toast.success("Listing deleted");
                              fetchListings();
                            } catch (err: any) {
                              toast.error(err.response?.data?.error?.message || "Failed to delete listing");
                            }
                          }
                        }}
                        className="text-gray-400 hover:text-rose-400 transition p-2 rounded-xl hover:bg-gray-800"
                        title="Delete listing"
                      >
                        <FiTrash2 size={16} />
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
  );
}
