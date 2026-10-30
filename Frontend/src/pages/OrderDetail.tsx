import React, { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, cancelOrder } from '../api/order.api';
import { 
  FiCheckCircle, 
  FiTruck, 
  FiPackage, 
  FiPrinter, 
  FiClock, 
  FiArrowRight, 
  FiMapPin, 
  FiCopy, 
  FiCheck,
  FiXCircle,
  FiShoppingBag,
  FiDollarSign,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const [copied, setCopied] = useState(false);

  // Fetch order from API (or initialize from location.state if present)
  const { data: orderData, isLoading, error, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: Boolean(id),
    initialData: location.state?.order ? { success: true, data: location.state.order } : undefined,
  });

  const order = orderData?.data || orderData;

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrder(id!),
    onSuccess: () => {
      toast.success("Order cancelled successfully and inventory restored!");
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    }
  });

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this order? Items will be returned to inventory.")) {
      cancelMutation.mutate();
    }
  };

  const copyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast.info("Order ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="w-16 h-16 bg-[#161616] border border-gray-800 rounded-2xl flex items-center justify-center mx-auto text-rose-500 mb-4">
          <FiAlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">
          We couldn't find an order with ID <span className="font-mono text-orange-400">{id}</span>. It may belong to another account or does not exist.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
          >
            My Orders
          </button>
          <button
            onClick={() => navigate('/collection')}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl text-xs font-semibold transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const steps = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Received & Queued' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Packed by Seller' },
    { key: 'SHIPPED', label: 'In Transit', desc: 'Out with Courier' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Doorstep Received' },
  ];

  const currentStepIndex = isCancelled ? -1 : 
    order.status === 'DELIVERED' ? 3 :
    order.status === 'SHIPPED' ? 2 :
    order.status === 'CONFIRMED' ? 1 : 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-poppins">
      
      {/* ── 1. Order Confirmation Banner ── */}
      <div className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isCancelled 
                ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20' 
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
            }`}>
              {isCancelled ? <FiXCircle className="w-8 h-8" /> : <FiCheckCircle className="w-8 h-8" />}
            </div>
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isCancelled
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>
                {isCancelled ? 'Order Cancelled' : 'Order Confirmed & Placed'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>Order #{order.id.substring(0, 8).toUpperCase()}</span>
                <button
                  onClick={copyOrderId}
                  className="p-1 text-gray-500 hover:text-white transition"
                  title="Copy full Order ID"
                >
                  {copied ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-xl text-xs font-semibold transition"
            >
              <FiPrinter className="w-3.5 h-3.5" /> Print Receipt
            </button>
            <Link
              to="/orders"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20"
            >
              All Orders <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── 2. Interactive Delivery Tracking Stepper ── */}
        {!isCancelled && (
          <div className="mt-8 pt-6 border-t border-gray-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-6">
              Nepal Delivery Status / डेलिभरी स्थिति
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPassed 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-800 text-gray-500'
                      }`}>
                        {isPassed ? <FiCheck size={12} /> : idx + 1}
                      </div>
                      <div className={`h-1 flex-1 rounded-full ${
                        idx < currentStepIndex ? 'bg-orange-500' : 'bg-gray-800'
                      }`} />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isPassed ? 'text-white' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="mt-6 pt-5 border-t border-gray-800/80 flex items-center gap-3 text-xs text-rose-400 bg-rose-500/10 p-3.5 rounded-2xl border border-rose-500/20">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <p>
              This order was cancelled. Reserved quantities have been safely restored to seller stock.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Purchased Items & Delivery Destination */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Purchased Items */}
          <div className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 shadow-xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400 mb-4 flex items-center justify-between">
              <span>Items Purchased ({order.items?.length || 0})</span>
              <span className="text-xs font-normal text-gray-400 font-mono">
                Rs. {Number(order.totalAmount).toLocaleString('en-IN')}
              </span>
            </h2>

            <div className="divide-y divide-gray-800/60">
              {order.items?.map((item: any) => {
                const price = Number(item.priceAtPurchase || 0);
                return (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-14 h-14 object-cover rounded-xl border border-gray-800 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-black border border-gray-800 rounded-xl flex items-center justify-center text-gray-600">
                          <FiPackage className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        {item.productSlug ? (
                          <Link 
                            to={`/product/${item.productSlug}`}
                            className="font-bold text-sm text-white hover:text-orange-400 transition"
                          >
                            {item.productName}
                          </Link>
                        ) : (
                          <p className="font-bold text-sm text-white">{item.productName}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">Variant: {item.variantName}</p>
                        <p className="text-[11px] text-gray-400">Sold by: {item.shopName || 'AKMart Seller'}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <p className="text-sm font-bold text-white">
                        Rs. {price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      <p className="text-xs text-orange-400 font-semibold mt-0.5">
                        Rs. {(price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping & Delivery Address */}
          <div className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
              <FiMapPin /> Delivery Address / डेलिभरी ठेगाना
            </h2>
            {order.shippingAddress ? (
              <div className="space-y-1 text-xs text-gray-300">
                <p className="font-bold text-white text-sm">{order.shippingAddress.fullName}</p>
                <p className="text-orange-400 font-mono">Phone: {order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                <p>
                  District: <strong className="text-white">{order.shippingAddress.district || 'Nepal'}</strong> | {order.shippingAddress.state} ({order.shippingAddress.zipCode})
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Address recorded on invoice.</p>
            )}

            {/* Delivery Notes */}
            {order.deliveryNotes && (
              <div className="mt-3 p-3 bg-black/40 border border-amber-500/20 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400">Customer Delivery Instructions:</span>
                <p className="text-xs text-gray-200 italic">"{order.deliveryNotes}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Financial Summary & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Financial Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">Rs. {Number(order.subtotal || order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Standard Delivery (Nepal)</span>
                <span className="font-mono text-white">
                  {Number(order.deliveryFee) === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase">FREE</span>
                  ) : (
                    `Rs. ${Number(order.deliveryFee).toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-mono">-Rs. {Number(order.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-800 flex justify-between items-baseline text-white">
                <span className="font-bold text-sm">Total Amount</span>
                <span className="font-mono font-black text-xl text-orange-400">
                  Rs. {Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-black/40 border border-gray-800 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-gray-400">Payment Channel</span>
              <p className="text-white font-semibold flex items-center gap-1.5">
                <FiDollarSign className="text-orange-400" />
                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}
              </p>
              <p className="text-[11px] text-gray-400">
                Pay in cash upon doorstep arrival. Exact change appreciated.
              </p>
            </div>

            {/* Cancel Action (if pending or confirmed) */}
            {!isCancelled && (order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling Order..." : "Cancel Order & Restock"}
              </button>
            )}

            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><FiShield className="text-emerald-400" /> Genuine Products</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><FiTruck className="text-orange-400" /> Nepal Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
