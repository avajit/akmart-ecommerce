import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { 
  FiCheckCircle, 
  FiTruck, 
  FiShoppingBag, 
  FiMapPin, 
  FiCreditCard, 
  FiPackage, 
  FiPrinter, 
  FiShield, 
  FiArrowRight, 
  FiClock, 
  FiPhone 
} from 'react-icons/fi';

/**
 * PlaceOrder: Amazon / Flipkart / Daraz-style Order Confirmation & Receipt Screen
 * 
 * Displays rich order confirmation receipt when arriving from Checkout:
 * - Order Reference Number (#AKM-XXXX)
 * - Estimated doorstep delivery date
 * - Delivery address & contact verification
 * - Itemized product breakdown with images
 * - Direct action buttons: Track Order, Continue Shopping, Print Receipt
 */
const PlaceOrder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currency, refreshCart } = (useContext(ShopContext) as any) || { currency: 'NPR ' };

  // Ensure cart is refreshed from server as soon as order confirmation mounts
  useEffect(() => {
    if (typeof refreshCart === 'function') {
      refreshCart();
    }
  }, []);

  // Retrieve placed order and payment metadata passed from Checkout.tsx
  const order = location.state?.order;
  const transactionId = location.state?.transactionId;
  const paymentChannel = (location.state?.paymentChannel || order?.paymentMethod || 'COD').toUpperCase();

  // Handle case where user directly visits /place-order without active order data
  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 font-poppins">
        <div className="w-16 h-16 bg-[#141414] border border-gray-800 rounded-2xl flex items-center justify-center text-orange-400 mb-4 shadow-lg">
          <FiPackage className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Order Confirmation</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
          You don't have an order confirmation to view right now. You can check your past orders or explore our latest arrivals.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/collection')}
            className="w-full sm:w-auto px-6 py-3 bg-[#1A1A1A] hover:bg-[#222] text-gray-300 hover:text-white border border-gray-800 rounded-xl text-xs font-semibold transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const orderId = order.id ? `#AKM-${order.id.slice(0, 8).toUpperCase()}` : '#AKM-ORDER';
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Today';

  const shipping = order.shippingAddress;
  const items = order.items || [];
  const totalAmount = Number(order.totalAmount || 0);

  const subtotalAmount = Number(order.subtotal ?? totalAmount);
  const deliveryFee = Number(order.deliveryFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  const couponCode = order.couponCode;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto font-poppins selection:bg-orange-500 selection:text-white">
      
      {/* ── 1. CELEBRATION & CONFIRMATION HEADER ──────────────────────── */}
      <div className="bg-[#141414] border border-gray-800/80 rounded-3xl p-6 sm:p-10 mb-8 relative overflow-hidden shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    paymentChannel === 'ESEWA'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : paymentChannel === 'KHALTI'
                      ? 'text-purple-300 bg-purple-500/10 border-purple-500/20'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}
                >
                  {paymentChannel === 'ESEWA'
                    ? 'Paid via eSewa • Confirmed'
                    : paymentChannel === 'KHALTI'
                    ? 'Paid via Khalti • Confirmed'
                    : 'Order Confirmed (COD)'}
                </span>
                <span className="text-gray-400 text-xs">• {orderDate}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
                Thank you for your order!
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                We've received your order <span className="text-white font-mono font-semibold">{orderId}</span>. A confirmation notification has been dispatched and our merchant hub is preparing fulfillment.
              </p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1A1A] hover:bg-[#242424] text-gray-300 hover:text-white border border-gray-800 rounded-xl text-xs font-semibold transition"
              title="Print Receipt"
            >
              <FiPrinter className="w-4 h-4 text-gray-400" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99]"
            >
              <FiTruck className="w-4 h-4" />
              <span>Track Order</span>
            </button>
          </div>
        </div>

        {/* Highlight Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-800/80">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Order ID</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">{orderId}</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Estimated Delivery</span>
            <span className="text-sm sm:text-base font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5 shrink-0" />
              <span>2–4 Business Days</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Payment Method</span>
            <span className="text-sm sm:text-base font-semibold text-white mt-0.5 block">
              {paymentChannel === 'ESEWA'
                ? 'eSewa (Paid Online)'
                : paymentChannel === 'KHALTI'
                ? 'Khalti (Paid Online)'
                : 'Cash on Delivery (COD)'}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Payable</span>
            <span className="text-base sm:text-lg font-extrabold text-orange-400 mt-0.5 block">
              {currency}{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. TWO-COLUMN DETAILS GRID (FLIPKART / AMAZON FLOW) ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ORDERED ITEMS & PRICE SUMMARY (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items Card */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FiPackage className="text-orange-500" />
                <span>Ordered Items ({items.length})</span>
              </h2>
              <span className="text-xs text-gray-400">Fulfilled by Verified Sellers</span>
            </div>

            <div className="divide-y divide-gray-800/80 mt-2">
              {items.map((item: any, idx: number) => {
                const itemPrice = Number(item.priceAtPurchase || item.sellerListing?.price || 0);
                const itemImg = item.imageUrl || item.sellerListing?.variant?.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400';

                return (
                  <div key={item.id || idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 rounded-xl bg-[#1A1A1A] overflow-hidden border border-gray-800 shrink-0">
                        <img 
                          src={itemImg} 
                          alt={item.productName || 'Product'} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white leading-snug">
                          {item.productName}
                        </h3>
                        {item.variantName && item.variantName !== 'Default Variant' && (
                          <p className="text-xs text-orange-400 font-medium mt-0.5">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                          Sold by: <span className="text-gray-300 font-medium">{item.shopName || 'AkMart Merchant'}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Qty: <span className="text-white font-semibold">{item.quantity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-white">
                        {currency}{(itemPrice * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {currency}{itemPrice.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-800">
              Payment Breakdown
            </h3>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Items Subtotal ({items.length} items)</span>
              <span className="text-white font-medium">{currency}{subtotalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Delivery Fee (Nepal Express)</span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-400 font-semibold">FREE</span>
              ) : (
                <span className="text-white font-medium">{currency}{deliveryFee.toLocaleString()}</span>
              )}
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Coupon Discount {couponCode ? `(${couponCode})` : ''}</span>
                <span className="font-semibold">-{currency}{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Total Paid / Payable</span>
              <span className="text-xl font-extrabold text-orange-400">
                {currency}{totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DELIVERY ADDRESS & ASSURANCE (1 col) */}
        <div className="space-y-6">
          
          {/* Shipping Address Card */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <FiMapPin className="text-orange-500 w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Delivery Address
              </h3>
            </div>

            {shipping ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-white text-sm">
                  {shipping.fullName}
                </p>
                <p className="text-gray-300 leading-relaxed">
                  {shipping.street}
                </p>
                <p className="text-gray-400">
                  {shipping.city}, {shipping.state} - {shipping.zipCode}
                </p>
                <div className="pt-2 flex items-center gap-2 text-gray-300">
                  <FiPhone className="text-orange-400 w-3.5 h-3.5" />
                  <span className="font-mono">{shipping.phone}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Saved customer address on record.</p>
            )}
          </div>

          {/* Payment Method Card */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <FiCreditCard className="text-orange-500 w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Payment Channel
              </h3>
            </div>

            {paymentChannel === 'ESEWA' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#60BB46] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#60BB46]/30">
                      e
                    </span>
                    <span className="text-white font-bold text-sm">eSewa Mobile Wallet</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/25 text-[10px] uppercase flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" /> Paid & Verified
                  </span>
                </div>
                {transactionId && (
                  <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400 text-[11px]">Txn Ref:</span>
                    <span className="text-emerald-400 font-bold">{transactionId}</span>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Electronic authorization verified via eSewa ePay. No cash collection required upon delivery.
                </p>
              </div>
            ) : paymentChannel === 'KHALTI' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#5C2D91] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#5C2D91]/30">
                      K
                    </span>
                    <span className="text-white font-bold text-sm">Khalti Digital Wallet</span>
                  </div>
                  <span className="text-purple-300 font-bold bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/25 text-[10px] uppercase flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" /> Paid & Verified
                  </span>
                </div>
                {transactionId && (
                  <div className="bg-[#1A1A1A] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400 text-[11px]">Txn Ref:</span>
                    <span className="text-purple-300 font-bold">{transactionId}</span>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Payment cleared via Khalti Gateway. Instant settlement guaranteed by AKMart.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium">Cash on Delivery (COD)</span>
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px] uppercase">
                    Pay Upon Arrival
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Please have exact cash ready ({currency}{totalAmount.toLocaleString()}) or Fonepay QR at your doorstep when our courier arrives.
                </p>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
              <FiShield className="text-orange-500 w-4 h-4" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                AkMart Assurance
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>7-day doorstep replacement guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>100% genuine sealed merchandise</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span>Nepal-wide real-time tracking</span>
              </li>
            </ul>
          </div>

          {/* Secondary Action */}
          <div className="pt-2">
            <Link
              to="/collection"
              className="w-full bg-[#1A1A1A] hover:bg-[#222] text-white py-3.5 px-4 rounded-xl border border-gray-800 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition group"
            >
              <span>Continue Shopping</span>
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PlaceOrder;
