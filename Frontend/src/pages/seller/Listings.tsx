import React, { useEffect, useState } from 'react';
import { getListings, updateListing } from '../../api/seller.api';
import { toast } from 'react-toastify';

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
    });
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return toast.error("Invalid value");
    try {
      await updateListing(id, { [field]: numValue });
      toast.success("Updated successfully");
      fetchListings();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to update");
      fetchListings(); // revert
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Listings</h1>
        <p className="text-gray-400 mt-1">Update your pricing and stock in real-time</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="p-4 text-gray-400 font-medium">Product / Variant</th>
              <th className="p-4 text-gray-400 font-medium">Status</th>
              <th className="p-4 text-gray-400 font-medium">Price (NPR)</th>
              <th className="p-4 text-gray-400 font-medium">Stock</th>
              <th className="p-4 text-gray-400 font-medium">Available</th>
              <th className="p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading listings...</td></tr>
            ) : listings.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No active listings.</td></tr>
            ) : (
              listings.map((l: any) => (
                <tr key={l.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium">{l.variant?.product?.name}</p>
                    <p className="text-gray-400 text-sm">{l.variant?.name} (SKU: {l.variant?.sku})</p>
                  </td>
                  <td className="p-4">
                    {l.isActive ? (
                      <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">ACTIVE</span>
                    ) : (
                      <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">INACTIVE</span>
                    )}
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={l.price} 
                      onBlur={(e) => {
                         if(Number(e.target.value) !== Number(l.price)) handleUpdate(l.id, 'price', e.target.value)
                      }}
                      className="bg-black border border-gray-700 rounded p-2 text-white w-24 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={l.stock} 
                      onBlur={(e) => {
                         if(Number(e.target.value) !== Number(l.stock)) handleUpdate(l.id, 'stock', e.target.value)
                      }}
                      className="bg-black border border-gray-700 rounded p-2 text-white w-24 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="p-4">
                    <span className="text-white font-bold">{l.availableStock}</span>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={async () => {
                        if(confirm('Are you sure you want to delete this listing?')) {
                          try {
                            await import('../../api/seller.api').then(m => m.deleteListing(l.id));
                            toast.success("Listing deleted");
                            fetchListings();
                          } catch (err: any) {
                            toast.error(err.response?.data?.error?.message || "Failed to delete listing");
                          }
                        }
                      }}
                      className="text-red-500 hover:text-red-400 font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
