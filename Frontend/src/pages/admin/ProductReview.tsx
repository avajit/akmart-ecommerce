import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { approveProduct, rejectProduct, getAllProductsAdmin } from '../../api/admin.api';
import { toast } from 'react-toastify';

export default function ProductReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    // Hacky way to get product by ID since we lack a specific endpoint
    getAllProductsAdmin({ status: 'ALL' }).then((res: any) => {
      const p = res.data?.products?.find((p: any) => p.id === id);
      setProduct(p);
    });
  }, [id]);

  const handleApprove = async () => {
    try {
      await approveProduct(id!);
      toast.success("Product approved!");
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Error approving");
    }
  };

  const handleReject = async () => {
    if (!reason || reason.length < 5) return toast.error("Provide a valid reason (min 5 chars)");
    try {
      await rejectProduct(id!, reason);
      toast.success("Product rejected");
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Error rejecting");
    }
  };

  if (!product) return <div className="text-white text-center py-20">Loading...</div>;

  const isPending = product.status === 'PENDING_REVIEW';

  return (
    <div className="max-w-4xl mx-auto py-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Review Product: {product.name}</h1>
      
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-8">
        <p className="text-gray-400 mb-4">Status: <strong className="text-white">{product.status}</strong></p>
        
        {isPending ? (
          <div className="flex gap-4 mt-8">
            <button onClick={handleApprove} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-6 rounded-lg">Approve</button>
          </div>
        ) : (
          <p className="text-yellow-500 mt-4">You can only approve or reject products that are in PENDING_REVIEW state. This product is currently {product.status}.</p>
        )}
      </div>

      {isPending && (
        <div className="bg-gray-900 p-6 rounded-2xl border border-red-900/50">
          <h3 className="text-red-500 font-bold mb-2">Reject Product</h3>
          <textarea 
            placeholder="Reason for rejection..." 
            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white mb-4" 
            value={reason} 
            onChange={e => setReason(e.target.value)}
          />
          <button onClick={handleReject} className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-6 rounded-lg">Reject</button>
        </div>
      )}
    </div>
  );
}
