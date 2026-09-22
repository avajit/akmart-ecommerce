import React, { useEffect, useState } from "react";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { browseProducts } from "../api/consumer.api";

const BestSeller = () => {
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend doesn't support bestseller sort yet, so we just fetch latest and slice or rely on random.
    browseProducts({ limit: 5 }).then((res) => {
      // In a real app, sort by reviewCount or sales. For now, we take the top 5 returned.
      setBestSeller(res?.data?.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
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
        <div className="text-center text-gray-400 py-10">Loading best sellers...</div>
      ) : bestSeller.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-6">
          {bestSeller.map((item) => (
            <ProductItem
              key={item.id}
              slug={item.slug}
              name={item.name}
              image={item.primaryImage}
              price={item.cheapestPrice ?? 0}
              bestseller={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BestSeller;