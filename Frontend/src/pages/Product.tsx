import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, addToCart, addToWishlist } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiHeart, FiTruck, FiShield, FiArrowRight } from 'react-icons/fi';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currency } = useContext(ShopContext) || { currency: 'NPR ' };

  const [product, setProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getProductBySlug(slug)
        .then((res: any) => {
          setProduct(res.data);
          if (res.data?.variants?.length > 0) {
            setSelectedVariantId(res.data.variants[0].id);
          }
          setLoading(false);
        })
        .catch(() => {
          toast.error("Product not found");
          setLoading(false);
        });
    }
  }, [slug]);

  const currentVariant = product?.variants?.find((v: any) => v.id === selectedVariantId) || product?.variants?.[0];
  const listings = currentVariant?.listings?.filter((l: any) => l.isActive && !l.deletedAt) || [];
  const primaryListing = listings[0]; // Lowest price / default seller

  const handleAddToCart = async (listingId?: string) => {
    const targetListingId = listingId || primaryListing?.id;
    if (!targetListingId) {
      return toast.error("No active seller available for this variant.");
    }
    setActionLoading(true);
    try {
      await addToCart({ sellerListingId: targetListingId, variantId: currentVariant.id, quantity });
      toast.success(`Added ${quantity} item(s) to cart! 🛒`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to add to cart. Are you logged in?");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async (listingId?: string) => {
    const targetListingId = listingId || primaryListing?.id;
    if (!targetListingId) {
      return toast.error("No active seller available for this variant.");
    }
    setActionLoading(true);
    try {
      await addToCart({ sellerListingId: targetListingId, variantId: currentVariant.id, quantity });
      navigate('/checkout');
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to proceed to checkout. Are you logged in?");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!currentVariant?.id) return;
    try {
      await addToWishlist(currentVariant.id);
      toast.success("Added to Wishlist! 💖");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to update wishlist. Are you logged in?");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center font-poppins">
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <button onClick={() => navigate('/collection')} className="text-orange-400 hover:underline text-sm">
          Browse all products
        </button>
      </div>
    );
  }

  const imageUrl = currentVariant?.images?.[0]?.url || product.primaryImage || product.images?.[0]?.url;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="w-full aspect-square bg-[#141414] rounded-2xl border border-gray-800/80 flex items-center justify-center overflow-hidden shadow-2xl">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover object-center" />
            ) : (
              <span className="text-gray-600">No Image Available</span>
            )}
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wider text-orange-400 mb-2">
              <span>{product.brand?.name || "AkMart"}</span>
              <span>•</span>
              <span>{product.category?.name || "Catalog"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{product.name}</h1>
          </div>

          {/* Pricing Header */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-5">
            {primaryListing ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-white">
                    {currency}{Number(primaryListing.price).toLocaleString()}
                  </span>
                  {primaryListing.mrp && Number(primaryListing.mrp) > Number(primaryListing.price) && (
                    <span className="text-sm text-gray-500 line-through">
                      {currency}{Number(primaryListing.mrp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Sold by <span className="text-white font-medium">{primaryListing.sellerProfile?.shopName || "Verified Seller"}</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-base font-bold text-red-400">Currently Out of Stock</p>
                <p className="text-xs text-gray-400 mt-1">Check back later or select a different variant.</p>
              </div>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Select Variant
              </label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariantId === v.id;
                  const hasStock = v.listings && v.listings.some((l: any) => l.isActive && !l.deletedAt);
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/15 text-orange-400 shadow-sm'
                          : 'border-gray-800 bg-[#1A1A1A] text-gray-300 hover:border-gray-700'
                      }`}
                    >
                      <span>{v.name}</span>
                      {!hasStock && <span className="ml-1.5 text-[10px] text-red-400 font-bold">(Out of Stock)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity and Purchase Buttons */}
          {primaryListing && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-white hover:text-orange-400 text-sm font-bold"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 text-white font-semibold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-white hover:text-orange-400 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Buy Now & Add to Cart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleBuyNow()}
                  disabled={actionLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.99]"
                >
                  <FiShoppingBag className="w-4 h-4" />
                  Buy Now
                </button>

                <button
                  onClick={() => handleAddToCart()}
                  disabled={actionLoading}
                  className="w-full bg-[#1A1A1A] hover:bg-[#222222] text-white font-bold py-3.5 px-6 rounded-xl transition-all border border-gray-800 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  Add To Cart
                </button>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <div>
            <button
              onClick={handleWishlist}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition"
            >
              <FiHeart className="text-orange-500 w-4 h-4" />
              Save to Wishlist
            </button>
          </div>

          {/* Additional Seller Offers */}
          {listings.length > 1 && (
            <div className="border-t border-gray-800 pt-6 space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-white">Other Seller Offers</h3>
              <div className="space-y-2">
                {listings.slice(1).map((l: any) => (
                  <div key={l.id} className="bg-[#141414] p-3.5 rounded-xl border border-gray-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white text-sm">{currency}{Number(l.price).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Sold by {l.sellerProfile?.shopName || "Seller"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(l.id)}
                        className="text-xs bg-[#1A1A1A] hover:bg-[#222222] text-white px-3 py-2 rounded-xl border border-gray-800 font-semibold transition"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(l.id)}
                        className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-xl font-bold transition"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description & Value Props */}
          <div className="border-t border-gray-800 pt-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">Product Description</h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{product.description || "No description provided."}</p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-gray-400">
              <div className="flex items-center gap-2.5 bg-[#141414] p-3 rounded-xl border border-gray-800/80">
                <FiTruck className="text-orange-500 w-4 h-4 shrink-0" />
                <span>Fast Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2.5 bg-[#141414] p-3 rounded-xl border border-gray-800/80">
                <FiShield className="text-orange-500 w-4 h-4 shrink-0" />
                <span>100% Genuine Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
