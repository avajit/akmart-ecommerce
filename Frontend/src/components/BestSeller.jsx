import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    // FILTERING LOGIC:
    // 1. Filter products where bestseller is true
    // 2. Slice to take only the top 5 (or 10) to display on the home page
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 5)); 
  }, [products]);

  return (
    <div className="my-10 px-4 sm:px-6 lg:px-8 container mx-auto">
      <div className="text-center text-3xl py-8">
        <Title text1="BEST" text2="SELLERS" />
        <p className="w-full sm:w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl">
          Check out our most popular items that everyone is loving right now.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-6">
        {bestSeller.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
            bestseller={true}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;