import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import { browseProducts } from "../api/consumer.api";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const LatestCollection = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    browseProducts({ sort: 'newest', limit: 8 }).then((res) => {
      setLatestProducts(res?.data?.products || []);
      setLoading(false);
    }).catch(() => setLoading(false));
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
        <div className="text-center text-gray-400 py-12">Loading featured products...</div>
      ) : latestProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No products available.</div>
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
