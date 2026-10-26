import React, { useEffect, useState, useContext, useMemo } from 'react';
import { getWishlist, removeFromWishlist, addToCart, clearWishlist } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiTrash2, 
  FiHeart, 
  FiArrowRight, 
  FiShoppingCart, 
  FiCheck, 
  FiShoppingBag, 
  FiLayers, 
  FiAlertTriangle 
} from 'react-icons/fi';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [movingAll, setMovingAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { refreshWishlist, refreshCartCount, currency } = (useContext(ShopContext) as any) || {};
  const displayCurrency = currency || 'NPR ';

  const fetchWishlist = () => {
    getWishlist()
      .then((res: any) => {
        setWishlist(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || err.message || "Failed to load wishlist");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const items = wishlist?.items || [];

  // Compute in-stock items available for direct 1-click cart addition
  const inStockItems = useMemo(() => {
    return items.filter((item: any) => {
      const listing = item.variant?.listings?.[0];
      return !!listing && item.isAvailable !== false && (item.availableStock === undefined || item.availableStock > 0);
    });
  }, [items]);

  const handleRemove = async (variantId: string) => {
    setRemovingId(variantId);
    try {
      await removeFromWishlist(variantId);
      toast.success("Removed from wishlist");
      fetchWishlist();
      refreshWishlist?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleMoveToCart = async (item: any) => {
    const listingId = item.variant?.listings?.[0]?.id;
    if (!listingId) {
      toast.info("Please select active options on the product page");
      return;
    }

    setMovingId(item.variantId);
    try {
      await addToCart({ sellerListingId: listingId, variantId: item.variantId, quantity: 1 });
      await removeFromWishlist(item.variantId);
      toast.success("Moved to cart!");
      refreshCartCount?.();
      refreshWishlist?.();
      fetchWishlist();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to move to cart");
    } finally {
      setMovingId(null);
    }
  };

  const handleMoveAllToCart = async () => {
    if (inStockItems.length === 0) {
      toast.info("No in-stock items to move");
      return;
    }

    setMovingAll(true);
    let movedCount = 0;

    for (const item of inStockItems) {
      const listingId = item.variant?.listings?.[0]?.id;
      if (!listingId) continue;
      try {
        await addToCart({ sellerListingId: listingId, variantId: item.variantId, quantity: 1 });
        await removeFromWishlist(item.variantId);
        movedCount++;
      } catch (err) {
        // Continue processing remaining items
      }
    }

    setMovingAll(false);
    refreshCartCount?.();
    refreshWishlist?.();
    fetchWishlist();

    if (movedCount > 0) {
      toast.success(`Successfully moved ${movedCount} item(s) to your cart!`);
    } else {
      toast.error("Could not move items to cart. Please check merchant inventory.");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearWishlist();
      toast.success("Wishlist cleared");
      setShowClearConfirm(false);
      refreshWishlist?.();
      fetchWishlist();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to clear wishlist");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Loading your saved items...</p>
      </div>
    );
  }

  // Tier-1 Empty State with Category Shortcuts
  if (!wishlist || !items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-2xl"></div>
          <div className="w-20 h-20 bg-[#141414] rounded-2xl flex items-center justify-center mx-auto border border-gray-800 shadow-xl relative text-orange-400">
            <FiHeart className="w-9 h-9" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">Your Wishlist is Empty</h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Explore thousands of authentic products across Nepal and bookmark your favorites for fast checkout later.
        </p>

        {/* Quick Category Exploration Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-xl mx-auto">
          <Link
            to="/collection?category=electronics"
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 border border-gray-800 hover:border-orange-500/30 text-xs font-semibold transition"
          >
            Mobiles & Tech
          </Link>
          <Link
            to="/collection?category=men"
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 border border-gray-800 hover:border-orange-500/30 text-xs font-semibold transition"
          >
            Men's Fashion
          </Link>
          <Link
            to="/collection?category=women"
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 border border-gray-800 hover:border-orange-500/30 text-xs font-semibold transition"
          >
            Women's Fashion
          </Link>
          <Link
            to="/collection?category=home-living"
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] hover:bg-orange-500/10 text-gray-300 hover:text-orange-400 border border-gray-800 hover:border-orange-500/30 text-xs font-semibold transition"
          >
            Home & Living
          </Link>
        </div>

        <Link
          to="/collection"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider active:scale-[0.99]"
        >
          <span>Explore Full Catalog</span>
          <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-6 sm:pt-10 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      {/* Page Header with Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase flex items-center gap-3">
            <span>My Wishlist</span>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
              {items.length} Saved
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {inStockItems.length} of {items.length} items currently in stock and ready to ship
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2.5">
          {inStockItems.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              disabled={movingAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99]"
            >
              {movingAll ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Moving All...</span>
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Move All In Stock ({inStockItems.length})</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#1A1A1A] hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 border border-gray-800 hover:border-rose-500/30 rounded-xl text-xs font-semibold transition"
            title="Clear all saved items"
          >
            <FiTrash2 className="w-4 h-4" />
            <span className="hidden md:inline">Clear All</span>
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-6">
        {items.map((item: any) => {
          const primaryListing = item.variant?.listings?.[0];
          const hasListing = !!primaryListing;
          const availableStock = item.availableStock ?? (primaryListing ? (primaryListing.stock - (primaryListing.reservedStock || 0)) : 0);
          const inStock = hasListing && item.isAvailable !== false && availableStock > 0;
          const price = item.cheapestPrice || primaryListing?.price;
          const productName = item.variant?.product?.name || "Product";
          const productSlug = item.variant?.product?.slug || "";
          const variantName = item.variant?.name || "Standard";
          const imageUrl = item.variant?.images?.[0]?.url;

          return (
            <div
              key={item.id}
              className="bg-[#141414] border border-gray-800/80 rounded-2xl p-3.5 sm:p-4 flex flex-col relative group transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl shadow-black/40"
            >
              {/* Dynamic Stock Status Badge */}
              <div className="absolute top-3 left-3 z-10">
                {!inStock ? (
                  <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                    Out of Stock
                  </span>
                ) : availableStock <= 5 ? (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                    Only {availableStock} Left!
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md">
                    In Stock
                  </span>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.variantId)}
                disabled={removingId === item.variantId}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-black/80 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
                title="Remove from wishlist"
              >
                <FiTrash2 size={14} />
              </button>

              <Link to={`/product/${productSlug}`} className="flex-1 cursor-pointer flex flex-col">
                <div className="w-full aspect-[4/5] bg-[#1A1A1A] rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-gray-800/60 relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-xs text-gray-600">No Image</span>
                  )}
                  {!inStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider bg-black/80 px-2.5 py-1 rounded-lg border border-rose-500/30">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-white font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
                  {productName}
                </p>
                <p className="text-gray-400 text-[11px] mt-0.5 mb-2 truncate">{variantName}</p>
                <div className="mt-auto">
                  <p className="text-orange-400 font-extrabold text-xs sm:text-sm">
                    {price ? `${displayCurrency}${Number(price).toLocaleString()}` : "Browse Product"}
                  </p>
                </div>
              </Link>

              {/* Move to cart CTA */}
              <div className="mt-3 pt-3 border-t border-gray-800/80">
                {inStock ? (
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={movingId === item.variantId}
                    className="w-full py-2.5 px-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
                  >
                    {movingId === item.variantId ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiShoppingCart className="w-3.5 h-3.5" />
                    )}
                    <span>{movingId === item.variantId ? "Moving..." : "Move to Cart"}</span>
                  </button>
                ) : (
                  <Link
                    to={`/product/${productSlug}`}
                    className="w-full py-2.5 px-3 bg-[#1E1E1E] hover:bg-[#252525] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <span>View Product</span>
                    <FiArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Wishlist Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <FiTrash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear entire wishlist?</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                This will remove all {items.length} saved product(s) from your wishlist. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#222] text-gray-300 text-xs font-semibold transition border border-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-lg shadow-rose-500/20"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

