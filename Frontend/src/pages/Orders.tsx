import React, { useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, cancelOrder } from '../api/order.api';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiShoppingBag, 
  FiArrowRight, 
  FiXCircle, 
  FiAlertCircle,
  FiMapPin,
  FiCreditCard
} from 'react-icons/fi';
import { toast } from 'react-toastify';

// Interactive Visual Tracking Stepper (Flipkart / Amazon style)
const OrderTrackingStepper = ({ status }: { status: string }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2.5">
        <FiXCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <div>
          <span className="font-bold">Order Cancelled</span>
          <p className="text-gray-400 text-[11px] mt-0.5">This purchase was cancelled and merchant stock has been released.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', key: 'PENDING' },
    { label: 'Confirmed', key: 'CONFIRMED' },
    { label: 'Out for Delivery', key: 'SHIPPED' },
    { label: 'Delivered', key: 'DELIVERED' },
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'PENDING': return 0;
      case 'PROCESSING':
      case 'CONFIRMED': return 1;
      case 'SHIPPED': return 2;
      case 'DELIVERED': return 3;
      default: return 1;
    }
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between max-w-xl mx-auto">
        {/* Background Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-gray-800 z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-orange-500 transition-all duration-500 z-0" 
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30' 
                    : 'bg-[#1F1F1F] text-gray-500 border border-gray-700'
                } ${isCurrent ? 'ring-4 ring-orange-500/20 scale-110' : ''}`}
              >
                {idx < currentIdx ? (
                  <FiCheckCircle size={14} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={`text-[10px] mt-2 font-semibold tracking-wide text-center max-w-[65px] sm:max-w-none leading-tight sm:whitespace-nowrap ${
                isCurrent ? 'text-orange-400 font-bold' : isDone ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <FiClock className="w-3.5 h-3.5" /> Order Placed
        </span>
      );
    case 'PROCESSING':
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <FiPackage className="w-3.5 h-3.5" /> Confirmed / Packing
        </span>
      );
    case 'SHIPPED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
          <FiTruck className="w-3.5 h-3.5" /> Out for Delivery
        </span>
      );
    case 'DELIVERED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <FiCheckCircle className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <FiXCircle className="w-3.5 h-3.5" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-300">
          {status}
        </span>
      );
  }
};

export default function Orders() {
  const { currency } = useContext(ShopContext) || { currency: 'NPR ' };
  const queryClient = useQueryClient();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(null);

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  });

  const orders = (ordersRes as any)?.data || [];

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Order cancelled successfully and inventory restored.");
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setCancellingOrderId(null);
      setConfirmingCancelId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to cancel order");
      setCancellingOrderId(null);
      setConfirmingCancelId(null);
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Retrieving your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="w-20 h-20 bg-[#141414] rounded-3xl flex items-center justify-center mx-auto mb-5 border border-gray-800 text-orange-400 shadow-xl">
          <FiPackage className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Orders Placed Yet</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
          Your order history is currently empty. Browse our latest arrivals and place your first order.
        </p>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider"
        >
          Start Shopping <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-6 sm:pt-10 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 font-poppins text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">My Orders</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Live delivery tracking and purchase records</p>
        </div>
        <Link 
          to="/collection" 
          className="text-xs font-bold text-orange-400 hover:text-orange-300 uppercase tracking-wider flex items-center gap-1.5 transition"
        >
          <span>Continue Shopping</span>
          <FiArrowRight />
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-8">
        {orders.map((order: any) => {
          const items = order.items || [];
          const address = order.shippingAddress;
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          const isCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED';
          const isCancelling = cancellingOrderId === order.id;

          return (
            <div
              key={order.id}
              className="bg-[#141414] border border-gray-800/80 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Order Card Header */}
              <div className="bg-black/60 px-6 py-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-4 text-xs">
                <div className="flex flex-wrap gap-6 items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Placed On</p>
                    <p className="text-white font-medium mt-0.5">{orderDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total Amount</p>
                    <p className="text-white font-extrabold mt-0.5">
                      {currency}{Number(order.totalAmount).toLocaleString()}
                    </p>
                    {order.couponCode && (
                      <span className="text-[10px] text-emerald-400 font-medium block">
                        Saved with {order.couponCode}
                      </span>
                    )}
                  </div>
                  {address && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Destination</p>
                      <p className="text-gray-300 font-medium mt-0.5 truncate max-w-xs">{address.fullName} ({address.city})</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Reference ID</p>
                    <p className="text-gray-400 font-mono text-xs mt-0.5">#{order.id.slice(0, 8)}</p>
                  </div>

                  {/* Cancel Button with in-place verification */}
                  {isCancellable && (
                    confirmingCancelId === order.id ? (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        <button
                          id={`confirm-cancel-${order.id.slice(0, 8)}`}
                          onClick={() => {
                            setCancellingOrderId(order.id);
                            cancelMutation.mutate(order.id);
                          }}
                          disabled={isCancelling}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm active:scale-95 disabled:opacity-40"
                        >
                          {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                        <button
                          onClick={() => setConfirmingCancelId(null)}
                          className="px-2.5 py-1.5 rounded-xl text-[11px] text-gray-400 hover:text-white bg-[#1A1A1A] border border-gray-800 transition"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`cancel-order-${order.id.slice(0, 8)}`}
                        onClick={() => setConfirmingCancelId(order.id)}
                        disabled={isCancelling}
                        className="px-3.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition disabled:opacity-40"
                      >
                        Cancel Order
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Interactive Tracking Stepper */}
              <div className="px-6 py-4 bg-[#111111] border-b border-gray-800/80">
                <OrderTrackingStepper status={order.status} />
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-gray-800/70">
                {items.map((item: any) => {
                  const productName = item.productName || item.sellerListing?.variant?.product?.name || "Product";
                  const productSlug = item.productSlug || item.sellerListing?.variant?.product?.slug || "";
                  const variantName = item.variantName || item.sellerListing?.variant?.name || "Standard";
                  const shopName = item.shopName || item.sellerListing?.sellerProfile?.shopName || "Verified Vendor";
                  const imageUrl =
                    item.imageUrl ||
                    item.sellerListing?.variant?.images?.[0]?.url ||
                    item.sellerListing?.variant?.product?.images?.[0]?.url;
                  const itemPrice = Number(item.priceAtPurchase || 0);

                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl border border-gray-800 overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-gray-600 flex items-center justify-center h-full">No Img</span>
                          )}
                        </div>

                        <div>
                          {productSlug ? (
                            <Link to={`/product/${productSlug}`} className="text-white font-bold hover:text-orange-400 transition text-sm">
                              {productName}
                            </Link>
                          ) : (
                            <span className="text-white font-bold text-sm">{productName}</span>
                          )}
                          <p className="text-xs text-gray-400 mt-0.5">
                            {variantName} &bull; Sold by <span className="text-gray-300 font-medium">{shopName}</span>
                          </p>
                          <p className="text-xs text-white font-semibold mt-1">
                            Qty: {item.quantity} &times; {currency}{itemPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <StatusBadge status={item.status || order.status} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Details Footer */}
              {address && (
                <div className="bg-black/40 px-6 py-3.5 border-t border-gray-800 text-xs text-gray-400 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin className="text-orange-500 shrink-0" />
                    <span>
                      <strong>Destination:</strong> {address.street}, {address.city}, {address.state} (Phone: {address.phone})
                    </span>
                  </span>
                  <span className="text-orange-400 font-semibold uppercase tracking-wider text-[11px] bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                    Payment: {order.paymentMethod}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
