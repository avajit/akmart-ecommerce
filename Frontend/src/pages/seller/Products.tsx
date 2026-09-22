import React, { useEffect, useState } from 'react';
import { getSellerProducts } from '../../api/seller.api';
import { Link } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                    <div className="flex gap-3">
                      <button className="text-emerald-500 hover:text-emerald-400 font-medium text-sm">View</button>
                      {p.status === 'DRAFT' && (
                        <button 
                          onClick={async () => {
                            try {
                              await import('../../api/seller.api').then(m => m.submitProduct(p.id));
                              import('react-toastify').then(m => m.toast.success("Submitted for review"));
                              window.location.reload();
                            } catch (err: any) {
                              import('react-toastify').then(m => m.toast.error(err.response?.data?.error?.message || "Error submitting"));
                            }
                          }}
                          className="text-blue-500 hover:text-blue-400 font-medium text-sm"
                        >
                          Submit
                        </button>
                      )}
                      {p.status === 'APPROVED' && (
                        <button 
                          onClick={async () => {
                            if (!p.variants?.[0]?.id) return import('react-toastify').then(m => m.toast.error("No variant found"));
                            const price = prompt("Enter Price (NPR):", "1000");
                            if (!price) return;
                            const stock = prompt("Enter Stock:", "10");
                            if (!stock) return;
                            try {
                              await import('../../api/seller.api').then(m => m.createListing({
                                variantId: p.variants[0].id,
                                price: Number(price),
                                mrp: Number(price) + 500,
                                stock: Number(stock)
                              }));
                              import('react-toastify').then(m => m.toast.success("Listing created! Go to Listings tab to manage it."));
                            } catch (err: any) {
                              import('react-toastify').then(m => m.toast.error(err.response?.data?.error?.message || "Error creating listing"));
                            }
                          }}
                          className="text-amber-500 hover:text-amber-400 font-medium text-sm"
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
  );
}
