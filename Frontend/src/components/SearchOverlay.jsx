import React, { useContext, useEffect, useRef } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLocation, Link } from 'react-router-dom'
import { FiX, FiSearch } from "react-icons/fi"; 
import SearchSuggestions from './SearchSuggestions';

const SearchOverlay = () => {

    const { 
        search, setSearch, showSearch, setShowSearch, 
        navigate, addToHistory, searchResults 
    } = useContext(ShopContext);
    
    const location = useLocation();
    const inputRef = useRef(null);

    useEffect(() => {
        if(showSearch && inputRef.current) inputRef.current.focus();
    }, [showSearch])

    useEffect(() => {
        setShowSearch(false); 
    }, [location])

    // Perform Search
    const handleSearch = (term) => {
        setSearch(term);
        addToHistory(term);
        setShowSearch(false);
        navigate('/collection');
    }

    if (!showSearch) return null;

    return (
        <div 
            className='fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex justify-center pt-24 px-4 pb-10'
            onMouseDown={() => setShowSearch(false)}
        >
            <div 
                className='w-full max-w-2xl h-fit flex flex-col bg-[#121212] rounded-2xl shadow-2xl overflow-hidden border border-gray-800' 
                onMouseDown={(e) => e.stopPropagation()} 
            >
                
                {/* --- SEARCH INPUT HEADER --- */}
                <div className='flex items-center gap-3 p-4 border-b border-gray-800'>
                    <FiSearch className="text-xl text-amber-500" />
                    <input 
                        ref={inputRef}
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
                        className='flex-1 bg-transparent outline-none text-white text-lg placeholder-gray-500' 
                        type="text" 
                        placeholder='Search products...' 
                    />
                    <FiX 
                        onClick={() => setShowSearch(false)} 
                        className="text-2xl text-gray-400 cursor-pointer hover:text-white transition-colors" 
                    />
                </div>

                {/* --- RESULTS AREA --- */}
                <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
                    
                    {/* LOGIC FIX: Only show suggestions if NO products found (or if typing) */}
                    {searchResults.length === 0 ? (
                        <div className="p-4">
                             <SearchSuggestions onSearch={handleSearch} />
                             {search.length > 0 && <p className="text-center text-gray-500 mt-4">No products found.</p>}
                        </div>
                    ) : (
                        /* CLEAN PRODUCT LIST (No heavy boxes) */
                        <div className="flex flex-col">
                            {searchResults.slice(0, 6).map((item) => (
                                <Link
                                    key={item._id}
                                    to={`/product/${item._id}`} 
                                    onClick={() => setShowSearch(false)} 
                                    className="flex items-center gap-4 p-4 hover:bg-[#1f1f1f] transition-colors border-b border-gray-800 last:border-0 group cursor-pointer"
                                >
                                    <img 
                                        src={item.image[0]} 
                                        alt={item.name} 
                                        className="w-12 h-12 object-cover rounded bg-gray-800"
                                    />
                                    <div className="flex-1">
                                        <p className="text-gray-200 text-sm font-medium group-hover:text-amber-500 transition-colors">{item.name}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">${item.price}</p>
                                    </div>
                                    <span className="text-xs text-gray-600 group-hover:text-amber-500">View</span>
                                </Link>
                            ))}
                            
                            {/* "View All" Button */}
                            <button 
                                onClick={() => handleSearch(search)}
                                className="w-full py-3 text-sm text-gray-400 hover:text-white hover:bg-[#1f1f1f] transition-colors text-center border-t border-gray-800"
                            >
                                View all results for "{search}"
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default SearchOverlay