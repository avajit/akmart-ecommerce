import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ slug, image, name, price, bestseller }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link 
      className="group relative block overflow-hidden cursor-pointer" 
      to={`/product/${slug}`}
    >
      <div className="relative overflow-hidden rounded-lg bg-[#111] aspect-square flex items-center justify-center">
        
        {bestseller && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wide">
              Best Seller
            </span>
          </div>
        )}

        {image ? (
          <img
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={image}
            alt={name}
          />
        ) : (
          <span className="text-gray-600">No Image</span>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <span className="bg-white text-black px-4 py-2 text-xs font-bold uppercase rounded shadow hover:bg-yellow-400 hover:text-black transition">
            View Details
          </span>
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm text-gray-300 truncate group-hover:text-white transition">
          {name}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <p className="text-base font-bold text-yellow-400">
            {currency}{price}
          </p>
          <p className="text-xs text-gray-500">★★★★☆</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
