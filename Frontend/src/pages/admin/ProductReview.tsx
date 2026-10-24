import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { approveProduct, rejectProduct, getAllProductsAdmin } from '../../api/admin.api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function ProductReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProductsAdmin({ status: 'ALL' }).then((res: any) => {
      const p = res.data?.products?.find((p: any) => p.id === id);
      setProduct(p);
      setLoading(false);
    }).catch((err: any) => { toast.error(err.response?.data?.message || err.message || 'Failed to load product'); setLoading(false); });
  }, [id]);

  const handleApprove = async () => {
    try {
      await approveProduct(id!);
      toast.success("Product approved successfully!");
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Error approving product");
    }
  };

  const handleReject = async () => {
    if (!reason || reason.length < 5) return toast.error("Provide a valid rejection reason (min 5 chars)");
    try {
      await rejectProduct(id!, reason);
      toast.success("Product rejected");
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Error rejecting product");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center font-poppins text-white">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading product review...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center font-poppins text-white">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <button onClick={() => navigate('/admin/products')} className="text-orange-400 hover:underline text-sm">
          &larr; Back to product review queue
        </button>
      </div>
    );
  }

  const isPending = product.status === 'PENDING_REVIEW';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="mb-8 pb-6 border-b border-gray-800">
        <button onClick={() => navigate('/admin/products')} className="text-xs text-orange-400 hover:underline flex items-center gap-1 mb-2">
          <FiArrowLeft /> Back to Review Queue
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Review Product</h1>
        <p className="text-sm text-gray-400 mt-0.5">{product.name}</p>
      </div>
      
      <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl mb-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Status</span>
          <span className="text-xs font-bold px-3 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/30 uppercase">
            {product.status}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-800">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Description</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{product.description || "No description."}</p>
        </div>
        
        {isPending ? (
          <div className="pt-4 border-t border-gray-800">
            <button 
              onClick={handleApprove} 
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg shadow-orange-500/25 flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <FiCheckCircle /> Approve Product
            </button>
          </div>
        ) : (
          <p className="text-amber-400 text-xs mt-2 font-medium">
            Note: Only products in PENDING_REVIEW state can be approved or rejected.
          </p>
        )}
      </div>

      {isPending && (
        <div className="bg-[#141414] border border-rose-900/50 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-rose-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FiXCircle /> Reject Product
          </h3>
          <textarea 
            placeholder="Provide a detailed reason for rejection..." 
            className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500" 
            rows={3}
            value={reason} 
            onChange={e => setReason(e.target.value)}
          />
          <button 
            onClick={handleReject} 
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-xl transition text-xs uppercase tracking-wider shadow"
          >
            Confirm Rejection
          </button>
        </div>
      )}
    </div>
  );
}
