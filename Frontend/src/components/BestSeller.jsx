import React, { useEffect, useState } from "react";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { browseProducts } from "../api/consumer.api";

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

const BestSeller = () => {
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBestSellers = (showLoading = false) => {
      if (showLoading) setLoading(true);
      browseProducts({ limit: 5 })
        .then((res) => {
          if (isMounted) {
            setBestSeller(res?.data?.products || []);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    };

    loadBestSellers(false);

    // Auto-reload once server completes cold start
    const handleServerAwake = () => {
      loadBestSellers(true);
    };

    window.addEventListener('akmart:backend-ready', handleServerAwake);
    return () => {
      isMounted = false;
      window.removeEventListener('akmart:backend-ready', handleServerAwake);
    };
  }, []);

  return (
    <div className="my-10 px-4 sm:px-6 lg:px-8 container mx-auto">
      <div className="text-center text-3xl py-8">
        <Title text1="BEST" text2="SELLERS" />
        <p className="w-full sm:w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl">
          Check out our most popular items that everyone is loving right now.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <ProductSkeleton key={n} />
          ))}
        </div>
      ) : bestSeller.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-[#12151c]/50 rounded-2xl border border-gray-800/50">
          <p className="text-sm">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-6">
          {bestSeller.map((item) => (
            <ProductItem
              key={item.id}
              slug={item.slug}
              name={item.name}
              image={item.primaryImage}
              price={item.cheapestPrice ?? 0}
              variantId={item.variants?.[0]?.id}
              bestseller={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSeller;
