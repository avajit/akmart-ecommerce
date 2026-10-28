import React, { useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  FiX, 
  FiTrash2, 
  FiShoppingBag, 
  FiArrowRight, 
  FiTruck, 
  FiCheckCircle, 
  FiShield,
  FiLock,
  FiPackage
} from 'react-icons/fi';
import { QuantityStepper, Price, Badge } from './ui';

export default function CartDrawer() {
  const { isAuthenticated } = useAuthStore();
  const {
    currency,
    cart,
    cartCount,
    cartSubtotal,
    freeShippingGap,
    freeShippingProgress,
    freeShippingThreshold,
    updateCartItemQty,
    removeCartItemOptimistic,
    isCartDrawerOpen,
    closeCartDrawer,
  } = useContext(ShopContext) as any;

  const navigate = useNavigate();
  const items = cart?.items || [];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end font-poppins">
      {/* Backdrop */}
      <div 
        onClick={closeCartDrawer}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-backdrop-in transition-opacity duration-300" 
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Sheet */}
      <div className="relative w-full max-w-md bg-[#0F0F0F] border-l border-gray-800/90 h-full flex flex-col z-10 shadow-2xl animate-drawer-in">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#141414]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-sm">
              <FiShoppingBag size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-white uppercase tracking-wider">Your Cart</h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/25 text-[10px] font-bold">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Review items & quick checkout
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCartDrawer}
            className="w-9 h-9 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-90"
            aria-label="Close cart drawer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Meter (Visible when cart has items) */}
        {items.length > 0 && (
          <div className="px-4 py-3 bg-[#151515] border-b border-gray-800/80">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-white">
                <FiTruck className={freeShippingProgress >= 100 ? 'text-emerald-400' : 'text-orange-400'} size={15} />
                {freeShippingProgress >= 100 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <FiCheckCircle size={13} /> FREE Nationwide Delivery Unlocked!
                  </span>
                ) : (
                  <span>Add <strong className="text-orange-400">{currency}{freeShippingGap.toLocaleString()}</strong> more for <strong>FREE Delivery</strong></span>
                )}
              </span>
              <span className="text-gray-500 font-mono text-[10px]">
                {freeShippingProgress}%
              </span>
            </div>
            <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden p-0.5 border border-gray-800/50">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  freeShippingProgress >= 100 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Items Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-gray-800">
          {items.length === 0 ? (
            <div className="py-16 text-center px-4">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl" />
                <div className="relative w-20 h-20 bg-[#161616] rounded-2xl flex items-center justify-center border border-gray-800 shadow-xl">
                  <FiShoppingBag className="w-9 h-9 text-gray-500" />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">Your cart is currently empty</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6 leading-relaxed">
                Discover trending apparel, electronics, and authentic Nepali products with lowest price guarantee.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeCartDrawer();
                  navigate('/collection');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-95 mb-8"
              >
                <span>Browse Products</span>
                <FiArrowRight size={14} />
              </button>

              {/* Category Discovery Shortcuts in Empty Drawer */}
              <div className="pt-6 border-t border-gray-800/60 max-w-xs mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2.5">
                  Popular Departments
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {[
                    { label: "Electronics", slug: "electronics" },
                    { label: "Men", slug: "men" },
                    { label: "Women", slug: "women" },
                    { label: "Kids", slug: "kids" },
                    { label: "Home", slug: "home" },
                  ].map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        closeCartDrawer();
                        navigate(`/collection?category=${cat.slug}`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#181818] hover:bg-[#222222] border border-gray-800 text-[11px] text-gray-300 hover:text-orange-400 font-medium transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            items.map((item: any) => {
              const productName = item.variant?.product?.name || item.sellerListing?.variant?.product?.name || "Product";
              const productSlug = item.variant?.product?.slug || item.sellerListing?.variant?.product?.slug || "";
              const variantName = item.variant?.name || item.sellerListing?.variant?.name || "Standard";
              const imageUrl = item.variant?.images?.[0]?.url || item.sellerListing?.variant?.images?.[0]?.url;
              const price = Number(item.priceAtAddTime || item.sellerListing?.price || 0);
              const maxStock = Math.min(item.availableStock ?? 10, 10);
              const isMaxReached = item.quantity >= maxStock;

              return (
                <div
                  key={item.id}
                  className="bg-[#141414] border border-gray-800/80 rounded-2xl p-3.5 flex gap-3.5 items-center transition hover:border-gray-700/80 shadow-sm group"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${productSlug}`}
                    onClick={closeCartDrawer}
                    className="w-16 h-16 sm:w-20 sm:h-20 max-w-[64px] sm:max-w-[80px] max-h-[64px] sm:max-h-[80px] bg-[#1A1A1A] rounded-xl overflow-hidden shrink-0 border border-gray-800/80 block group/thumb"
                  >
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={productName} 
                        className="w-full h-full max-w-full max-h-full object-cover object-center group-hover/thumb:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <span className="text-[10px] text-gray-600 flex items-center justify-center h-full">No Img</span>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${productSlug}`}
                      onClick={closeCartDrawer}
                      className="text-white font-semibold text-xs sm:text-sm line-clamp-2 hover:text-orange-400 transition-colors leading-snug"
                      title={productName}
                    >
                      {productName}
                    </Link>

                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <Badge variant="neutral" size="sm">{variantName}</Badge>
                    </div>

                    {/* Unit Price & Total */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <Price amount={price * item.quantity} size="sm" highlight showDiscountBadge={false} />
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          ({item.quantity} × {currency}{price.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stepper & Delete Action */}
                  <div className="flex flex-col items-end justify-between h-full gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => removeCartItemOptimistic(item.id)}
                      className="text-gray-500 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-gray-800/60"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <FiTrash2 size={15} />
                    </button>

                    <QuantityStepper
                      value={item.quantity}
                      min={1}
                      max={maxStock}
                      size="sm"
                      disabled={isMaxReached}
                      onChange={(newQty) => updateCartItemQty(item.id, newQty)}
                      ariaLabel={`Quantity for ${productName}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Sticky Footer with Subtotal & CTAs */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#141414] border-t border-gray-800 space-y-3 shadow-2xl">
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-gray-400 font-medium">Estimated Subtotal</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white">
                  {currency}{cartSubtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 flex items-center justify-between">
                <span>All Nepal taxes included. Delivery computed next.</span>
                {cartSubtotal >= freeShippingThreshold && (
                  <span className="text-emerald-400 font-bold uppercase text-[9px]">Free Delivery</span>
                )}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  closeCartDrawer();
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.99] group"
              >
                <span>Proceed to Checkout</span>
                <FiArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/cart"
                onClick={closeCartDrawer}
                className="w-full py-2.5 bg-[#1C1C1C] hover:bg-[#252525] border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-colors block text-center"
              >
                View Full Cart
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10.5px] text-gray-500 pt-1.5 border-t border-gray-800/80">
              <FiShield className="text-orange-500 w-3.5 h-3.5 shrink-0" />
              <span>Safe & Secure 256-bit Encrypted Checkout • Cash on Delivery</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
