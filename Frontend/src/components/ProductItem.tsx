import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { formatImageUrl } from "../utils/imageUrl";
import { Price, Badge } from "./ui";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop",
];

export interface ProductItemProps {
  slug: string;
  image?: string;
  name: string;
  price: number | string;
  brand?: string;
  oldPrice?: number | string;
  discount?: string;
  variantId?: string;
  bestseller?: boolean;
}

export const ProductItem: React.FC<ProductItemProps> = ({ 
  slug, 
  image, 
  name, 
  price, 
  brand = "AkMart", 
  oldPrice, 
  discount,
  variantId
}) => {
  const { currency, isInWishlist, toggleWishlist } = useContext(ShopContext) as any;
  const navigate = useNavigate();

  const isWishlisted = variantId ? isInWishlist(variantId) : false;

  // Format and resolve image URL, falling back if missing or placeholder
  const formatted = formatImageUrl(image);
  const displayImage = (!formatted || formatted.includes('placehold.co') || formatted.includes('400x400'))
    ? FALLBACK_IMAGES[Math.abs(name?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0) % FALLBACK_IMAGES.length]
    : formatted;

  const displayPrice = price && Number(price) > 0 ? Number(price) : 0;
  const displayOldPrice = oldPrice && Number(oldPrice) > displayPrice ? Number(oldPrice) : null;
  const calculatedDiscount = discount && discount !== "15% OFF"
    ? discount
    : (displayOldPrice && displayOldPrice > displayPrice 
        ? `${Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)}% OFF` 
        : null);

  const [isPending, setIsPending] = useState(false);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    if (variantId && toggleWishlist) {
      setIsPending(true);
      try {
        await toggleWishlist(variantId);
      } finally {
        setIsPending(false);
      }
    } else {
      navigate(`/product/${slug}`);
    }
  };

  return (
    <Link 
      className="group relative flex flex-col bg-surface-card border border-border-subtle rounded-2xl overflow-hidden p-3 transition-all duration-200 hover:border-brand-saffron/50 hover:shadow-xl hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-saffron focus-visible:outline-none" 
      to={`/product/${slug}`}
    >
      {/* 4:5 Image Container with Wishlist Heart */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-surface-subtle">
        <img
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          src={displayImage}
          alt={name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            const fallback = FALLBACK_IMAGES[Math.abs(name?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0) % FALLBACK_IMAGES.length];
            if (e.currentTarget.src !== fallback) {
              e.currentTarget.src = fallback;
            }
          }}
        />

        {/* Wishlist Heart Toggle Button (44x44px touch target) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={isPending}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-pressed={isWishlisted}
          className={`absolute top-2 right-2 z-10 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all duration-150 shadow-md ${
            isWishlisted
              ? "bg-surface-base/90 text-brand-saffron border border-brand-saffron/60 scale-100"
              : "bg-surface-base/60 backdrop-blur-md text-foreground-primary hover:bg-brand-saffron hover:text-dark md:opacity-0 md:group-hover:opacity-100"
          } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
        >
          <FiHeart 
            className={`w-4 h-4 transition-transform duration-150 active:scale-125 ${
              isWishlisted ? 'fill-brand-saffron text-brand-saffron' : 'text-current'
            }`} 
          />
        </button>

        {/* Discount Badge */}
        {calculatedDiscount && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="saffron" size="sm">{calculatedDiscount}</Badge>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Brand */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground-secondary truncate">
            {brand}
          </p>
          {/* Product Name */}
          <h3 className="text-sm font-medium text-foreground-primary line-clamp-2 mt-0.5 group-hover:text-brand-saffron transition-colors leading-snug">
            {name}
          </h3>
        </div>

        {/* Pricing with South Asian Lakh / Crore format */}
        <div className="pt-1 border-t border-border-subtle/50">
          <Price
            amount={displayPrice}
            originalPrice={displayOldPrice || undefined}
            size="sm"
            showDiscountBadge={false}
            highlight
          />
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
