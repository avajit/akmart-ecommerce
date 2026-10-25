import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const SearchSuggestions = ({ onSearch }) => {
  const { search, searchHistory, searchSuggestions } = useContext(ShopContext);

  // 1. Show HISTORY (When input is empty)
  if (!search || search.length === 0) {
    if (!searchHistory || searchHistory.length === 0) return null;

    return (
      <div className="pt-2">
        <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Recent Searches</h4>

        <div className="flex flex-wrap gap-2">
          {searchHistory.map((item, index) => (
            <button
              key={index}
              onClick={() => onSearch(item)}
              className="px-3.5 py-1.5 text-xs bg-[#1A1A1A] text-gray-300 rounded-xl hover:bg-orange-500 hover:text-white transition-colors border border-gray-800 hover:border-orange-500 font-medium"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Show SUGGESTIONS (When typing)
  return (
    <div className="pt-2">
      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Suggestions</h4>

      {!searchSuggestions || searchSuggestions.length === 0 ? (
        <p className="text-gray-500 text-xs py-2">No matching products...</p>
      ) : (
        <div className="flex flex-col">
          {searchSuggestions.map((item) => (
            <button
              key={item._id || item.id}
              onClick={() => onSearch(item.name)}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-[#1A1A1A] text-gray-300 text-xs transition-colors flex justify-between items-center group border-b border-gray-800/60 last:border-0"
            >
              <span className="group-hover:text-white transition-colors">{item.name}</span>
              <span className="text-[11px] text-gray-500 group-hover:text-orange-400">Search &rarr;</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;