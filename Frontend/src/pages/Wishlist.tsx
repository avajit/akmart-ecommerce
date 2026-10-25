import React, { useEffect, useState, useContext } from 'react';
import { getWishlist, removeFromWishlist, addToCart } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiTrash2, FiHeart, FiArrowRight, FiShoppingCart } from 'react-icons/fi';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const { refreshWishlist, refreshCartCount, currency } = useContext(ShopContext) as any;
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
      toast.info("Select options on the product page");
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading your saved items...</p>
      </div>
    );
  }

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
          <FiHeart className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          Explore our trending catalog and bookmark your favorite products to buy later!
        </p>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-sm"
        >
          Explore Catalog <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-6 sm:pt-10 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">My Wishlist</h1>
          <p className="text-sm text-gray-400 mt-1">
            You have <span className="text-white font-medium">{wishlist.items.length}</span> item(s) saved
          </p>
        </div>
        <Link to="/collection" className="text-sm font-semibold text-orange-400 hover:underline hidden sm:inline-block">
          Continue Shopping &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-6">
        {wishlist.items.map((item: any) => {
          const hasListing = item.variant?.listings && item.variant.listings.length > 0;
          const price = item.cheapestPrice || item.variant?.listings?.[0]?.price;

          return (
            <div
              key={item.id}
              className="bg-[#141414] border border-gray-800/80 rounded-2xl p-3.5 sm:p-4 flex flex-col relative group transition-all duration-300 hover:border-orange-500/50 shadow-sm"
            >
              {/* Remove button */}
              <button
                onClick={() => handleRemove(item.variantId)}
                disabled={removingId === item.variantId}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-black/80 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
                title="Remove from wishlist"
              >
                <FiTrash2 size={15} />
              </button>

              <Link to={`/product/${item.variant?.product?.slug}`} className="flex-1 cursor-pointer flex flex-col">
                <div className="w-full aspect-[4/5] bg-[#1A1A1A] rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                  {item.variant?.images?.[0]?.url ? (
                    <img
                      src={item.variant.images[0].url}
                      alt={item.variant?.product?.name || "Product"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-xs text-gray-600">No Image</span>
                  )}
                </div>
                <p className="text-white font-medium text-xs sm:text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">
                  {item.variant?.product?.name}
                </p>
                <p className="text-gray-400 text-[11px] mt-0.5 mb-2 truncate">{item.variant?.name}</p>
                <p className="text-orange-400 font-bold text-xs sm:text-sm mt-auto">
                  {price ? `${displayCurrency}${Number(price).toLocaleString()}` : "Browse Product"}
                </p>
              </Link>

              {/* Move to cart CTA */}
              <div className="mt-3 pt-3 border-t border-gray-800/80">
                {hasListing ? (
                  <button
                    onClick={() => handleMoveToCart(item)}
                    disabled={movingId === item.variantId}
                    className="w-full py-2 px-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-40"
                  >
                    <FiShoppingCart className="w-3.5 h-3.5" />
                    <span>{movingId === item.variantId ? "Moving..." : "Move to Cart"}</span>
                  </button>
                ) : (
                  <Link
                    to={`/product/${item.variant?.product?.slug}`}
                    className="w-full py-2 px-3 bg-[#1E1E1E] hover:bg-[#252525] text-gray-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <span>View Product</span>
                    <FiArrowRight className="w-3 h-3 text-orange-400" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
