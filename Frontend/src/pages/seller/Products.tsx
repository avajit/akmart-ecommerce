import React, { useEffect, useState } from 'react';
import { getSellerProducts, createListing, submitProduct } from '../../api/seller.api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBox, FiPlus, FiTag, FiClock, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListingModal, setShowListingModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [listingForm, setListingForm] = useState({ price: '', stock: '' });
  const navigate = useNavigate();

  useEffect(() => {
    getSellerProducts().then((res: any) => {
      setProducts(res.data?.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <span className="text-gray-400 text-[10px] font-bold bg-gray-800 px-2.5 py-1 rounded-md uppercase tracking-wide">DRAFT</span>;
      case 'PENDING_REVIEW': return <span className="text-amber-400 text-[10px] font-bold bg-amber-500/10 px-2.5 py-1 rounded-md uppercase tracking-wide border border-amber-500/35">PENDING</span>;
      case 'APPROVED': return <span className="text-orange-400 text-[10px] font-bold bg-orange-500/10 px-2.5 py-1 rounded-md uppercase tracking-wide border border-orange-500/35">APPROVED</span>;
      case 'REJECTED': return <span className="text-rose-400 text-[10px] font-bold bg-rose-500/10 px-2.5 py-1 rounded-md uppercase tracking-wide border border-rose-500/35">REJECTED</span>;
      default: return null;
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;
    try {
      await createListing({
        variantId: selectedVariant.id,
        price: Number(listingForm.price),
        mrp: Number(listingForm.price) + 500,
        stock: Number(listingForm.stock)
      });
      toast.success("Listing created successfully!");
      setShowListingModal(false);
      navigate('/seller/listings');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Error creating listing");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-800">
        <div>
          <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Inventory</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 uppercase">My Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your catalog items and create listings</p>
        </div>
        <Link 
          to="/seller/products/new" 
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <FiPlus /> Add New Product
        </Link>
      </div>

      <div className="bg-[#141414] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/60 border-b border-gray-800 text-xs text-gray-400 uppercase tracking-wider font-semibold">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Variants</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-500">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-500">No products found. Start by adding one!</td></tr>
              ) : (
                products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        {p.primaryImage ? (
                          <img src={p.primaryImage} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-800" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-black border border-gray-800 flex items-center justify-center text-gray-600 text-xs">Img</div>
                        )}
                        <div>
                          <p className="text-white font-bold">{p.name}</p>
                          <p className="text-gray-400 text-xs font-mono">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 text-xs">{p.category?.name}</td>
                    <td className="p-4">{getStatusBadge(p.status)}</td>
                    <td className="p-4 text-gray-300 text-xs font-semibold">
                       {p.variants?.length || 0}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 items-center justify-end">
                        {p.status === 'DRAFT' && (
                          <button 
                            onClick={async () => {
                              try {
                                await submitProduct(p.id);
                                toast.success("Submitted for review");
                                window.location.reload();
                              } catch (err: any) {
                                toast.error(err.response?.data?.error?.message || "Error submitting");
                              }
                            }}
                            className="text-xs bg-orange-500/15 hover:bg-orange-500 text-orange-400 hover:text-white px-3 py-1.5 rounded-xl font-semibold transition"
                          >
                            Submit
                          </button>
                        )}
                        {p.status === 'APPROVED' && p.variants?.[0]?.hasListing && (
                          <Link to="/seller/listings" className="text-xs bg-[#1A1A1A] hover:bg-[#222222] border border-gray-800 text-gray-300 px-3 py-1.5 rounded-xl font-semibold transition">
                            Manage Listing
                          </Link>
                        )}
                        {p.status === 'APPROVED' && !p.variants?.[0]?.hasListing && (
                          <button 
                            onClick={() => {
                              if (!p.variants?.[0]?.id) return toast.error("No variant found");
                              setSelectedVariant(p.variants[0]);
                              setListingForm({ price: '', stock: '' });
                              setShowListingModal(true);
                            }}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl font-bold transition shadow-sm"
                          >
                            Create Listing
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-poppins">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Create Listing</h2>
              <p className="text-xs text-gray-400 mt-1">Set your selling price and inventory stock.</p>
            </div>
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selling Price (NPR)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={listingForm.price}
                  onChange={e => setListingForm({...listingForm, price: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                  placeholder="e.g. 1500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Available Stock</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={listingForm.stock}
                  onChange={e => setListingForm({...listingForm, stock: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500" 
                  placeholder="e.g. 50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowListingModal(false)} className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow">Launch Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
