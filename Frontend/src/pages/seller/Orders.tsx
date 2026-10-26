import React, { useContext, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerOrders, updateSellerOrderStatus } from '../../api/seller.api';
import { ShopContext } from '../../context/ShopContext';
import { toast } from 'react-toastify';
import { 
  FiPackage, 
  FiClock, 
  FiTruck, 
  FiCheckCircle, 
  FiXCircle, 
  FiSearch, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiDollarSign, 
  FiArrowRight, 
  FiAlertTriangle, 
  FiShield, 
  FiRefreshCw
} from 'react-icons/fi';

type FilterTab = 'ALL' | 'ACTION_REQUIRED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export default function SellerOrders() {
  const queryClient = useQueryClient();
  const { currency } = useContext(ShopContext) || { currency: 'NPR ' };

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingItemId, setCancellingItemId] = useState<string | null>(null);

  const { data: ordersRes, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: getSellerOrders,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSellerOrderStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success(`Order item status updated to ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      setCancellingItemId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to update order status");
    }
  });

  const orderItems: any[] = (ordersRes as any)?.data || [];

  // Metrics computation
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;
    let fulfilledRevenue = 0;

    orderItems.forEach((item) => {
      const price = Number(item.priceAtPurchase || item.sellerListing?.price || 0);
      const lineTotal = price * (item.quantity || 1);

      if (item.status === 'PENDING' || item.status === 'PROCESSING') {
        pendingCount += 1;
      } else if (item.status === 'SHIPPED') {
        shippedCount += 1;
      } else if (item.status === 'DELIVERED') {
        deliveredCount += 1;
        fulfilledRevenue += lineTotal;
      } else if (item.status === 'CANCELLED') {
        cancelledCount += 1;
      }
    });

    return {
      total: orderItems.length,
      pending: pendingCount,
      shipped: shippedCount,
      delivered: deliveredCount,
      cancelled: cancelledCount,
      revenue: fulfilledRevenue,
    };
  }, [orderItems]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orderItems.filter((item) => {
      // Tab filter
      if (activeTab === 'ACTION_REQUIRED') {
        if (item.status !== 'PENDING' && item.status !== 'PROCESSING') return false;
      } else if (activeTab === 'SHIPPED') {
        if (item.status !== 'SHIPPED') return false;
      } else if (activeTab === 'DELIVERED') {
        if (item.status !== 'DELIVERED') return false;
      } else if (activeTab === 'CANCELLED') {
        if (item.status !== 'CANCELLED') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const productName = (item.productName || item.sellerListing?.variant?.product?.name || '').toLowerCase();
        const variantName = (item.variantName || item.sellerListing?.variant?.name || '').toLowerCase();
        const customerName = (item.customerInfo?.name || item.order?.shippingAddress?.fullName || item.order?.user?.fullName || '').toLowerCase();
        const phone = (item.customerInfo?.phone || item.order?.shippingAddress?.phone || item.order?.user?.phoneNumber || '').toLowerCase();
        const orderId = (item.orderId || item.order?.id || '').toLowerCase();

        return (
          productName.includes(q) ||
          variantName.includes(q) ||
          customerName.includes(q) ||
          phone.includes(q) ||
          orderId.includes(q)
        );
      }

      return true;
    });
  }, [orderItems, activeTab, searchQuery]);

  // Next status transition mapping
  const getNextStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING':
        return { nextStatus: 'PROCESSING', label: 'Accept & Process', icon: FiClock, color: 'bg-amber-500 hover:bg-amber-600' };
      case 'PROCESSING':
        return { nextStatus: 'SHIPPED', label: 'Dispatch Package', icon: FiTruck, color: 'bg-blue-600 hover:bg-blue-700' };
      case 'SHIPPED':
        return { nextStatus: 'DELIVERED', label: 'Confirm Delivery', icon: FiCheckCircle, color: 'bg-emerald-600 hover:bg-emerald-700' };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-gray-400">
        <div className="inline-block w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-300">Loading seller fulfillment orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-poppins text-white max-w-7xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Merchant Fulfillment Hub</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Order Fulfillment & Dispatch</h1>
          <p className="text-sm text-gray-400 mt-1">Process customer packages, monitor shipping milestones, and update tracking status</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#242424] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-semibold transition"
          >
            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Syncing..." : "Refresh Orders"}
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#141414] border border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Received</span>
            <FiPackage className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-3">{metrics.total}</p>
          <span className="text-[11px] text-gray-500 mt-1">Across all listings</span>
        </div>

        <div className="bg-[#141414] border border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Action Required</span>
            <FiClock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-3">{metrics.pending}</p>
          <span className="text-[11px] text-amber-500/70 mt-1">Pending dispatch</span>
        </div>

        <div className="bg-[#141414] border border-blue-500/20 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
            <FiTruck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-3">{metrics.shipped}</p>
          <span className="text-[11px] text-blue-500/70 mt-1">Courier handover</span>
        </div>

        <div className="bg-[#141414] border border-emerald-500/20 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <FiCheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-3">{metrics.delivered}</p>
          <span className="text-[11px] text-emerald-500/70 mt-1">Delivered to consumer</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[#141414] border border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Sales</span>
            <FiDollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-3">
            {currency}{metrics.revenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-gray-500 mt-1">Delivered item earnings</span>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'ALL'
                ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            All Orders ({metrics.total})
          </button>
          <button
            onClick={() => setActiveTab('ACTION_REQUIRED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'ACTION_REQUIRED'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Action Required ({metrics.pending})
          </button>
          <button
            onClick={() => setActiveTab('SHIPPED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'SHIPPED'
                ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            In Transit ({metrics.shipped})
          </button>
          <button
            onClick={() => setActiveTab('DELIVERED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'DELIVERED'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Delivered ({metrics.delivered})
          </button>
          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'CANCELLED'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Cancelled ({metrics.cancelled})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Search by product, customer, phone, order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/80 transition"
          />
        </div>
      </div>

      {/* Orders List Container */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-800/50 flex items-center justify-center text-gray-500 mb-4 border border-gray-700/50">
            <FiPackage size={28} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Orders Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            {searchQuery
              ? `No customer orders match "${searchQuery}". Try searching with different keywords.`
              : 'There are currently no orders in this category.'}
          </p>
          {(searchQuery || activeTab !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTab('ALL');
              }}
              className="bg-[#1A1A1A] hover:bg-[#252525] border border-gray-700 text-gray-300 text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((item: any) => {
            const productName = item.productName || item.sellerListing?.variant?.product?.name || "Product";
            const variantName = item.variantName || item.sellerListing?.variant?.name || "Default Variant";
            const imageUrl =
              item.imageUrl ||
              item.sellerListing?.variant?.images?.[0]?.url ||
              item.sellerListing?.variant?.product?.images?.[0]?.url;
            const itemPrice = Number(item.priceAtPurchase || item.sellerListing?.price || 0);
            const lineTotal = itemPrice * (item.quantity || 1);
            const customer = item.customerInfo || item.order?.shippingAddress;
            const user = item.order?.user;
            const paymentMethod = (item.order?.paymentMethod || "COD").toUpperCase();
            const orderRef = item.orderId ? item.orderId.slice(0, 8).toUpperCase() : (item.id ? item.id.slice(0, 8).toUpperCase() : 'ORD');
            const nextAction = getNextStatusAction(item.status);
            const isItemUpdating = updateStatusMutation.isPending && (updateStatusMutation.variables as any)?.id === item.id;

            return (
              <div
                key={item.id}
                className="bg-[#141414] border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700 transition shadow-lg space-y-4"
              >
                {/* Header row: Order Ref, Date, Payment Method, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white bg-black/60 border border-gray-800 px-2.5 py-1 rounded-lg">
                      #{orderRef}
                    </span>
                    <span className="text-xs text-gray-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Method Pill */}
                    {paymentMethod === 'ESEWA' ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold bg-[#60BB46]/10 text-[#60BB46] border border-[#60BB46]/30 px-2.5 py-0.5 rounded-full">
                        <FiShield size={11} /> eSewa Paid
                      </span>
                    ) : paymentMethod === 'KHALTI' ? (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold bg-[#5C2D91]/10 text-purple-400 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                        <FiShield size={11} /> Khalti Paid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        Cash On Delivery
                      </span>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
                        item.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : item.status === 'SHIPPED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : item.status === 'PROCESSING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : item.status === 'PENDING'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Main Body Grid: Product Info vs Customer Info vs Fulfillment Controls */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Column 1: Product Thumbnail & Line Items (5 cols) */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-black border border-gray-800 flex-shrink-0 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white truncate">{productName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{variantName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                        <span className="text-gray-600">&bull;</span>
                        <span className="text-xs font-semibold text-emerald-400">
                          {currency}{itemPrice.toLocaleString()} each
                        </span>
                        <span className="text-gray-600">&bull;</span>
                        <span className="text-xs font-extrabold text-white">
                          Total: {currency}{lineTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Customer & Delivery Details (4 cols) */}
                  <div className="md:col-span-4 bg-black/40 border border-gray-800/60 p-3 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <FiUser className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer?.fullName || customer?.name || user?.fullName || "Valued Consumer"}</span>
                    </div>

                    {(customer?.phone || user?.phoneNumber) && (
                      <div className="flex items-center gap-1.5 text-gray-300">
                        <FiPhone className="text-gray-400 flex-shrink-0" />
                        <a
                          href={`tel:${customer?.phone || user?.phoneNumber}`}
                          className="hover:text-emerald-400 transition"
                        >
                          {customer?.phone || user?.phoneNumber}
                        </a>
                      </div>
                    )}

                    {customer ? (
                      <div className="flex items-start gap-1.5 text-gray-400">
                        <FiMapPin className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">
                          {customer.street ? `${customer.street}, ` : ''}
                          {customer.city}, {customer.state} {customer.zipCode ? `(${customer.zipCode})` : ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No delivery address specified</span>
                    )}
                  </div>

                  {/* Column 3: Fulfillment Actions & Status Transition (3 cols) */}
                  <div className="md:col-span-3 flex flex-col items-end gap-2.5">
                    {/* Primary Step Transition Button */}
                    {nextAction && item.status !== 'CANCELLED' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: item.id, status: nextAction.nextStatus })}
                        disabled={isItemUpdating}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg ${nextAction.color} disabled:opacity-50`}
                      >
                        {isItemUpdating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <nextAction.icon size={14} />
                            {nextAction.label}
                          </>
                        )}
                      </button>
                    )}

                    {/* Secondary dropdown override & Cancel option */}
                    <div className="flex items-center gap-2 w-full">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: item.id, status: e.target.value })}
                        disabled={isItemUpdating}
                        className="flex-1 bg-black/60 border border-gray-800 text-gray-300 hover:text-white rounded-lg px-2.5 py-1.5 text-[11px] font-medium outline-none focus:border-emerald-500/80 cursor-pointer disabled:opacity-50"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      {item.status !== 'CANCELLED' && item.status !== 'DELIVERED' && (
                        <button
                          onClick={() => setCancellingItemId(item.id)}
                          disabled={isItemUpdating}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition"
                          title="Cancel this order item"
                        >
                          <FiXCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Stepper Visual Bar */}
                {item.status !== 'CANCELLED' && (
                  <div className="pt-2 border-t border-gray-800/60">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span className={item.status === 'PENDING' ? 'text-amber-400 font-bold' : item.status !== 'PENDING' ? 'text-emerald-400' : ''}>
                        1. Order Placed
                      </span>
                      <span className={item.status === 'PROCESSING' ? 'text-amber-400 font-bold' : (item.status === 'SHIPPED' || item.status === 'DELIVERED') ? 'text-emerald-400' : ''}>
                        2. Packed & Ready
                      </span>
                      <span className={item.status === 'SHIPPED' ? 'text-blue-400 font-bold' : item.status === 'DELIVERED' ? 'text-emerald-400' : ''}>
                        3. In Transit
                      </span>
                      <span className={item.status === 'DELIVERED' ? 'text-emerald-400 font-bold' : ''}>
                        4. Delivered
                      </span>
                    </div>

                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          item.status === 'DELIVERED'
                            ? 'w-full bg-emerald-500'
                            : item.status === 'SHIPPED'
                            ? 'w-3/4 bg-blue-500'
                            : item.status === 'PROCESSING'
                            ? 'w-1/2 bg-amber-500'
                            : 'w-1/4 bg-yellow-500'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Cancel Order Item</h3>
                <p className="text-xs text-gray-400">Inventory will be automatically restocked</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to cancel this order item? Marking it as cancelled will stop fulfillment and return the reserved inventory units back to your active listing.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingItemId(null)}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Go Back
              </button>
              <button
                onClick={() => updateStatusMutation.mutate({ id: cancellingItemId, status: 'CANCELLED' })}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                {updateStatusMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
