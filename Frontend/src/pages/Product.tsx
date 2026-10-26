import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductBySlug, addToCart, getProductReviews, submitReview } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { 
  FiShoppingBag, 
  FiHeart, 
  FiTruck, 
  FiShield, 
  FiArrowRight, 
  FiBriefcase, 
  FiCheck, 
  FiTag,
  FiBox,
  FiStar,
  FiThumbsUp,
  FiMessageSquare,
  FiEdit3,
  FiCheckCircle,
  FiX,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { ImageUploader } from '../components/common/ImageUploader';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, refreshCartCount, isInWishlist, toggleWishlist, addToCartOptimistic } = (useContext(ShopContext) as any) || { 
    currency: 'NPR ', 
    refreshCartCount: () => {},
    isInWishlist: () => false,
    toggleWishlist: async () => false,
    addToCartOptimistic: async () => {},
  };
  const { user } = useAuthStore();
  const role = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();
  const isMerchantOrAdmin = role === 'ADMIN';

  const [product, setProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Verified Customer Reviews via TanStack React Query
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: () => getProductReviews(product!.id),
    enabled: !!product?.id,
  });

  const reviewData = reviewsResponse?.data || reviewsResponse || {};
  const serverReviews: any[] = Array.isArray(reviewData.reviews) ? reviewData.reviews : [];

  const mappedReviews = useMemo(() => {
    return serverReviews.map((r: any) => ({
      id: r.id,
      author: r.user?.fullName || 'Verified Shopper',
      city: 'Nepal',
      rating: Number(r.rating) || 5,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : 'Recent',
      title: r.title || 'Product Review',
      comment: r.body || '',
      variantName: 'Verified Purchase',
      helpfulCount: 0,
      isVerified: !!r.isVerifiedPurchase,
      images: r.images || [],
    }));
  }, [serverReviews]);

  const { averageRating, breakdown, totalRatingsCount, recommendedPercent } = useMemo(() => {
    if (mappedReviews.length === 0) {
      return {
        averageRating: null,
        totalRatingsCount: 0,
        recommendedPercent: null,
        breakdown: [
          { stars: '5 ★', rating: 5, pct: 0, count: 0, color: 'bg-emerald-500' },
          { stars: '4 ★', rating: 4, pct: 0, count: 0, color: 'bg-green-500' },
          { stars: '3 ★', rating: 3, pct: 0, count: 0, color: 'bg-amber-500' },
          { stars: '2 ★', rating: 2, pct: 0, count: 0, color: 'bg-orange-500' },
          { stars: '1 ★', rating: 1, pct: 0, count: 0, color: 'bg-rose-500' },
        ],
      };
    }

    const total = mappedReviews.length;
    const sum = mappedReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    const avg = (sum / total).toFixed(1);

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    mappedReviews.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    const posCount = counts[5] + counts[4];
    const recPct = Math.round((posCount / total) * 100);

    const b = [
      { stars: '5 ★', rating: 5, pct: Math.round((counts[5] / total) * 100), count: counts[5], color: 'bg-emerald-500' },
      { stars: '4 ★', rating: 4, pct: Math.round((counts[4] / total) * 100), count: counts[4], color: 'bg-green-500' },
      { stars: '3 ★', rating: 3, pct: Math.round((counts[3] / total) * 100), count: counts[3], color: 'bg-amber-500' },
      { stars: '2 ★', rating: 2, pct: Math.round((counts[2] / total) * 100), count: counts[2], color: 'bg-orange-500' },
      { stars: '1 ★', rating: 1, pct: Math.round((counts[1] / total) * 100), count: counts[1], color: 'bg-rose-500' },
    ];

    return {
      averageRating: avg,
      totalRatingsCount: total,
      recommendedPercent: recPct,
      breakdown: b,
    };
  }, [mappedReviews]);

  const [reviewFilter, setReviewFilter] = useState<'ALL' | '5' | '4'>('ALL');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [attachedReviewKey, setAttachedReviewKey] = useState<string | null>(null);
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  const submitReviewMutation = useMutation({
    mutationFn: (data: { rating: number; title: string; body: string; imageKeys?: string[] }) => {
      if (!product?.id) throw new Error('Product not available');
      return submitReview(product.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
      setShowReviewModal(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      setAttachedReviewKey(null);
      toast.success('Your verified review was published successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to submit review');
    },
  });

  const handleOpenReviewModal = () => {
    if (!user) {
      toast.info('Please log in with your customer account to write a review');
      navigate('/login');
      return;
    }
    if (role === 'ADMIN' || role === 'SELLER') {
      toast.info('Reviews can only be submitted from consumer accounts');
      return;
    }
    setShowReviewModal(true);
  };

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getProductBySlug(slug)
        .then((res: any) => {
          const prod = res.data;
          setProduct(prod);
          if (prod?.variants?.length > 0) {
            const initialVariant = prod.variants[0];
            setSelectedVariantId(initialVariant.id);
            if (initialVariant.attributes && typeof initialVariant.attributes === 'object') {
              setSelectedAttributes(initialVariant.attributes);
            }
          }
          setLoading(false);
        })
        .catch(() => {
          toast.error("Product not found");
          setLoading(false);
        });
    }
  }, [slug]);

  const currentVariant = useMemo(() => {
    return product?.variants?.find((v: any) => v.id === selectedVariantId) || product?.variants?.[0];
  }, [product?.variants, selectedVariantId]);

  const listings = useMemo(() => {
    return currentVariant?.listings?.filter((l: any) => l.isActive && !l.deletedAt) || [];
  }, [currentVariant]);

  const primaryListing = listings[0]; // Lowest price / default seller

  // Extract all distinct attribute axes across all variants (e.g. Color, Size, RAM, Storage)
  const attributeAxes = useMemo(() => {
    if (!product?.variants) return [];
    const keysMap = new Map<string, Set<string>>();

    product.variants.forEach((v: any) => {
      if (v.attributes && typeof v.attributes === 'object') {
        Object.entries(v.attributes).forEach(([k, val]) => {
          if (val !== undefined && val !== null && String(val).trim() !== '' && k !== 'edition') {
            if (!keysMap.has(k)) {
              keysMap.set(k, new Set<string>());
            }
            keysMap.get(k)!.add(String(val).trim());
          }
        });
      }
    });

    return Array.from(keysMap.entries()).map(([key, valsSet]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      values: Array.from(valsSet),
    }));
  }, [product?.variants]);

  // Handle multi-axis attribute selection
  const handleSelectAttribute = (axisKey: string, value: string) => {
    const nextSelection = { ...selectedAttributes, [axisKey]: value };
    setSelectedAttributes(nextSelection);

    // 1. Try to find variant matching all selected attributes
    let matching = product.variants.find((v: any) => {
      const attrs = v.attributes || {};
      return Object.entries(nextSelection).every(([k, vVal]) => attrs[k] === vVal);
    });

    // 2. If exact combination does not exist, pick variant that matches clicked value
    if (!matching) {
      matching = product.variants.find((v: any) => (v.attributes || {})[axisKey] === value);
    }

    if (matching) {
      setSelectedVariantId(matching.id);
      setQuantity(1);
      if (matching.attributes && typeof matching.attributes === 'object') {
        setSelectedAttributes(matching.attributes);
      }
    }
  };

  const handleAddToCart = async (listingId?: string) => {
    if (isMerchantOrAdmin) {
      toast.info("Merchant and Administrator accounts cannot place consumer orders. Please use a Consumer account to purchase.");
      return;
    }
    const targetListingId = listingId || primaryListing?.id;
    if (!targetListingId) {
      return toast.error("No active seller available for this variant.");
    }
    const targetListing = listings.find((l: any) => l.id === targetListingId) || primaryListing;
    const itemDetails = {
      productName: product?.name || 'Product',
      productSlug: product?.slug || '',
      variantName: currentVariant?.name || 'Standard',
      imageUrl: activeImageUrl || currentVariant?.images?.[0]?.url || product?.images?.[0]?.url,
      price: Number(targetListing?.price || 0),
      stock: Number(targetListing?.stock || 10),
      shopName: targetListing?.sellerProfile?.shopName || 'AkMart Verified Seller'
    };

    setActionLoading(true);
    try {
      if (typeof addToCartOptimistic === 'function') {
        await addToCartOptimistic({
          sellerListingId: targetListingId,
          variantId: currentVariant.id,
          quantity,
          itemDetails
        });
      } else {
        await addToCart({ sellerListingId: targetListingId, variantId: currentVariant.id, quantity });
        if (typeof refreshCartCount === 'function') refreshCartCount();
        toast.success(`Added ${quantity} item(s) to cart!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to add to cart");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async (listingId?: string) => {
    if (isMerchantOrAdmin) {
      toast.info("Merchant and Administrator accounts cannot place consumer orders. Please use a Consumer account to purchase.");
      return;
    }
    const targetListingId = listingId || primaryListing?.id;
    if (!targetListingId) {
      return toast.error("No active seller available for this variant.");
    }
    const targetListing = listings.find((l: any) => l.id === targetListingId) || primaryListing;
    const itemDetails = {
      productName: product?.name || 'Product',
      productSlug: product?.slug || '',
      variantName: currentVariant?.name || 'Standard',
      imageUrl: activeImageUrl || currentVariant?.images?.[0]?.url || product?.images?.[0]?.url,
      price: Number(targetListing?.price || 0),
      stock: Number(targetListing?.stock || 10),
      shopName: targetListing?.sellerProfile?.shopName || 'AkMart Verified Seller'
    };

    setActionLoading(true);
    try {
      if (typeof addToCartOptimistic === 'function') {
        await addToCartOptimistic({
          sellerListingId: targetListingId,
          variantId: currentVariant.id,
          quantity,
          itemDetails
        });
      } else {
        await addToCart({ sellerListingId: targetListingId, variantId: currentVariant.id, quantity });
      }
      navigate('/checkout');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to proceed to checkout");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWishlist = async () => {
    if (!currentVariant?.id) return;
    if (toggleWishlist) {
      await toggleWishlist(currentVariant.id);
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

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Compute all available images for this product or current variant
  const productImages = useMemo(() => {
    const variantImgs = (currentVariant?.images || []).filter((img: any) => img?.url);
    if (variantImgs.length > 0) return variantImgs;
    const prodImgs = (product?.images || []).filter((img: any) => img?.url);
    if (prodImgs.length > 0) return prodImgs;
    if (product?.primaryImage) return [{ id: 'primary', url: product.primaryImage, isPrimary: true }];
    return [];
  }, [currentVariant?.images, product?.images, product?.primaryImage]);

  // Reset active image index whenever variant changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedVariantId]);

  const activeImageUrl = productImages[activeImageIndex]?.url || currentVariant?.images?.[0]?.url || product.primaryImage;
  const price = primaryListing?.price != null ? Number(primaryListing.price) : null;
  const mrp = primaryListing?.mrp != null ? Number(primaryListing.mrp) : null;
  const savings = mrp && price && mrp > price ? mrp - price : 0;
  const savingsPercent = mrp && price && mrp > price ? Math.round((savings / mrp) * 100) : 0;
  const stock = primaryListing?.stock != null ? Number(primaryListing.stock) : 0;

  return (
    <div className="max-w-7xl mx-auto pt-6 sm:pt-10 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product Images Gallery */}
        <div className="space-y-4">
          <div className="w-full aspect-square bg-[#141414] rounded-3xl border border-gray-800/80 flex items-center justify-center overflow-hidden shadow-2xl relative group">
            {activeImageUrl ? (
              <img 
                src={activeImageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover object-center transition-all duration-300" 
              />
            ) : (
              <span className="text-gray-600">No Image Available</span>
            )}

            {/* Savings Pill Overlay */}
            {savingsPercent > 0 && (
              <div className="absolute top-4 left-4 bg-orange-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg">
                {savingsPercent}% OFF
              </div>
            )}

            {/* Photo Counter Badge */}
            {productImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-gray-300 font-mono text-[11px] px-2.5 py-1 rounded-lg border border-gray-700/50 select-none">
                {activeImageIndex + 1} / {productImages.length}
              </div>
            )}

            {/* Carousel Previous / Next Chevrons */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
                  }}
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-gray-700/60 shadow-lg active:scale-95"
                >
                  <FiChevronLeft className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
                  }}
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-gray-700/60 shadow-lg active:scale-95"
                >
                  <FiChevronRight className="text-lg" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery Strip (up to 5 or more photos) */}
          {productImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {productImages.map((img: any, idx: number) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={img.id || `${img.url}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 shrink-0 relative ${
                      isActive
                        ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-black scale-105 border-transparent shadow-lg shadow-orange-500/20'
                        : 'border border-gray-800 opacity-60 hover:opacity-100 hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `${product.name} photo ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Engine */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wider text-orange-400 mb-2">
              <span>{product.brand?.name || "AkMart"}</span>
              <span>•</span>
              <span>{product.category?.name || "Catalog"}</span>
              {currentVariant?.sku && (
                <>
                  <span>•</span>
                  <span className="text-gray-400 font-mono text-[11px]">SKU: {currentVariant.sku}</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{product.name}</h1>
            {/* Quick Star Rating Anchor linking to #reviews-section */}
            <div className="flex items-center gap-2 mt-2">
              {averageRating ? (
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-2 text-xs group text-gray-300 hover:text-orange-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                >
                  <div className="flex items-center gap-1 text-amber-400">
                    <FiStar className="fill-amber-400 text-amber-400 text-sm" />
                    <span className="font-bold text-white text-sm">{averageRating}</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-orange-400 transition underline underline-offset-2">
                    ({totalRatingsCount} {totalRatingsCount === 1 ? 'review' : 'reviews'})
                  </span>
                </a>
              ) : (
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                >
                  <div className="flex items-center gap-0.5 text-gray-600">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar key={s} className="text-xs" />
                    ))}
                  </div>
                  <span className="underline underline-offset-2">No reviews yet • Write a review</span>
                </a>
              )}
            </div>
          </div>

          {/* Pricing Box with Savings & Live Stock */}
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-5 space-y-3">
            {primaryListing ? (
              <>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-white">
                    {currency}{price?.toLocaleString()}
                  </span>
                  {mrp && mrp > (price || 0) && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        {currency}{mrp.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
                        Save {currency}{savings.toLocaleString()} ({savingsPercent}%)
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 text-xs">
                  <p className="text-gray-400">
                    Sold by <span className="text-white font-semibold">{primaryListing.sellerProfile?.shopName || "Verified Seller"}</span>
                  </p>

                  {/* Stock Status Badges */}
                  {stock > 10 ? (
                    <span className="inline-flex items-center gap-1.5 text-green-400 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full text-[11px] border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      In Stock
                    </span>
                  ) : stock > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full text-[11px] border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Only {stock} left - order soon
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full text-[11px] border border-red-500/20">
                      Out of Stock
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div>
                <p className="text-base font-bold text-red-400">Currently Out of Stock</p>
                <p className="text-xs text-gray-400 mt-1">Check back later or select a different variant.</p>
              </div>
            )}
          </div>

          {/* ── Dynamic Multi-Axis Variant Selectors (Amazon / Flipkart Standard) ── */}
          {attributeAxes.length > 0 ? (
            <div className="space-y-4 pt-1">
              {attributeAxes.map(axis => {
                const activeValue = selectedAttributes[axis.key] || (currentVariant?.attributes || {})[axis.key];

                return (
                  <div key={axis.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-gray-400">
                        {axis.label}: <span className="text-white font-semibold">{activeValue || 'Select'}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {axis.values.map(val => {
                        const isSelected = activeValue === val;
                        // Check if any variant with this value is currently in stock
                        const hasVariantWithStock = product.variants.some((v: any) => {
                          const attrs = v.attributes || {};
                          const matchesAxis = attrs[axis.key] === val;
                          const inStock = v.listings?.some((l: any) => l.isActive && !l.deletedAt && l.stock > 0);
                          return matchesAxis && inStock;
                        });

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleSelectAttribute(axis.key, val)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                              isSelected
                                ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-md shadow-orange-500/10'
                                : 'border-gray-800 bg-[#141414] text-gray-300 hover:border-gray-700 hover:text-white'
                            } ${!hasVariantWithStock ? 'opacity-40 line-through' : ''}`}
                          >
                            <span>{val}</span>
                            {isSelected && <FiCheck size={12} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback for products without multi-axis attributes: flat buttons */
            product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Select Variant
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v: any) => {
                    const isSelected = selectedVariantId === v.id;
                    const hasStock = v.listings && v.listings.some((l: any) => l.isActive && !l.deletedAt && l.stock > 0);
                    return (
                      <button
                        key={v.id}
                        type="button"
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
            )
          )}

          {/* Quantity and Purchase Buttons */}
          {primaryListing && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity:</span>
                <div className="flex items-center bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-white hover:text-orange-400 text-sm font-bold disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 text-white font-semibold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-white hover:text-orange-400 text-sm font-bold disabled:opacity-30"
                    disabled={stock > 0 && quantity >= stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons or Merchant Warning */}
              {isMerchantOrAdmin ? (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FiBriefcase className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Signed in as <strong>{role}</strong>. Consumer ordering is restricted to shopper accounts.</span>
                  </div>
                  <button 
                    onClick={() => navigate(role === 'SELLER' ? '/seller/dashboard' : '/admin/dashboard')}
                    className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shrink-0 transition-colors shadow-sm"
                  >
                    Go to {role === 'SELLER' ? 'Seller' : 'Admin'} Dashboard
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="buy-now-btn"
                    onClick={() => handleBuyNow()}
                    disabled={actionLoading || stock <= 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none group"
                  >
                    <FiShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Buy Now</span>
                  </button>

                  <button
                    id="add-to-cart-btn"
                    onClick={() => handleAddToCart()}
                    disabled={actionLoading || stock <= 0}
                    className="w-full bg-[#181818] hover:bg-[#222222] text-white font-bold py-3.5 px-6 rounded-xl transition-all border border-gray-700/80 hover:border-orange-500/50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none shadow-sm"
                  >
                    {actionLoading ? (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiShoppingCart className="w-4 h-4 text-orange-400" />
                    )}
                    <span>{actionLoading ? 'Adding...' : 'Add To Cart'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Wishlist Button */}
          <div className="pt-1">
            <button
              onClick={handleWishlist}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                currentVariant?.id && isInWishlist?.(currentVariant.id)
                  ? 'bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-sm'
                  : 'bg-[#1A1A1A] border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white'
              }`}
            >
              <FiHeart className={`w-4 h-4 transition-transform active:scale-125 ${currentVariant?.id && isInWishlist?.(currentVariant.id) ? 'fill-orange-500 text-orange-500' : 'text-orange-500'}`} />
              <span>{currentVariant?.id && isInWishlist?.(currentVariant.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
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

      {/* ── Verified Customer Ratings & Reviews (Amazon / Flipkart Standard) ── */}
      <div id="reviews-section" className="mt-16 pt-12 border-t border-gray-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
              <FiCheckCircle /> Verified Shopper Feedback
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Customer Ratings & Reviews</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Real feedback from verified purchasers across Nepal.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenReviewModal}
            className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] self-start md:self-auto"
          >
            <FiEdit3 className="text-base" /> Write a Review
          </button>
        </div>

        {/* Loading State Skeleton */}
        {reviewsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl h-48 flex flex-col justify-center items-center" />
            <div className="bg-[#141414] border border-gray-800/80 p-6 rounded-2xl md:col-span-2 h-48" />
          </div>
        )}

        {/* Empty State when 0 Reviews Exist */}
        {!reviewsLoading && mappedReviews.length === 0 && (
          <div className="bg-[#141414] border border-dashed border-gray-800 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center text-2xl border border-orange-500/20">
              <FiMessageSquare />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-lg font-bold text-white">No Customer Reviews Yet</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Be the first to share your experience with this product and help shoppers across Nepal make confident purchases!
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D]"
            >
              <FiEdit3 className="text-base" /> Write the First Review
            </button>
          </div>
        )}

        {/* Dynamic Rating Breakdown Summary Grid */}
        {!reviewsLoading && mappedReviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Big Score Card */}
              <div className="bg-[#141414] border border-gray-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center shadow-xl">
                <div className="text-5xl font-extrabold text-white flex items-center gap-2">
                  {averageRating || '5.0'} <span className="text-amber-400 text-3xl">★</span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`text-sm ${
                        star <= Math.round(Number(averageRating) || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  Based on {totalRatingsCount} verified {totalRatingsCount === 1 ? 'review' : 'reviews'}
                </p>
                {recommendedPercent !== null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold mt-4">
                    <FiCheckCircle className="text-xs" /> {recommendedPercent}% Recommended
                  </span>
                )}
              </div>

              {/* Star Progress Bars */}
              <div className="bg-[#141414] border border-gray-800 p-6 rounded-2xl md:col-span-2 space-y-2.5 shadow-xl justify-center flex flex-col">
                {breakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3 text-xs">
                    <span className="w-8 font-semibold text-gray-300 text-right">{item.stars}</span>
                    <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-gray-400 text-right font-mono text-[11px]">
                      {item.pct}% ({item.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setReviewFilter('ALL')}
                className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  reviewFilter === 'ALL'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                All Reviews ({mappedReviews.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('5')}
                className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  reviewFilter === '5'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                5 Stars Only ({breakdown.find(b => b.rating === 5)?.count || 0})
              </button>
              <button
                type="button"
                onClick={() => setReviewFilter('4')}
                className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  reviewFilter === '4'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#141414] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                4 Stars Only ({breakdown.find(b => b.rating === 4)?.count || 0})
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {mappedReviews
                .filter((r) => reviewFilter === 'ALL' || r.rating === Number(reviewFilter))
                .map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#141414] border border-gray-800/80 rounded-2xl p-5 sm:p-6 space-y-3 shadow-md hover:border-gray-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm shrink-0">
                          {rev.author.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{rev.author}</span>
                            {rev.isVerified && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <FiCheckCircle className="text-[10px]" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {rev.city} • {rev.date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-gray-800 self-start sm:self-auto">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`text-xs ${
                              star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-white ml-1">{rev.rating}.0</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">{rev.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{rev.comment}</p>
                    </div>

                    {/* Customer Photo Attachments */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {rev.images.map((img: any, idx: number) => (
                          <a
                            key={img.id || idx}
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View full customer review photo ${idx + 1}`}
                            className="block group"
                          >
                            <img
                              src={img.url}
                              alt={`Customer Review Photo ${idx + 1}`}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-700/80 group-hover:border-orange-500 transition shadow-sm"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs flex-wrap gap-2">
                      <span className="text-[11px] text-gray-400 font-mono">
                        Specification: <strong className="text-gray-300">{rev.variantName}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (!helpfulClicked[rev.id]) {
                            setHelpfulClicked({ ...helpfulClicked, [rev.id]: true });
                            toast.success('Thank you for your feedback!');
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                          helpfulClicked[rev.id]
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <FiThumbsUp className="text-xs" />
                        Helpful ({rev.helpfulCount + (helpfulClicked[rev.id] ? 1 : 0)})
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* ── Write Review Modal ── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141414] border border-gray-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <FiEdit3 />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Write a Customer Review</h3>
                  <p className="text-xs text-gray-400">{product.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                aria-label="Close review dialog"
                className="p-2 rounded-lg text-gray-400 hover:text-white bg-gray-800/60 hover:bg-gray-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newReview.title.trim() || !newReview.comment.trim()) {
                  return toast.error('Please complete both review title and comments');
                }
                submitReviewMutation.mutate({
                  rating: newReview.rating,
                  title: newReview.title.trim(),
                  body: newReview.comment.trim(),
                  imageKeys: attachedReviewKey ? [attachedReviewKey] : undefined,
                });
              }}
              className="space-y-4"
            >
              {/* Star Rating Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} of 5 stars`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-2 transition active:scale-95 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <FiStar
                        className={`text-2xl ${
                          star <= newReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-700 hover:text-gray-500'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white ml-2">{newReview.rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label htmlFor="review-title" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Headline / Title *
                </label>
                <input
                  id="review-title"
                  required
                  type="text"
                  placeholder="e.g. Excellent build quality, fast delivery!"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500"
                />
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Detailed Review *
                </label>
                <textarea
                  id="review-comment"
                  required
                  rows={4}
                  placeholder="Share details about durability, sizing, freshness, packaging, and performance..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500"
                />
              </div>

              {/* Customer Photo Attachment */}
              <div>
                <ImageUploader
                  purpose="review-photo"
                  label="Attach Customer Photo (Optional)"
                  maxSizeMB={5}
                  onUploaded={(res) => setAttachedReviewKey(res.key)}
                  onCleared={() => setAttachedReviewKey(null)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#1F1F1F] hover:bg-[#252525] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitReviewMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition shadow-lg shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  {submitReviewMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    'Publish Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
