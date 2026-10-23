import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const SearchSuggestions = ({ onSearch }) => {
  const { search, searchHistory, searchSuggestions } = useContext(ShopContext);

  // 1. Show HISTORY (When input is empty)
  if (search.length === 0) {
    if (searchHistory.length === 0) return null;

    return (
      // Removed bg, border, and shadow to blend with parent
      <div className="pt-2">
        <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Recent Searches</h4>

        <div className="flex flex-wrap gap-3">
          {searchHistory.map((item, index) => (
            <button
              key={index}
              onClick={() => onSearch(item)}
              className="px-4 py-2 text-sm bg-[#1f1f1f] text-gray-300 rounded-full hover:bg-amber-500 hover:text-black transition-colors border border-gray-700 hover:border-amber-500"
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
    // Removed bg, border, and shadow
    <div className="pt-2">
      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Suggestions</h4>

      {searchSuggestions.length === 0 ? (
        <p className="text-gray-500 text-sm py-2">No matching products...</p>
      ) : (
        <div className="flex flex-col">
          {searchSuggestions.map((item) => (
            <button
              key={item._id}
              onClick={() => onSearch(item.name)}
              className="w-full text-left py-3 px-2 rounded-lg hover:bg-[#1f1f1f] text-gray-300 text-sm transition-colors flex justify-between items-center group border-b border-gray-800 last:border-0"
            >
              <span className="group-hover:text-white transition-colors">{item.name}</span>
              <span className="text-xs text-gray-600 group-hover:text-amber-500">Jump to result</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;