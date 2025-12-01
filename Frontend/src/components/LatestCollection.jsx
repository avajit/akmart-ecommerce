import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]);

  return (
    // Added 'container mx-auto' to center the whole section on ultra-wide screens
    <div className="my-10 px-4 sm:px-6 lg:px-8 container mx-auto">
      
      {/* HEADER SECTION */}
      <div className="text-center py-10">
        <Title text1="LATEST" text2="COLLECTIONS" />
        <p className="w-full sm:w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl">
          Discover the season's hottest trends. From casual wear to evening elegance, find your perfect look.
        </p>
      </div>

      {/* PRODUCT GRID */}
      {/* grid-cols-2: Mobile (iPhone)
         sm:grid-cols-3: Small Tablets
         md:grid-cols-4: Laptops
         lg:grid-cols-5: Large Screens
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-6">
        {latestProducts.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.image}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;