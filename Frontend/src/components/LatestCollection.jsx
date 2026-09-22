import React, { useEffect, useState } from "react";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { browseProducts } from "../api/consumer.api";

const LatestCollection = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browseProducts({ sort: 'newest', limit: 10 }).then((res) => {
      setLatestProducts(res?.data?.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="my-10 px-4 sm:px-6 lg:px-8 container mx-auto">
      
      {/* HEADER SECTION */}
      <div className="text-center py-10">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="w-full sm:w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl">
          Discover the season's hottest trends. From casual wear to evening elegance, find your perfect look.
        </p>
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading latest products...</div>
      ) : latestProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-6">
          {latestProducts.map((item) => (
            <ProductItem
              key={item.id}
              slug={item.slug}
              image={item.primaryImage}
              name={item.name}
              price={item.cheapestPrice ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LatestCollection;