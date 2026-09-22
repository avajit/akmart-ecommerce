import React, { useEffect, useState } from 'react';
import { getAllProductsAdmin } from '../../api/admin.api';
import { useNavigate } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const navigate = useNavigate();

  useEffect(() => {
    getAllProductsAdmin(statusFilter === 'ALL' ? {} : { status: statusFilter }).then((res: any) => {
      setProducts(res.data?.products || []);
    });
  }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Product Moderation</h1>
        <select 
          className="bg-gray-900 border border-gray-800 text-white p-2 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All Products</option>
        </select>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="p-4 text-gray-400 font-medium">Product</th>
              <th className="p-4 text-gray-400 font-medium">Seller</th>
              <th className="p-4 text-gray-400 font-medium">Category</th>
              <th className="p-4 text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {products.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No products found in this status.</td></tr>
            ) : products.map(p => (
              <tr key={p.id} onClick={() => navigate(`/admin/products/${p.id}`)} className="hover:bg-gray-800/30 cursor-pointer transition-colors">
                <td className="p-4 text-white">{p.name}</td>
                <td className="p-4 text-gray-300">{p.createdBy?.sellerProfile?.shopName || p.createdBy?.fullName}</td>
                <td className="p-4 text-gray-300">{p.category?.name}</td>
                <td className="p-4 text-sm font-bold text-gray-300">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
