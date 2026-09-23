import React, { useEffect, useState } from 'react';
import { getSellerProducts, createListing, submitProduct } from '../../api/seller.api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    });
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'DRAFT': return <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-xs font-bold">DRAFT</span>;
      case 'PENDING_REVIEW': return <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold">PENDING</span>;
      case 'APPROVED': return <span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">APPROVED</span>;
      case 'REJECTED': return <span className="bg-red-500/20 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold">REJECTED</span>;
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
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Products</h1>
          <p className="text-gray-400 mt-1">Manage your catalog</p>
        </div>
        <Link to="/seller/products/new" className="bg-emerald-500 text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-400 transition-colors">
          Add New Product
        </Link>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="p-4 text-gray-400 font-medium">Product</th>
              <th className="p-4 text-gray-400 font-medium">Category</th>
              <th className="p-4 text-gray-400 font-medium">Status</th>
              <th className="p-4 text-gray-400 font-medium">Variants</th>
              <th className="p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No products found. Start by adding one!</td></tr>
            ) : (
              products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {p.primaryImage ? (
                        <img src={p.primaryImage} alt="" className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">?</div>
                      )}
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        <p className="text-gray-500 text-xs">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{p.category?.name}</td>
                  <td className="p-4">{getStatusBadge(p.status)}</td>
                  <td className="p-4 text-gray-300">
                     {p.variants?.length || 0}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3 items-center">
                      <button className="text-emerald-500 hover:text-emerald-400 font-medium text-sm">View</button>
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
                          className="text-blue-500 hover:text-blue-400 font-medium text-sm"
                        >
                          Submit
                        </button>
                      )}
                      {p.status === 'APPROVED' && p.variants?.[0]?.hasListing && (
                        <Link to="/seller/listings" className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1.5 rounded hover:bg-gray-700 font-medium text-sm transition-colors">
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
                          className="bg-amber-500/20 text-amber-500 border border-amber-500/50 px-3 py-1.5 rounded hover:bg-amber-500 hover:text-black font-medium text-sm transition-colors"
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

      {/* Create Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Create Listing</h2>
              <p className="text-sm text-gray-400 mt-1">Set your selling price and inventory stock.</p>
            </div>
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Selling Price (NPR)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={listingForm.price}
                  onChange={e => setListingForm({...listingForm, price: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
                  placeholder="e.g. 1500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Available Stock</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={listingForm.stock}
                  onChange={e => setListingForm({...listingForm, stock: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500" 
                  placeholder="e.g. 50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowListingModal(false)} className="px-4 py-2 rounded-lg font-medium text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-emerald-500 text-black px-6 py-2 rounded-lg font-bold hover:bg-emerald-400">Launch Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
