import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import { browseProducts } from "../api/consumer.api";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const ProductSkeleton = () => (
  <div className="bg-[#141721] rounded-2xl p-3 border border-gray-800/60 animate-pulse flex flex-col justify-between h-[340px]">
    <div className="w-full h-48 bg-gray-800/60 rounded-xl" />
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-800/80 rounded w-3/4" />
      <div className="h-3 bg-gray-800/50 rounded w-1/2" />
    </div>
    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800/50">
      <div className="h-5 bg-orange-500/20 rounded w-1/3" />
      <div className="h-8 w-8 bg-gray-800/80 rounded-lg" />
    </div>
  </div>
);

const LatestCollection = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = (showLoading = false) => {
      if (showLoading) setLoading(true);
      browseProducts({ sort: 'newest', limit: 8 })
        .then((res) => {
          if (isMounted) {
            setLatestProducts(res?.data?.products || []);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    };

    loadProducts(false);

    // Re-fetch automatically once the cloud server finishes booting
    const handleServerAwake = () => {
      loadProducts(true);
    };

    window.addEventListener('akmart:backend-ready', handleServerAwake);
    return () => {
      isMounted = false;
      window.removeEventListener('akmart:backend-ready', handleServerAwake);
    };
  }, []);

  return (
    <div className="py-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Handpicked</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Featured Products</h2>
        </div>
        <Link to="/collection" className="mt-4 md:mt-0 text-sm font-semibold text-orange-500 hover:text-orange-400 flex items-center gap-2 group">
          <span>View all</span>
          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <ProductSkeleton key={n} />
          ))}
        </div>
      ) : latestProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-[#12151c]/50 rounded-2xl border border-gray-800/50">
          <p className="text-sm">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {latestProducts.map((item) => (
            <ProductItem
              key={item.id}
              slug={item.slug}
              image={item.primaryImage}
              name={item.name}
              price={item.cheapestPrice ?? 0}
              brand={item.brand?.name || "AkMart"}
              variantId={item.variants?.[0]?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestCollection;
