import React, { useEffect, useState } from 'react';
import { getAllSellersAdmin, verifySeller, suspendSeller } from '../../api/admin.api';
import { toast } from 'react-toastify';

export default function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);

  const fetchSellers = () => {
    getAllSellersAdmin().then((res: any) => setSellers(res.data?.sellers || []));
  };

  useEffect(() => fetchSellers(), []);

  const handleVerify = async (id: string) => {
    try {
      await verifySeller(id);
      toast.success("Seller verified!");
      fetchSellers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Verification failed");
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await suspendSeller(id);
      toast.warning("Seller suspended!");
      fetchSellers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to suspend");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Seller Verification</h1>
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="p-4 text-gray-400 font-medium">Shop Name</th>
              <th className="p-4 text-gray-400 font-medium">User Email</th>
              <th className="p-4 text-gray-400 font-medium">Status</th>
              <th className="p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sellers.map(s => (
              <tr key={s.id}>
                <td className="p-4 text-white font-medium">{s.shopName}</td>
                <td className="p-4 text-gray-300">{s.user?.email}</td>
                <td className="p-4 text-gray-300">{s.verificationStatus}</td>
                <td className="p-4 space-x-2">
                  {s.verificationStatus === 'PENDING' && <button onClick={() => handleVerify(s.id)} className="bg-emerald-500 text-black px-3 py-1 rounded text-sm font-bold">Verify</button>}
                  {s.verificationStatus === 'VERIFIED' && <button onClick={() => handleSuspend(s.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">Suspend</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
