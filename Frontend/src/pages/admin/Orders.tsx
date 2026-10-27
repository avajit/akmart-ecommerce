import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiShoppingBag, 
  FiSearch, 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight, 
  FiEye, 
  FiCheckCircle, 
  FiTruck, 
  FiPackage, 
  FiXCircle, 
  FiClock, 
  FiCopy, 
  FiCheck,
  FiX,
  FiPrinter,
  FiAlertCircle
} from 'react-icons/fi';
import { getAdminOrders, getAdminOrderById, updateAdminOrderStatus } from '../../api/admin.api';
import { toast } from 'react-toastify';

type OrderStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  status: string;
  productName: string;
  variantName: string;
  shopName: string;
  imageUrl?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  status: string;
  paymentMethod: string;
  deliveryNotes?: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  shippingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    district?: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Modal / Drawer state for order inspection
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminOrders({
        page,
        limit: 15,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: searchQuery.trim() || undefined,
      });

      if (res?.success) {
        setOrders(res.data.orders || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch admin orders');
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) return;
    try {
      setUpdatingStatus(true);
      const res = await updateAdminOrderStatus(orderId, newStatus);
      if (res?.success) {
        toast.success(`Order marked as ${newStatus} successfully!`);
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder(res.data);
        }
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openOrderDetail = async (order: Order) => {
    try {
      setActiveOrder(order);
      setDrawerOpen(true);
      // Fetch fresh details with coupon & items
      const res = await getAdminOrderById(order.id);
      if (res?.success) {
        setActiveOrder(res.data);
      }
    } catch {
      // Keep optimistic order state
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.info('Order ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <FiClock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <FiCheckCircle className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <FiTruck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <FiPackage className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <FiXCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-700 text-gray-300">
            {status}
          </span>
        );
    }
  };

  const statusTabs: { key: OrderStatus; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Orders', count: metrics.totalOrders },
    { key: 'PENDING', label: 'Pending', count: metrics.pending },
    { key: 'CONFIRMED', label: 'Confirmed', count: metrics.confirmed },
    { key: 'SHIPPED', label: 'Shipped', count: metrics.shipped },
    { key: 'DELIVERED', label: 'Delivered', count: metrics.delivered },
    { key: 'CANCELLED', label: 'Cancelled', count: metrics.cancelled },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="p-2.5 bg-orange-500/15 text-orange-500 rounded-xl border border-orange-500/20">
              <FiShoppingBag className="w-6 h-6" />
            </span>
            Order Governance
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor, track fulfillment, verify Cash on Delivery, and manage customer orders across Nepal.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-xl text-sm font-medium transition"
        >
          <FiPrinter className="w-4 h-4" /> Print Report
        </button>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-gray-800/80 rounded-2xl p-4.5 space-y-1">
          <p className="text-xs uppercase font-medium tracking-wider text-gray-400">Total Orders</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.totalOrders.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">Lifetime orders received</p>
        </div>

        <div className="bg-[#121212] border border-amber-500/20 rounded-2xl p-4.5 space-y-1">
          <p className="text-xs uppercase font-medium tracking-wider text-amber-400">Pending Review</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{metrics.pending.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">Requires verification/dispatch</p>
        </div>

        <div className="bg-[#121212] border border-purple-500/20 rounded-2xl p-4.5 space-y-1">
          <p className="text-xs uppercase font-medium tracking-wider text-purple-400">In Transit (Shipped)</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">{metrics.shipped.toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-400">Out with courier</p>
        </div>

        <div className="bg-[#121212] border border-emerald-500/20 rounded-2xl p-4.5 space-y-1">
          <p className="text-xs uppercase font-medium tracking-wider text-emerald-400">Total Net Revenue</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            Rs. {metrics.totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400">Excludes cancelled orders</p>
        </div>
      </div>

      {/* ── Filter Tabs & Search Bar ── */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSelectedStatus(tab.key);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 ${
                selectedStatus === tab.key
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-semibold'
                  : 'bg-[#141414] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedStatus === tab.key ? 'bg-black/20 text-white' : 'bg-gray-800 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Order ID, customer name, phone number, or city..."
            className="w-full bg-[#121212] border border-gray-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="bg-[#121212] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#161616]/70 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Destination</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total (NPR)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <div className="inline-block w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="mt-3 text-xs tracking-wider uppercase text-gray-400">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400 space-y-2">
                    <FiShoppingBag className="w-10 h-10 mx-auto text-gray-600 mb-2" />
                    <p className="text-base font-semibold text-gray-300">No orders found</p>
                    <p className="text-xs text-gray-500">
                      {searchQuery ? 'Try clearing your search query.' : 'There are currently no orders in this status category.'}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-900/40 transition">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-orange-400">
                        <span>#{o.id.substring(0, 8)}</span>
                        <button
                          onClick={() => copyToClipboard(o.id)}
                          className="p-1 hover:text-white transition"
                          title="Copy Full ID"
                        >
                          {copiedId === o.id ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5 text-gray-500" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white text-sm">
                        {o.shippingAddress?.fullName || o.user?.fullName || 'Guest Customer'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {o.shippingAddress?.phone || o.user?.phoneNumber || 'No phone'}
                      </p>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-4">
                      <p className="text-xs text-gray-200">
                        {o.shippingAddress?.city || 'Nepal'}
                        {o.shippingAddress?.district ? `, ${o.shippingAddress.district}` : ''}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate max-w-[160px]">
                        {o.shippingAddress?.street}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">{o.items?.length || 0}</span>
                        <span className="text-xs text-gray-400">items</span>
                      </div>
                      {o.items?.[0] && (
                        <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                          {o.items[0].productName}
                        </p>
                      )}
                    </td>

                    {/* Total (NPR) */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white font-mono text-sm">
                        Rs. {Number(o.totalAmount).toLocaleString('en-IN')}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-gray-400 bg-gray-800/80 px-1.5 py-0.5 rounded">
                        {o.paymentMethod || 'COD'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(o.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openOrderDetail(o)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition"
                      >
                        <FiEye className="w-3.5 h-3.5 text-orange-400" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            Showing {orders.length} of {totalCount} total orders (Page {page} of {totalPages})
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition"
              aria-label="Previous page"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-gray-800/50 rounded-lg font-mono text-white">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 transition"
              aria-label="Next page"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Order Detail Slide-Over Drawer ── */}
      {drawerOpen && activeOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
          <div 
            className="w-full max-w-xl bg-[#111111] border-l border-gray-800 h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="sticky top-0 bg-[#111111]/95 backdrop-blur-md border-b border-gray-800 p-5 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-mono">
                    Order #{activeOrder.id.substring(0, 8)}
                  </h2>
                  <button
                    onClick={() => copyToClipboard(activeOrder.id)}
                    className="p-1 text-gray-400 hover:text-white transition"
                    title="Copy full UUID"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
                aria-label="Close drawer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6 flex-1">
              {/* Status Update Quick Bar */}
              <div className="bg-[#181818] border border-gray-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-gray-400">Current Status</span>
                  {getStatusBadge(activeOrder.status)}
                </div>

                <div className="pt-2 border-t border-gray-800/80">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Update Fulfillment Lifecycle:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleStatusChange(activeOrder.id, 'CONFIRMED')}
                      disabled={updatingStatus || activeOrder.status === 'CONFIRMED'}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 disabled:opacity-40 transition"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusChange(activeOrder.id, 'SHIPPED')}
                      disabled={updatingStatus || activeOrder.status === 'SHIPPED'}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 disabled:opacity-40 transition"
                    >
                      Ship Order
                    </button>
                    <button
                      onClick={() => handleStatusChange(activeOrder.id, 'DELIVERED')}
                      disabled={updatingStatus || activeOrder.status === 'DELIVERED'}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 transition"
                    >
                      Deliver
                    </button>
                    <button
                      onClick={() => handleStatusChange(activeOrder.id, 'CANCELLED')}
                      disabled={updatingStatus || activeOrder.status === 'CANCELLED'}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 disabled:opacity-40 transition"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 text-[11px] text-gray-400">
                  <FiAlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    Cancelling an order automatically restores seller inventory in real-time.
                  </span>
                </div>
              </div>

              {/* Customer & Shipping Destination */}
              <div className="bg-[#181818] border border-gray-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  Shipping & Delivery Address
                </h3>
                {activeOrder.shippingAddress ? (
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-white">{activeOrder.shippingAddress.fullName}</p>
                    <p className="text-gray-300 font-mono text-xs">Phone: {activeOrder.shippingAddress.phone}</p>
                    <p className="text-gray-400 text-xs">
                      {activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.city}
                    </p>
                    <p className="text-gray-400 text-xs">
                      District: <span className="text-white font-medium">{activeOrder.shippingAddress.district || 'Not specified'}</span> | Province: {activeOrder.shippingAddress.state} (Postal: {activeOrder.shippingAddress.zipCode})
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No address recorded.</p>
                )}

                {/* Delivery Notes */}
                {activeOrder.deliveryNotes && (
                  <div className="mt-3 p-3 bg-black/40 border border-amber-500/20 rounded-xl space-y-1">
                    <span className="text-[11px] font-semibold uppercase text-amber-400">Customer Delivery Instructions:</span>
                    <p className="text-xs text-gray-200 italic">"{activeOrder.deliveryNotes}"</p>
                  </div>
                )}
              </div>

              {/* Purchased Items List */}
              <div className="bg-[#181818] border border-gray-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  Purchased Items ({activeOrder.items?.length || 0})
                </h3>
                <div className="divide-y divide-gray-800">
                  {activeOrder.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-12 h-12 object-cover rounded-lg border border-gray-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-black border border-gray-800 rounded-lg flex items-center justify-center text-gray-600">
                            <FiPackage className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white text-sm">{item.productName}</p>
                          <p className="text-gray-400">Variant: {item.variantName}</p>
                          <p className="text-gray-400 text-[11px]">Merchant: {item.shopName}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className="text-white font-semibold">
                          Rs. {Number(item.priceAtPurchase).toLocaleString('en-IN')} × {item.quantity}
                        </p>
                        <p className="text-orange-400 text-[11px] font-bold">
                          Total: Rs. {(Number(item.priceAtPurchase) * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="bg-[#181818] border border-gray-800 rounded-2xl p-4 space-y-2 text-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
                  Financial Breakdown
                </h3>
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">Rs. {Number(activeOrder.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-white">Rs. {Number(activeOrder.deliveryFee).toLocaleString('en-IN')}</span>
                </div>
                {Number(activeOrder.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount {activeOrder.couponCode ? `(${activeOrder.couponCode})` : ''}</span>
                    <span className="font-mono">-Rs. {Number(activeOrder.discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total</span>
                  <span className="font-mono text-orange-400 text-base">
                    Rs. {Number(activeOrder.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                  <span>Payment Gateway</span>
                  <span className="font-semibold text-gray-300">{activeOrder.paymentMethod || 'COD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
