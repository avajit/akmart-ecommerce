import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductBySlug, addToCart, getProductReviews, submitReview } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import { useAuthStore } from '../store/authStore';
import { formatImageUrl } from '../utils/imageUrl';
import { toast } from 'react-toastify';
import { 
  FiShoppingBag, 
  FiHeart, 
  FiTruck, 
  FiShield, 
  FiArrowRight, 
  FiBriefcase, 
  FiCheck, 
  FiStar, 
  FiThumbsUp, 
  FiMessageSquare, 
  FiEdit3, 
  FiCheckCircle, 
  FiX, 
  FiShoppingCart, 
  FiChevronLeft, 
  FiChevronRight,
  FiShare2,
  FiRotateCcw,
  FiZap,
  FiBox
} from 'react-icons/fi';
import { ImageUploader } from '../components/common/ImageUploader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import {
  Container,
  Button,
  IconButton,
  Input,
  Textarea,
  Badge,
  Card,
  Price,
  Rating,
  QuantityStepper,
  Skeleton,
} from '../components/ui';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, refreshCartCount, isInWishlist, toggleWishlist, addToCartOptimistic } = (useContext(ShopContext) as any) || { 
    currency: 'Rs. ', 
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useDocumentTitle(product?.name ? `${product.name} | Buy Online at AKMart` : 'Product Details');

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

  // Compute all available images for this product or current variant (supports strings or objects)
  const productImages = useMemo(() => {
    const normalizeImg = (img: any, idx: number) => {
      if (!img) return null;
      if (typeof img === 'string') return { id: `img-${idx}`, url: formatImageUrl(img) };
      if (img?.url) return { ...img, url: formatImageUrl(img.url) };
      return null;
    };

    const variantImgs = (currentVariant?.images || []).map(normalizeImg).filter(Boolean);
    if (variantImgs.length > 0) return variantImgs;

    const prodImgs = (product?.images || []).map(normalizeImg).filter(Boolean);
    if (prodImgs.length > 0) return prodImgs;

    if (product?.primaryImage) return [{ id: 'primary', url: formatImageUrl(product.primaryImage), isPrimary: true }];
    return [];
  }, [currentVariant?.images, product?.images, product?.primaryImage]);

  // Reset active image index whenever variant changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedVariantId]);

  const rawActive = productImages[activeImageIndex]?.url ||
    (typeof currentVariant?.images?.[0] === 'string' ? currentVariant.images[0] : currentVariant?.images?.[0]?.url) ||
    (typeof product?.images?.[0] === 'string' ? product.images[0] : product?.images?.[0]?.url) ||
    product?.primaryImage;
  const activeImageUrl = rawActive ? formatImageUrl(rawActive) : null;

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
      <div className="min-h-screen bg-surface-base py-12">
        <Container size="lg" className="space-y-8 animate-fadeIn">
          <Skeleton variant="text" width="40%" height={24} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Skeleton variant="rectangular" className="w-full aspect-[4/3] sm:aspect-square rounded-3xl" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={36} />
              <Skeleton variant="card" />
              <Skeleton variant="rectangular" width="100%" height={50} />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-surface-base flex items-center justify-center p-4">
        <Card padding="lg" className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-brand-saffron mx-auto">
            <FiBox className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-foreground-primary">Product Not Found</h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            The item you are searching for might be out of catalog or the link has changed.
          </p>
          <Button variant="primary" onClick={() => navigate('/collection')} fullWidth>
            Browse All Products
          </Button>
        </Card>
      </div>
    );
  }

  const price = primaryListing?.price != null ? Number(primaryListing.price) : null;
  const mrp = primaryListing?.mrp != null ? Number(primaryListing.mrp) : null;
  const savings = mrp && price && mrp > price ? mrp - price : 0;
  const savingsPercent = mrp && price && mrp > price ? Math.round((savings / mrp) * 100) : 0;
  const stock = primaryListing?.stock != null ? Number(primaryListing.stock) : 0;
  const isWishlisted = Boolean(currentVariant?.id && isInWishlist?.(currentVariant.id));

  return (
    <div className="min-h-screen bg-surface-base text-foreground-primary pt-4 sm:pt-6 pb-28 md:pb-16 font-sans">
      <Container size="lg" className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-foreground-secondary flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-foreground-primary transition-colors">Home</Link>
          <span className="text-border-strong">/</span>
          <Link to="/collection" className="hover:text-foreground-primary transition-colors">Catalog</Link>
          {product.category?.name && (
            <>
              <span className="text-border-strong">/</span>
              <span className="text-foreground-secondary truncate max-w-[120px] sm:max-w-xs">{product.category.name}</span>
            </>
          )}
          <span className="text-border-strong">/</span>
          <span className="text-foreground-primary font-medium truncate max-w-[140px] sm:max-w-sm" aria-current="page">
            {product.name}
          </span>
        </nav>

        {/* ── Main Product Commerce Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Responsive Image Gallery (max-height capped on phone) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="w-full aspect-[4/3] sm:aspect-square max-h-[380px] sm:max-h-[540px] bg-surface-card rounded-2xl sm:rounded-3xl border border-border-subtle flex items-center justify-center overflow-hidden shadow-xl relative group">
              {activeImageUrl ? (
                <img 
                  src={activeImageUrl} 
                  alt={product.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-2 sm:p-4 transition-transform duration-300 group-hover:scale-105" 
                />
              ) : (
                <span className="text-foreground-secondary text-sm">No Image Available</span>
              )}

              {/* Savings Badge */}
              {savingsPercent > 0 && (
                <div className="absolute top-3.5 left-3.5">
                  <Badge variant="saffron" dot>{savingsPercent}% OFF</Badge>
                </div>
              )}

              {/* Photo Counter Pill */}
              {productImages.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-surface-base/80 backdrop-blur-md text-foreground-secondary font-mono text-[11px] px-2.5 py-1 rounded-lg border border-border-subtle select-none">
                  {activeImageIndex + 1} / {productImages.length}
                </div>
              )}

              {/* Carousel Arrows (Min 44x44px Touch Target) */}
              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
                    }}
                    aria-label="Previous product photo"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-base/80 hover:bg-surface-base text-foreground-primary backdrop-blur-md flex items-center justify-center transition-all border border-border-subtle shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-saffron"
                  >
                    <FiChevronLeft className="text-lg" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
                    }}
                    aria-label="Next product photo"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-surface-base/80 hover:bg-surface-base text-foreground-primary backdrop-blur-md flex items-center justify-center transition-all border border-border-subtle shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-saffron"
                  >
                    <FiChevronRight className="text-lg" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip (Min 44x44px touch targets) */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {productImages.map((img: any, idx: number) => {
                  const isActive = idx === activeImageIndex;
                  return (
                    <button
                      key={img.id || `${img.url}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      onMouseEnter={() => setActiveImageIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                      className={`w-14 h-14 sm:w-16 sm:h-16 min-w-[44px] min-h-[44px] rounded-xl overflow-hidden cursor-pointer transition-all duration-150 shrink-0 relative bg-surface-card ${
                        isActive
                          ? 'ring-2 ring-brand-saffron ring-offset-2 ring-offset-surface-base scale-105 border-transparent shadow-md'
                          : 'border border-border-subtle opacity-70 hover:opacity-100 hover:border-border-strong'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.altText || `${product.name} thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Title, Pricing, Variants, and Action Center */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              {/* Brand and Category Metadata */}
              <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wider text-brand-saffron mb-1.5 flex-wrap">
                <span>{product.brand?.name || "AkMart Genuine"}</span>
                <span>•</span>
                <span>{product.category?.name || "Electronics"}</span>
                {currentVariant?.sku && (
                  <>
                    <span>•</span>
                    <span className="text-foreground-secondary font-mono text-[11px]">SKU: {currentVariant.sku}</span>
                  </>
                )}
              </div>

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground-primary leading-tight">
                {product.name}
              </h1>

              {/* Rating and Reviews Anchor */}
              <div className="flex items-center gap-2 mt-2">
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-2 text-xs text-foreground-secondary hover:text-brand-saffron transition-colors rounded py-1"
                >
                  <Rating rating={Number(averageRating) || 5} reviewCount={totalRatingsCount} size="sm" />
                  <span className="underline underline-offset-2">
                    {totalRatingsCount > 0 ? `Read reviews` : `Write first review`}
                  </span>
                </a>
              </div>
            </div>

            {/* Price Box with South Asian Lakh/Crore Formatting and Stock Badge */}
            <Card padding="md" className="space-y-3 bg-surface-card border-border-subtle shadow-sm">
              {primaryListing ? (
                <>
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <Price
                      amount={price || 0}
                      originalPrice={mrp || undefined}
                      size="xl"
                      highlight
                    />

                    {/* Stock Status Badge */}
                    {stock > 10 ? (
                      <Badge variant="success" dot>In Stock</Badge>
                    ) : stock > 0 ? (
                      <Badge variant="warning" dot>Only {stock} Left</Badge>
                    ) : (
                      <Badge variant="error">Out of Stock</Badge>
                    )}
                  </div>

                  {/* Seller Assurance Strip */}
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs text-foreground-secondary">
                    <span>
                      Sold by <strong className="text-foreground-primary">{primaryListing.sellerProfile?.shopName || "Verified Partner"}</strong>
                    </span>
                    <Badge variant="neutral" size="sm">Nepal COD Available</Badge>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  <p className="text-base font-bold text-red-400">Currently Out of Stock</p>
                  <p className="text-xs text-foreground-secondary mt-1">Check back later or select a different variant.</p>
                </div>
              )}
            </Card>

            {/* Dynamic Multi-Axis Variant Selectors (Min 44px Touch Targets) */}
            {attributeAxes.length > 0 ? (
              <div className="space-y-4 pt-1">
                {attributeAxes.map((axis) => {
                  const activeValue = selectedAttributes[axis.key] || (currentVariant?.attributes || {})[axis.key];

                  return (
                    <div key={axis.key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-foreground-secondary">
                          {axis.label}: <span className="text-foreground-primary font-semibold">{activeValue || 'Select'}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {axis.values.map((val) => {
                          const isSelected = activeValue === val;
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
                              className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-brand-saffron ${
                                isSelected
                                  ? 'border-brand-saffron bg-brand-saffron/15 text-brand-saffron shadow-sm'
                                  : 'border-border-subtle bg-surface-card text-foreground-primary hover:border-border-strong hover:bg-surface-elevated'
                              } ${!hasVariantWithStock ? 'opacity-40 line-through' : ''}`}
                            >
                              <span>{val}</span>
                              {isSelected && <FiCheck className="text-sm shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback flat variants */
              product.variants && product.variants.length > 1 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider">
                    Select Variant:
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                          className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-brand-saffron ${
                            isSelected
                              ? 'border-brand-saffron bg-brand-saffron/15 text-brand-saffron shadow-sm'
                              : 'border-border-subtle bg-surface-card text-foreground-primary hover:border-border-strong'
                          }`}
                        >
                          <span>{v.name}</span>
                          {!hasStock && <span className="ml-1 text-[10px] text-red-400 font-bold">(Out of Stock)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {/* Desktop Quantity & Action Buttons */}
            {primaryListing && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-foreground-secondary uppercase tracking-wider">Quantity:</span>
                  <QuantityStepper
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={stock > 0 ? stock : 1}
                    disabled={stock <= 0}
                    ariaLabel="Product quantity"
                  />
                  {stock > 0 && stock <= 5 && (
                    <span className="text-xs text-amber-400 font-medium">Hurry, limited stock!</span>
                  )}
                </div>

                {/* Primary Action Buttons (Desktop) */}
                {isMerchantOrAdmin ? (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Signed in as <strong>{role}</strong>. Consumer ordering requires shopper account.</span>
                    </div>
                    <Button 
                      variant="saffron" 
                      size="sm"
                      onClick={() => navigate(role === 'SELLER' ? '/seller/dashboard' : '/admin/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <Button
                      id="buy-now-btn"
                      variant="primary"
                      size="lg"
                      onClick={() => handleBuyNow()}
                      disabled={actionLoading || stock <= 0}
                      isLoading={actionLoading}
                      iconLeft={<FiShoppingBag className="text-base" />}
                      fullWidth
                    >
                      Buy Now
                    </Button>

                    <Button
                      id="add-to-cart-btn"
                      variant="secondary"
                      size="lg"
                      onClick={() => handleAddToCart()}
                      disabled={actionLoading || stock <= 0}
                      iconLeft={<FiShoppingCart className="text-base text-brand-saffron" />}
                      fullWidth
                    >
                      Add to Cart
                    </Button>
                  </div>
                )}

                {/* Wishlist & Share Row */}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant={isWishlisted ? "saffron" : "outline"}
                    size="md"
                    onClick={handleWishlist}
                    iconLeft={<FiHeart className={isWishlisted ? "fill-dark" : "text-brand-saffron"} />}
                    className="flex-1"
                  >
                    {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  </Button>

                  <IconButton
                    aria-label="Share product with friends"
                    variant="outline"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.name, url: window.location.href });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Product link copied to clipboard!');
                      }
                    }}
                  >
                    <FiShare2 className="text-lg" />
                  </IconButton>
                </div>
              </div>
            )}

            {/* Value Guarantees Card */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-foreground-secondary">
              <div className="flex items-center gap-2 bg-surface-card p-3 rounded-xl border border-border-subtle">
                <FiTruck className="text-brand-saffron w-4 h-4 shrink-0" />
                <span>Fast Nepal Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-card p-3 rounded-xl border border-border-subtle">
                <FiShield className="text-brand-saffron w-4 h-4 shrink-0" />
                <span>100% Genuine Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Additional Seller Offers (Multi-Vendor Marketplace Comparison) ── */}
        {listings.length > 1 && (
          <section className="pt-8 border-t border-border-subtle space-y-4" aria-labelledby="other-sellers-heading">
            <div className="flex items-center justify-between">
              <h2 id="other-sellers-heading" className="text-lg sm:text-xl font-bold tracking-tight text-foreground-primary">
                Compare Other Seller Offers ({listings.length - 1} more)
              </h2>
              <span className="text-xs text-foreground-secondary">Select best price or location</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {listings.slice(1).map((l: any) => (
                <Card key={l.id} padding="sm" className="flex items-center justify-between gap-4">
                  <div>
                    <Price amount={Number(l.price)} size="md" highlight />
                    <p className="text-xs text-foreground-secondary mt-0.5">
                      Sold by <strong className="text-foreground-primary">{l.sellerProfile?.shopName || "AkMart Seller"}</strong>
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-0.5">In Stock ({l.stock} available)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleAddToCart(l.id)}>
                      Add to Cart
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleBuyNow(l.id)}>
                      Buy Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ── Product Description & Detailed Specs ── */}
        <section className="pt-8 border-t border-border-subtle space-y-3" aria-labelledby="desc-heading">
          <h2 id="desc-heading" className="text-lg sm:text-xl font-bold tracking-tight text-foreground-primary">
            Product Description
          </h2>
          <Card padding="md" className="leading-relaxed text-sm text-foreground-secondary whitespace-pre-line">
            {product.description || "No full description provided for this item."}
          </Card>
        </section>

        {/* ── Customer Ratings & Reviews Section ── */}
        <section id="reviews-section" className="pt-10 border-t border-border-subtle space-y-6" aria-labelledby="reviews-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-saffron mb-1">
                <FiCheckCircle /> Verified Shopper Feedback
              </div>
              <h2 id="reviews-heading" className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground-primary">
                Customer Ratings & Reviews
              </h2>
              <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
                Authentic reviews from verified purchasers across Nepal.
              </p>
            </div>

            <Button
              variant="saffron"
              size="md"
              onClick={handleOpenReviewModal}
              iconLeft={<FiEdit3 />}
              className="self-start sm:self-auto"
            >
              Write a Review
            </Button>
          </div>

          {/* Loading Skeletons */}
          {reviewsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton variant="card" />
              <div className="md:col-span-2">
                <Skeleton variant="card" />
              </div>
            </div>
          )}

          {/* Empty State when 0 Reviews Exist */}
          {!reviewsLoading && mappedReviews.length === 0 && (
            <Card padding="lg" className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-brand-saffron mx-auto mb-3">
                <FiMessageSquare className="text-2xl" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground-primary">No Customer Reviews Yet</h3>
              <p className="text-xs sm:text-sm text-foreground-secondary max-w-sm mx-auto mt-1 mb-5">
                Be the first to share your experience with this product and guide other shoppers across Nepal!
              </p>
              <Button variant="primary" onClick={handleOpenReviewModal} iconLeft={<FiEdit3 />}>
                Write the First Review
              </Button>
            </Card>
          )}

          {/* Ratings Summary Card & Progress Bars */}
          {!reviewsLoading && mappedReviews.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Big Score Card */}
                <Card padding="md" className="flex flex-col justify-center items-center text-center">
                  <div className="text-5xl font-extrabold text-foreground-primary flex items-center gap-2">
                    {averageRating || '5.0'} <span className="text-amber-400 text-3xl">★</span>
                  </div>
                  <div className="my-2">
                    <Rating rating={Number(averageRating) || 5} size="md" showScore={false} />
                  </div>
                  <p className="text-xs text-foreground-secondary">
                    Based on {totalRatingsCount} verified {totalRatingsCount === 1 ? 'review' : 'reviews'}
                  </p>
                  {recommendedPercent !== null && (
                    <Badge variant="success" size="sm" className="mt-3">
                      {recommendedPercent}% of customers recommend this
                    </Badge>
                  )}
                </Card>

                {/* Star Progress Bars */}
                <Card padding="md" className="md:col-span-2 space-y-2.5 justify-center flex flex-col">
                  {breakdown.map((item) => (
                    <div key={item.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-8 font-semibold text-foreground-primary text-right">{item.stars}</span>
                      <div className="flex-1 h-2.5 bg-surface-subtle rounded-full overflow-hidden border border-border-subtle">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-foreground-secondary text-right font-mono text-[11px]">
                        {item.pct}% ({item.count})
                      </span>
                    </div>
                  ))}
                </Card>
              </div>

              {/* Review Filter Pills (Min 44px Tap Height) */}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <Button
                  variant={reviewFilter === 'ALL' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setReviewFilter('ALL')}
                >
                  All Reviews ({mappedReviews.length})
                </Button>
                <Button
                  variant={reviewFilter === '5' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setReviewFilter('5')}
                >
                  5 Stars ({breakdown.find(b => b.rating === 5)?.count || 0})
                </Button>
                <Button
                  variant={reviewFilter === '4' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setReviewFilter('4')}
                >
                  4 Stars ({breakdown.find(b => b.rating === 4)?.count || 0})
                </Button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {mappedReviews
                  .filter((r) => reviewFilter === 'ALL' || r.rating === Number(reviewFilter))
                  .map((rev) => (
                    <Card key={rev.id} padding="md" className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-elevated text-brand-saffron font-bold text-xs flex items-center justify-center uppercase border border-border-subtle shrink-0">
                            {rev.author.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground-primary text-sm">{rev.author}</span>
                              {rev.isVerified && (
                                <Badge variant="success" size="sm">Verified Buyer</Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-foreground-secondary">
                              {rev.city} • {rev.date}
                            </div>
                          </div>
                        </div>

                        <Rating rating={rev.rating} size="sm" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground-primary mb-1">{rev.title}</h4>
                        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">{rev.comment}</p>
                      </div>

                      {/* Customer Photo Attachments */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {rev.images.map((img: any, idx: number) => (
                            <a
                              key={img.id || idx}
                              href={img.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View full customer review photo ${idx + 1}`}
                              className="block"
                            >
                              <img
                                src={img.url}
                                alt={`Customer Review Photo ${idx + 1}`}
                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-border-subtle hover:border-brand-saffron transition-colors"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs flex-wrap gap-2">
                        <span className="text-[11px] text-foreground-secondary font-mono">
                          Verified Model: <strong className="text-foreground-primary">{rev.variantName}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (!helpfulClicked[rev.id]) {
                              setHelpfulClicked({ ...helpfulClicked, [rev.id]: true });
                              toast.success('Thank you for your feedback!');
                            }
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-saffron ${
                            helpfulClicked[rev.id]
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                              : 'bg-surface-subtle hover:bg-surface-elevated text-foreground-secondary hover:text-foreground-primary border border-border-subtle'
                          }`}
                        >
                          <FiThumbsUp className="text-xs" />
                          Helpful ({rev.helpfulCount + (helpfulClicked[rev.id] ? 1 : 0)})
                        </button>
                      </div>
                    </Card>
                  ))}
              </div>
            </>
          )}
        </section>
      </Container>

      {/* ── Sticky Mobile Bottom Action Bar (Mobile Phone Conversion Engine) ── */}
      {primaryListing && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-card/95 backdrop-blur-md border-t border-border-subtle p-3 px-4 flex items-center justify-between pb-safe shadow-2xl">
          <div className="flex flex-col">
            <Price amount={price || 0} size="sm" highlight />
            <span className="text-[10px] text-foreground-secondary">
              {stock > 0 ? (stock <= 5 ? `Only ${stock} left` : 'In Stock') : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAddToCart()}
              disabled={actionLoading || stock <= 0}
              iconLeft={<FiShoppingCart className="text-brand-saffron" />}
            >
              Cart
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBuyNow()}
              disabled={actionLoading || stock <= 0}
              iconLeft={<FiShoppingBag />}
            >
              Buy Now
            </Button>
          </div>
        </div>
      )}

      {/* ── Write Review Modal (Accessible Dialog & 16px Font Form) ── */}
      {showReviewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-surface-card border border-border-subtle rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-saffron/15 text-brand-saffron flex items-center justify-center">
                  <FiEdit3 className="text-lg" />
                </div>
                <div>
                  <h3 id="review-dialog-title" className="text-lg font-bold text-foreground-primary">
                    Write a Verified Review
                  </h3>
                  <p className="text-xs text-foreground-secondary truncate max-w-xs">{product.name}</p>
                </div>
              </div>
              <IconButton
                aria-label="Close review dialog"
                variant="ghost"
                onClick={() => setShowReviewModal(false)}
              >
                <FiX className="text-xl" />
              </IconButton>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newReview.title.trim() || !newReview.comment.trim()) {
                  return toast.error('Please complete both review headline and comments');
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
                <label className="block text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} of 5 stars`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center transition active:scale-95 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-saffron"
                    >
                      <FiStar
                        className={`text-2xl ${
                          star <= newReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-foreground-primary ml-2">{newReview.rating} of 5 Stars</span>
                </div>
              </div>

              <Input
                label="Headline / Title"
                required
                placeholder="e.g. Excellent build quality, fast delivery in Kathmandu!"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              />

              <Textarea
                label="Detailed Review"
                required
                rows={4}
                placeholder="Share details about performance, packaging, authenticity, and delivery..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              />

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
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitReviewMutation.isPending}
                  loadingText="Publishing..."
                >
                  Publish Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
