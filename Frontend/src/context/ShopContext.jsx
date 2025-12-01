import { createContext, useState, useEffect } from "react";
import { products } from "../assets/frontend_assets/assets"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ShopContext = createContext();

export const ShopContextProvider = ({ children }) => {
  const currency = "$";
  const delivery_fee = 10;
  const navigate = useNavigate();

  // ==============================================
  // 1. AUTH STATE (Login/Logout) - NEW ADDITION
  // ==============================================
  const [token, setToken] = useState("");

  // Logout Function
  const logout = () => {
      navigate('/login');
      localStorage.removeItem('token'); // Clear from storage
      setToken(""); // Clear state
      setCartItems({}); // Optional: Clear cart on logout
      toast.success("Logged Out");
  }

  // Check for token on App Load (Stay logged in on refresh)
  // Note: Since we don't have a backend yet, we rely on the manual setToken in Login.jsx
  useEffect(() => {
      if(localStorage.getItem('token')){
          setToken(localStorage.getItem('token'));
      }
  }, []);

  // ==============================================
  // 2. SEARCH STATE & LOGIC
  // ==============================================
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const addToHistory = (term) => {
    if (!term.trim()) return;
    setSearchHistory((prev) => {
      const updated = [term, ...prev.filter((i) => i !== term)];
      return updated.slice(0, 5);
    });
  };

  const searchSuggestions = search.length === 0 
    ? [] 
    : products.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6);

  const searchResults = products.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.subCategory.toLowerCase().includes(q)
    );
  });

  // ==============================================
  // 3. CART STATE & LOGIC
  // ==============================================
  const [cartItems, setCartItems] = useState({});

  const addToCart = async (itemId, size) => {
    if (!size) {
        toast.error("Select Product Size");
        return;
    }
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
        if (cartData[itemId][size]) {
            cartData[itemId][size] += 1;
        } else {
            cartData[itemId][size] = 1;
        }
    } else {
        cartData[itemId] = {};
        cartData[itemId][size] = 1;
    }
    setCartItems(cartData);
    toast.success("Added to Cart");
  }

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
  }

  const getCartCount = () => {
      let totalCount = 0;
      for(const items in cartItems){
          for(const item in cartItems[items]){
              try {
                  if (cartItems[items][item] > 0) {
                      totalCount += cartItems[items][item];
                  }
              } catch (error) {}
          }
      }
      return totalCount;
  }

  const getCartAmount = () => {
    let totalAmount = 0;
    for(const items in cartItems){
        let itemInfo = products.find((product)=> product._id === items);
        for(const item in cartItems[items]){
            try {
                if (cartItems[items][item] > 0) {
                    totalAmount += itemInfo.price * cartItems[items][item];
                }
            } catch (error) {}
        }
    }
    return totalAmount;
  }

  // ==============================================
  // 4. EXPORT VALUE
  // ==============================================
  const value = {
    products, currency, delivery_fee, navigate,
    
    // Auth
    token, setToken, logout,

    // Search
    search, setSearch, showSearch, setShowSearch, 
    searchSuggestions, searchResults, searchHistory, addToHistory,

    // Cart
    cartItems, setCartItems, addToCart, getCartCount, updateQuantity, getCartAmount
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};