import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug, addToCart, addToWishlist } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiHeart, FiCheck, FiTruck, FiShield, FiArrowRight } from 'react-icons/fi';

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
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <button onClick={() => navigate('/collection')} className="text-emerald-400 hover:underline">
          Browse all products
        </button>
      </div>
    );
  }

  const imageUrl = currentVariant?.images?.[0]?.url || product.primaryImage || product.images?.[0]?.url;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="w-full aspect-square bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden shadow-2xl">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-600">No Image Available</span>
            )}
          </div>
        </div>

        {/* Product Details & Actions */}
        <div className="text-white space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium mb-2">
              <span>{product.brand?.name || "Generic"}</span>
              <span>•</span>
              <span>{product.category?.name || "Catalog"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{product.name}</h1>
          </div>

          {/* Pricing Header */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
            {primaryListing ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-emerald-400">
                    {currency}{Number(primaryListing.price).toLocaleString()}
                  </span>
                  {primaryListing.mrp && Number(primaryListing.mrp) > Number(primaryListing.price) && (
                    <span className="text-sm text-gray-500 line-through">
                      {currency}{Number(primaryListing.mrp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Sold by <span className="text-white font-medium">{primaryListing.sellerProfile?.shopName || "Verified Seller"}</span>
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold text-red-400">Currently Out of Stock</p>
                <p className="text-xs text-gray-400 mt-1">Check back later or select a different variant.</p>
              </div>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
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
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md ring-1 ring-emerald-500'
                          : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
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
                <span className="text-sm text-gray-400 font-medium">Quantity:</span>
                <div className="flex items-center bg-black border border-gray-700 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-white hover:text-emerald-400 text-base"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 text-white font-medium text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-white hover:text-emerald-400 text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Buy Now & Add to Cart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleBuyNow()}
                  disabled={actionLoading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-base uppercase tracking-wider"
                >
                  <FiShoppingBag className="w-5 h-5" />
                  Buy Now
                </button>

                <button
                  onClick={() => handleAddToCart()}
                  disabled={actionLoading}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all border border-gray-700 flex items-center justify-center gap-2 text-base uppercase tracking-wider"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition"
            >
              <FiHeart className="text-rose-500" />
              Save to Wishlist
            </button>
          </div>

          {/* Additional Seller Offers */}
          {listings.length > 1 && (
            <div className="border-t border-gray-800 pt-6 space-y-3">
              <h3 className="font-bold text-base text-white">Other Seller Offers</h3>
              <div className="space-y-2">
                {listings.slice(1).map((l: any) => (
                  <div key={l.id} className="bg-gray-900/60 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-emerald-400">{currency}{Number(l.price).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Sold by {l.sellerProfile?.shopName || "Seller"}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(l.id)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg border border-gray-700 font-medium"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(l.id)}
                        className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg font-bold"
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
            <h3 className="font-bold text-base text-white">Product Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{product.description || "No description provided."}</p>

            <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-gray-400">
              <div className="flex items-center gap-2 bg-gray-900/40 p-3 rounded-lg border border-gray-800/50">
                <FiTruck className="text-emerald-400 w-4 h-4" />
                <span>Fast Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-900/40 p-3 rounded-lg border border-gray-800/50">
                <FiShield className="text-emerald-400 w-4 h-4" />
                <span>100% Genuine Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
