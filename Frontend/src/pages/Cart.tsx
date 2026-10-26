import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getActiveCoupons } from '../api/consumer.api';
import { 
  FiTrash2, 
  FiShoppingBag, 
  FiArrowRight, 
  FiShield, 
  FiAlertTriangle, 
  FiBriefcase, 
  FiHeart, 
  FiTruck, 
  FiCheckCircle, 
  FiTag, 
  FiPackage,
  FiX,
  FiTrendingDown,
  FiLock,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Cart() {
  const { isAuthenticated, user } = useAuthStore();
  const role = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();
  const isMerchantOrAdmin = role === 'SELLER' || role === 'ADMIN';

  const navigate = useNavigate();
  const { 
    currency, 
    cart, 
    cartLoading, 
    cartSubtotal, 
    shippingFee, 
    cartTotal, 
    freeShippingGap, 
    freeShippingProgress, 
    freeShippingThreshold,
    updateCartItemQty, 
    removeCartItemOptimistic, 
    moveToWishlist,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalPayable,
  } = useContext(ShopContext) as any;

  // Coupon Input & Backend Available Coupons
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);

  useEffect(() => {
    getActiveCoupons().then((res: any) => {
      setActiveCoupons(res.data || []);
    }).catch(() => {});
  }, []);

  // Group items by Seller (Multi-Vendor Marketplace standard)
  const items = cart?.items || [];
  const vendorGroups = useMemo(() => {
    const map = new Map<string, { sellerName: string; items: any[] }>();
    items.forEach((item: any) => {
      const sellerId = item.sellerListing?.sellerProfile?.id || item.sellerListing?.sellerProfileId || 'default-seller';
      const sellerName = item.sellerListing?.sellerProfile?.shopName || 'AkMart Official Store';
      if (!map.has(sellerId)) {
        map.set(sellerId, { sellerName, items: [] });
      }
      map.get(sellerId)!.items.push(item);
    });
    return Array.from(map.values());
  }, [items]);

  // Total quantity of all items in cart (matches navbar badge)
  const totalQuantity = useMemo(() => {
    return items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
  }, [items]);

  // Out-of-Stock Gatekeeper: Check if any item cannot be purchased
  const hasOutOfStockItems = items.some((item: any) => !item.isAvailable || (item.availableStock !== undefined && item.availableStock < item.quantity));

  // ── Enterprise Item Selection (Daraz / AliExpress standard) ──
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Auto-initialize selectedItemIds with all in-stock items when cart loads
  useEffect(() => {
    if (items.length > 0) {
      setSelectedItemIds(prev => {
        const validItemIds = new Set(items.map((it: any) => it.id));
        const preserved = new Set([...prev].filter(id => validItemIds.has(id)));
        if (preserved.size > 0) return preserved;

        const initialSelected = new Set<string>();
        items.forEach((it: any) => {
          const isOOS = !it.isAvailable || (it.availableStock !== undefined && it.availableStock < it.quantity);
          if (!isOOS) {
            initialSelected.add(it.id);
          }
        });
        return initialSelected;
      });
    } else {
      setSelectedItemIds(new Set());
    }
  }, [items]);

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const availableItems = useMemo(() => {
    return items.filter((it: any) => it.isAvailable && (it.availableStock === undefined || it.availableStock >= it.quantity));
  }, [items]);

  const isAllSelected = availableItems.length > 0 && availableItems.every((it: any) => selectedItemIds.has(it.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(availableItems.map((it: any) => it.id)));
    }
  };

  const selectedItems = useMemo(() => {
    return items.filter((it: any) => selectedItemIds.has(it.id));
  }, [items, selectedItemIds]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((sum: number, it: any) => {
      const price = Number(it.priceAtAddTime || it.sellerListing?.price || 0);
      return sum + price * (it.quantity || 1);
    }, 0);
  }, [selectedItems]);

  const selectedQuantity = useMemo(() => {
    return selectedItems.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
  }, [selectedItems]);

  const selectedShippingFee = selectedSubtotal >= freeShippingThreshold || selectedSubtotal === 0 ? 0 : shippingFee;
  const selectedShippingGap = Math.max(0, freeShippingThreshold - selectedSubtotal);
  const selectedShippingProgress = Math.min(100, Math.round((selectedSubtotal / freeShippingThreshold) * 100));

  const selectedDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minOrderValue && selectedSubtotal < appliedCoupon.minOrderValue) return 0;
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      const calc = Math.round((selectedSubtotal * appliedCoupon.discountValue) / 100);
      return appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
    }
    return Math.min(appliedCoupon.discountValue, selectedSubtotal);
  }, [appliedCoupon, selectedSubtotal]);

  const selectedFinalPayable = Math.max(0, selectedSubtotal + selectedShippingFee - selectedDiscountAmount);

  const hasOutOfStockInSelected = useMemo(() => {
    return selectedItems.some((item: any) => !item.isAvailable || (item.availableStock !== undefined && item.availableStock < item.quantity));
  }, [selectedItems]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const ok = await applyCoupon(couponCode);
    if (ok) {
      setCouponCode('');
    }
  };

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warn("Please select at least one item to proceed to checkout.");
      return;
    }
    const checkoutState = { selectedItemIds: Array.from(selectedItemIds) };
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout', { state: checkoutState });
    } else {
      navigate('/checkout', { state: checkoutState });
    }
  };

  if (isMerchantOrAdmin) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-center mx-auto mb-5 text-orange-400">
          <FiBriefcase className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Merchant Account Detected</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
          You are signed in with a <strong>{role}</strong> account. Shopping cart and customer checkout are reserved for consumer accounts.
        </p>
        <Link
          to={role === 'SELLER' ? '/seller/dashboard' : '/admin/dashboard'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/20 active:scale-95"
        >
          Go to {role === 'SELLER' ? 'Seller' : 'Admin'} Dashboard &rarr;
        </Link>
      </div>
    );
  }

  if (cartLoading && !cart) {
    return (
      <div className="max-w-7xl mx-auto py-28 px-4 text-center font-poppins">
        <div className="inline-block w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Syncing your shopping cart...</p>
      </div>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-16 sm:py-24 px-4 text-center font-poppins">
        {/* Animated Empty State Graphic */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-orange-500/15 rounded-full blur-2xl" />
          <div className="relative w-24 h-24 bg-[#141414] rounded-3xl flex items-center justify-center border border-gray-800 shadow-2xl">
            <FiShoppingBag className="w-11 h-11 text-gray-500" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">Your Shopping Cart is Empty</h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Looks like you haven't added anything to your cart yet. Explore Nepal's lowest price guaranteed catalog with fast nationwide delivery!
        </p>

        <Link
          to="/collection"
          className="inline-flex items-center gap-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-xl transition shadow-xl shadow-orange-500/25 text-xs sm:text-sm uppercase tracking-wider active:scale-95 mb-14"
        >
          <span>Start Shopping Now</span>
          <FiArrowRight size={16} />
        </Link>

        {/* Quick Category Discovery Pills */}
        <div className="border-t border-gray-800/80 pt-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Popular Departments to Explore</h2>
          <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
            {[
              { label: "Electronics & Tech", slug: "electronics" },
              { label: "Men's Fashion", slug: "men" },
              { label: "Women's Fashion", slug: "women" },
              { label: "Kids & Toys", slug: "kids" },
              { label: "Home & Living", slug: "home" },
            ].map((cat) => (
              <Link
                key={cat.slug}
                to={`/collection?category=${cat.slug}`}
                className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1C1C1C] border border-gray-800 text-xs text-gray-300 hover:text-orange-400 transition-colors font-medium shadow-sm"
              >
                {cat.label} &rarr;
              </Link>
            ))}
          </div>
        </div>

        {/* Reassuring Value Props */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-800/60 text-left">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121212] border border-gray-800/60">
            <FiTruck className="text-orange-400 text-xl shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Free Nationwide Delivery</p>
              <p className="text-[11px] text-gray-400">On all orders above NPR 2,500</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121212] border border-gray-800/60">
            <FiShield className="text-emerald-400 text-xl shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">100% Genuine Guaranteed</p>
              <p className="text-[11px] text-gray-400">Directly from verified vendors</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121212] border border-gray-800/60">
            <FiRefreshCw className="text-blue-400 text-xl shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">7-Day Easy Returns</p>
              <p className="text-[11px] text-gray-400">Doorstep return & instant refund</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-6 sm:pt-10 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Shopping Cart</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25 text-xs font-bold">
              {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Grouped across <span className="text-white font-medium">{vendorGroups.length}</span> seller package(s) with guaranteed dispatch timelines
          </p>
        </div>
        <Link 
          to="/collection" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors self-start sm:self-center"
        >
          <span>Continue Shopping</span>
          <FiArrowRight size={13} />
        </Link>
      </div>

      {/* ── Free Shipping Progress Bar (Enterprise AOV Booster) ── */}
      {/* ── Free Shipping Progress Bar (Calculated dynamically on selected items) ── */}
      <div className={`mb-8 p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-md ${
        selectedShippingProgress >= 100 
          ? 'bg-emerald-500/5 border-emerald-500/25' 
          : 'bg-[#141414] border-gray-800/80'
      }`}>
        <div className="flex items-center justify-between mb-2.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              selectedShippingProgress >= 100 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'
            }`}>
              <FiTruck size={16} />
            </span>
            <span className="font-semibold text-white">
              {selectedShippingProgress >= 100 ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <FiCheckCircle size={15} /> Congratulations! You unlocked FREE Nationwide Delivery
                </span>
              ) : (
                <span>
                  Add <strong className="text-orange-400">{currency}{selectedShippingGap.toLocaleString()}</strong> more to qualify for <strong>FREE Delivery</strong>
                </span>
              )}
            </span>
          </div>
          <span className="text-gray-400 font-mono text-xs hidden sm:inline">
            Free shipping at {currency}{freeShippingThreshold.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-[#1F1F1F] h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-800/60">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              selectedShippingProgress >= 100 
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' 
                : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400'
            }`}
            style={{ width: `${selectedShippingProgress}%` }}
          />
        </div>
      </div>

      {/* ── Main Cart Two-Column Grid ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Vendor Grouped Cart Packages */}
        <div className="flex-1 w-full space-y-6">
          {/* Select All Cart Action Bar (AliExpress / Daraz / Shopee standard) */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded accent-orange-500 cursor-pointer bg-black border-gray-700"
              />
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Select All</span>
                <span className="text-gray-400 font-normal">({selectedItems.length} of {items.length} items)</span>
              </span>
            </label>

            {selectedItems.length > 0 && selectedItems.length < items.length && (
              <span className="text-[11px] text-orange-400 font-medium bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                Buying {selectedItems.length} of {items.length} items
              </span>
            )}
          </div>

          {vendorGroups.map((group, groupIndex) => (
            <div 
              key={group.sellerName + groupIndex}
              className="bg-[#141414] border border-gray-800/80 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Package Header with Seller Info */}
              <div className="bg-[#181818] px-5 py-3.5 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xs font-bold">
                    <FiPackage size={14} />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-white">Package {groupIndex + 1} of {vendorGroups.length}</span>
                    <span className="text-gray-500 mx-1.5">•</span>
                    <span className="text-xs text-gray-400">Sold by <strong className="text-gray-200">{group.sellerName}</strong></span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center gap-1.5 bg-[#121212] px-2.5 py-1 rounded-md border border-gray-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  <span>Dispatches in 24 hrs</span>
                </div>
              </div>

              {/* Items in this Package */}
              <div className="p-4 sm:p-5 divide-y divide-gray-800/60">
                {group.items.map((item: any) => {
                  const productName = item.variant?.product?.name || item.sellerListing?.variant?.product?.name || "Product";
                  const productSlug = item.variant?.product?.slug || item.sellerListing?.variant?.product?.slug || "";
                  const variantName = item.variant?.name || item.sellerListing?.variant?.name || "Standard";
                  const imageUrl = item.variant?.images?.[0]?.url || item.sellerListing?.variant?.images?.[0]?.url;
                  const price = Number(item.priceAtAddTime || item.sellerListing?.price || 0);
                  const livePrice = Number(item.sellerListing?.price || price);
                  const isPriceChanged = item.priceChanged || (livePrice !== price);
                  const priceDrop = price > livePrice;
                  const maxStock = Math.min(item.availableStock ?? 10, 10);
                  const isMaxReached = item.quantity >= maxStock;

                  return (
                    <div
                      key={item.id}
                      className={`py-4 sm:py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 transition-all ${
                        !item.isAvailable ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Top section on mobile / Left section on desktop: Checkbox + Image + Details */}
                      <div className="flex gap-3 sm:gap-4 items-start flex-1 min-w-0">
                        {/* Item Selection Checkbox */}
                        <div className="pt-2 sm:pt-4 shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            disabled={!item.isAvailable || (item.availableStock !== undefined && item.availableStock < item.quantity)}
                            className="w-4 h-4 rounded accent-orange-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-black border-gray-700"
                            title={!item.isAvailable ? "Item unavailable" : "Select to purchase"}
                          />
                        </div>

                        {/* Product Thumbnail */}
                        <Link 
                          to={`/product/${productSlug}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 max-w-[80px] sm:max-w-[96px] max-h-[80px] sm:max-h-[96px] bg-[#1A1A1A] rounded-xl overflow-hidden shrink-0 border border-gray-800 group relative block"
                        >
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={productName} 
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" 
                            />
                          ) : (
                            <span className="text-xs text-gray-600 flex items-center justify-center h-full">No Img</span>
                          )}
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/product/${productSlug}`} 
                            className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-orange-400 transition line-clamp-2 block leading-snug"
                          >
                            {productName}
                          </Link>
                          
                          {/* Variant Specification Chips */}
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-[#1E1E1E] border border-gray-800 text-[10.5px] sm:text-[11px] text-gray-300 font-medium">
                              Variant: {variantName}
                            </span>
                          </div>

                          {/* Price & Price-Change Alerts */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <p className="text-white font-extrabold text-sm sm:text-base">
                              {currency}{price.toLocaleString()}
                            </p>

                            {isPriceChanged && (
                              <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded ${
                                priceDrop 
                                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                                  : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                              }`}>
                                {priceDrop ? <FiTrendingDown className="w-3.5 h-3.5 shrink-0" /> : <FiAlertTriangle className="w-3 h-3 shrink-0" />}
                                {priceDrop ? (
                                  <span>Price dropped to {currency}{livePrice.toLocaleString()}</span>
                                ) : (
                                  <span>Price updated to {currency}{livePrice.toLocaleString()}</span>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Out of Stock Warning */}
                          {!item.isAvailable && (
                            <p className="text-rose-400 text-xs mt-1.5 font-semibold flex items-center gap-1">
                              <FiAlertTriangle className="shrink-0" />
                              Currently out of stock or unavailable.
                            </p>
                          )}

                          {/* Desktop Save for Later */}
                          <div className="hidden sm:flex items-center gap-4 mt-2.5">
                            <button
                              type="button"
                              onClick={() => moveToWishlist(item)}
                              className="text-xs font-semibold text-gray-400 hover:text-orange-400 flex items-center gap-1.5 transition-colors group"
                            >
                              <FiHeart className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition-colors" />
                              <span>Save for Later</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bottom row on mobile / Right section on desktop: Stepper + Total + Delete */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-6 pt-3 sm:pt-0 border-t border-gray-800/60 sm:border-t-0 shrink-0">
                        {/* Optimistic Stepper (0ms UI lag) */}
                        <div className="flex items-center bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden shadow-inner">
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-orange-500 transition font-bold active:scale-90 text-sm"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="text-white px-3 font-bold text-xs sm:text-sm min-w-[28px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                            disabled={isMaxReached}
                            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-orange-500 disabled:opacity-30 disabled:pointer-events-none transition font-bold active:scale-90 text-sm"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Mobile Save for Later */}
                        <button
                          type="button"
                          onClick={() => moveToWishlist(item)}
                          className="sm:hidden text-[11px] font-semibold text-gray-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
                        >
                          <FiHeart className="w-3 h-3 text-gray-500" />
                          <span>Save</span>
                        </button>

                        {/* Item Total */}
                        <div className="text-right min-w-[70px] sm:min-w-[85px]">
                          <p className="text-[10px] text-gray-500 sm:hidden">Total</p>
                          <p className="text-sm sm:text-base font-extrabold text-white">
                            {currency}{(price * item.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* 1-Click Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeCartItemOptimistic(item.id)}
                          className="text-gray-500 hover:text-rose-400 p-2 rounded-xl hover:bg-gray-800/80 transition-colors active:scale-90"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary Card (Sticky Desktop) */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 sticky top-24 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3.5">
              <h2 className="text-base font-extrabold text-white tracking-tight uppercase">
                Order Summary
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                {selectedItems.length} of {items.length} Selected
              </span>
            </div>

            {/* Out of Stock Alert Banner for SELECTED items */}
            {hasOutOfStockInSelected && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2.5">
                <FiAlertTriangle className="shrink-0 mt-0.5 text-rose-400" size={16} />
                <span>One or more selected items are out of stock. Uncheck them to proceed to checkout.</span>
              </div>
            )}

            {/* Financial Breakdown (Based strictly on selected items) */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})</span>
                <span className="text-white font-medium">{currency}{selectedSubtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-400 items-center">
                <div className="flex items-center gap-1.5">
                  <FiTruck size={14} className="text-gray-400" />
                  <span>Estimated Delivery</span>
                </div>
                {selectedShippingFee === 0 ? (
                  <span className="text-emerald-400 font-extrabold uppercase text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    FREE
                  </span>
                ) : (
                  <span className="text-white font-medium">{currency}{selectedShippingFee.toLocaleString()}</span>
                )}
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1.5 font-bold">
                    <FiTag size={13} /> Coupon ({appliedCoupon.code})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold">-{currency}{selectedDiscountAmount.toLocaleString()}</span>
                    <button 
                      type="button"
                      onClick={removeCoupon} 
                      className="text-gray-400 hover:text-rose-400 transition-colors"
                      title="Remove coupon"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-800 pt-3.5 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-extrabold text-white block">Total Payable</span>
                  <span className="text-[10px] text-gray-500">Includes all taxes & delivery fees</span>
                </div>
                <span className="text-2xl font-extrabold text-orange-400">
                  {currency}{selectedFinalPayable.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Promo Code Input & Quick Apply Chips */}
            <div className="pt-2 border-t border-gray-800">
              {!appliedCoupon ? (
                <div className="space-y-2.5">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. AKMART10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-black border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl uppercase transition shadow-sm"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Quick-Apply Suggestion Chips from Backend */}
                  {activeCoupons.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Available:</span>
                      {activeCoupons.map((c: any) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => applyCoupon(c.code)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/25 transition active:scale-95"
                          title={`Min order NPR ${c.minOrderValue || 0}`}
                        >
                          {c.code} ({c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `NPR ${c.discountValue} OFF`})
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Available:</span>
                      <button
                        type="button"
                        onClick={() => applyCoupon('AKMART10')}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/25 transition active:scale-95"
                      >
                        AKMART10 (10% OFF)
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={selectedItems.length === 0 || hasOutOfStockInSelected}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold py-4 rounded-xl transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 uppercase tracking-wider text-xs active:scale-[0.99] group"
            >
              <span>
                {selectedItems.length === 0 
                  ? "Select Items to Checkout" 
                  : `Proceed to Checkout (${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''})`}
              </span>
              <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust Badges */}
            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center pt-2 border-t border-gray-800/80">
              <FiShield className="text-orange-500 w-4 h-4 shrink-0" />
              <span>100% Buyer Protection • Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Mobile Checkout Footer (Pinned cleanly to bottom on mobile) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/98 backdrop-blur-md border-t border-gray-800/90 p-3.5 px-5 pb-[max(0.85rem,env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_-10px_25px_rgba(0,0,0,0.7)]">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
            Total ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})
          </span>
          <span className="text-lg font-black text-orange-400">
            {currency}{selectedFinalPayable.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          onClick={handleProceedToCheckout}
          disabled={selectedItems.length === 0 || hasOutOfStockInSelected}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white font-extrabold py-3 px-6 rounded-xl uppercase tracking-wider text-xs flex items-center gap-2 transition active:scale-95 shadow-lg shadow-orange-500/25 group"
        >
          <span>Checkout ({selectedItems.length})</span>
          <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
