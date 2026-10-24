import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";

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
}

const ProductItem: React.FC<ProductItemProps> = ({ slug, image, name, price, brand = "AkMart", oldPrice, discount = "15% OFF" }) => {
  const { currency } = useContext(ShopContext) as any;
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Use fallback if image is missing or is a placeholder URL
  const displayImage = (!image || image.includes('placehold.co') || image.includes('400x400'))
    ? FALLBACK_IMAGES[Math.abs(name?.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) || 0) % FALLBACK_IMAGES.length]
    : image;

  const displayPrice = price && Number(price) > 0 ? Number(price) : 2499; // Clean fallback price for demo items
  const displayOldPrice = oldPrice ? Number(oldPrice) : Math.round(displayPrice * 1.25);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Link 
      className="group relative flex flex-col cursor-pointer bg-[#141414] border border-gray-800/80 rounded-2xl overflow-hidden p-3 transition-all duration-300 hover:border-orange-500/50" 
      to={`/product/${slug}`}
    >
      {/* 4:5 Image Container with Wishlist Heart */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#1A1A1A]">
        <img
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          src={displayImage}
          alt={name}
        />

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          aria-label="Wishlist"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 hover:bg-orange-500 md:opacity-0 md:group-hover:opacity-100"
        >
          <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
        </button>

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
            {discount}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand in small uppercase grey */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            {brand}
          </p>
          {/* Product Name */}
          <h3 className="text-sm font-medium text-white truncate mt-0.5 group-hover:text-orange-400 transition-colors">
            {name}
          </h3>
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm font-bold text-white">
            {currency}{displayPrice.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 line-through">
            {currency}{displayOldPrice.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
