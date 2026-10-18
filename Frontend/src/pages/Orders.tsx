import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../api/order.api';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
          <FiCheckCircle className="w-3.5 h-3.5" /> Delivered
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          Cancelled
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

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  });

  const orders = (ordersRes as any)?.data || [];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
          <FiPackage className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          You haven't placed any orders yet. Check out our latest products and exclusive deals.
        </p>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-sm"
        >
          Start Shopping <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage your order history</p>
        </div>
        <Link to="/collection" className="text-sm font-semibold text-orange-400 hover:underline">
          Shop More &rarr;
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order: any) => {
          const items = order.items || [];
          const address = order.shippingAddress;
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={order.id}
              className="bg-[#141414] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Order Card Header */}
              <div className="bg-black/60 px-6 py-4 border-b border-gray-800 flex flex-wrap justify-between items-center gap-4 text-sm">
                <div className="flex flex-wrap gap-6 items-center">
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Order Placed</p>
                    <p className="text-white font-medium mt-0.5">{orderDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Total Amount</p>
                    <p className="text-white font-bold mt-0.5">
                      {currency}{Number(order.totalAmount).toLocaleString()}
                    </p>
                  </div>
                  {address && (
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Ship To</p>
                      <p className="text-gray-300 font-medium mt-0.5 truncate max-w-xs">{address.fullName}</p>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Order Reference</p>
                  <p className="text-gray-400 font-mono text-xs mt-0.5">#{order.id.slice(0, 8)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-gray-800/80">
                {items.map((item: any) => {
                  const productName = item.productName || item.sellerListing?.variant?.product?.name || "Product";
                  const productSlug = item.productSlug || item.sellerListing?.variant?.product?.slug || "";
                  const variantName = item.variantName || item.sellerListing?.variant?.name || "Default";
                  const shopName = item.shopName || item.sellerListing?.sellerProfile?.shopName || "Seller";
                  const imageUrl =
                    item.imageUrl ||
                    item.sellerListing?.variant?.images?.[0]?.url ||
                    item.sellerListing?.variant?.product?.images?.[0]?.url;
                  const itemPrice = Number(item.priceAtPurchase || 0);

                  return (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden flex-shrink-0">
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
                            {variantName} &bull; Sold by <span className="text-gray-300">{shopName}</span>
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
                <div className="bg-black/30 px-6 py-3 border-t border-gray-800 text-xs text-gray-400 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    📍 Delivery Address: {address.street}, {address.city}, {address.state} - {address.zipCode} (Phone: {address.phone})
                  </span>
                  <span className="text-orange-400 font-medium">Payment: {order.paymentMethod}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
