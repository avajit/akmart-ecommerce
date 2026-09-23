import React, { useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerOrders, updateSellerOrderStatus } from '../../api/order.api';
import { ShopContext } from '../../context/ShopContext';
import { toast } from 'react-toastify';
import { FiPackage, FiClock, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function SellerOrders() {
  const queryClient = useQueryClient();
  const { currency } = useContext(ShopContext) || { currency: 'NPR ' };

  const { data: ordersRes, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: getSellerOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSellerOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Order status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to update order status");
    }
  });

  const orderItems = (ordersRes as any)?.data || [];

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-400">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4">Loading seller orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Order Fulfillment</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and update status for incoming customer orders</p>
        </div>
        <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
          {orderItems.length} Total Orders
        </span>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-black/60 text-xs uppercase border-b border-gray-800 tracking-wider text-gray-400">
              <tr>
                <th className="px-6 py-4">Item & Details</th>
                <th className="px-6 py-4">Customer Info</th>
                <th className="px-6 py-4">Date & Amount</th>
                <th className="px-6 py-4">Status Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orderItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <FiPackage className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                    <p className="text-base text-gray-300 font-medium">No orders received yet.</p>
                    <p className="text-xs text-gray-500 mt-1">New orders for your active listings will appear here.</p>
                  </td>
                </tr>
              ) : (
                orderItems.map((item: any) => {
                  const productName = item.productName || item.sellerListing?.variant?.product?.name || "Product";
                  const variantName = item.variantName || item.sellerListing?.variant?.name || "Default";
                  const imageUrl =
                    item.imageUrl ||
                    item.sellerListing?.variant?.images?.[0]?.url ||
                    item.sellerListing?.variant?.product?.images?.[0]?.url;
                  const itemPrice = Number(item.priceAtPurchase || item.sellerListing?.price || 0);
                  const customer = item.customerInfo || item.order?.shippingAddress;

                  return (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                      {/* Product Details */}
                      <td className="px-6 py-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-xl bg-black border border-gray-700 flex-shrink-0 overflow-hidden">
                            {imageUrl ? (
                              <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-gray-600 flex items-center justify-center h-full">No Img</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{productName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{variantName}</p>
                            <p className="text-xs text-emerald-400 font-semibold mt-1">
                              Qty: {item.quantity} &times; {currency}{itemPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        {customer ? (
                          <div>
                            <p className="text-white font-medium text-sm">{customer.name || customer.fullName || "Customer"}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{customer.phone || "No phone"}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {customer.city}, {customer.state}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Address not specified</span>
                        )}
                      </td>

                      {/* Date & Amount */}
                      <td className="px-6 py-4">
                        <p className="text-white text-xs">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                        <p className="font-bold text-emerald-400 text-sm mt-0.5">
                          {currency}{(itemPrice * item.quantity).toLocaleString()}
                        </p>
                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded mt-1 inline-block">
                          COD
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: item.id, status: e.target.value })}
                          disabled={updateStatusMutation.isPending}
                          className="bg-black border border-gray-700 text-white rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
