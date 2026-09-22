import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ShopContext = createContext();

export const ShopContextProvider = ({ children }) => {
  const currency = "NPR ";
  const delivery_fee = 100;
  const navigate = useNavigate();

  // ==============================================
  // 1. AUTH STATE (Login/Logout)
  // ==============================================
  const [token, setToken] = useState("");

  const logout = () => {
      navigate('/login');
      localStorage.removeItem('token'); 
      setToken(""); 
      toast.success("Logged Out");
  }

  useEffect(() => {
      if(localStorage.getItem('token')){
          setToken(localStorage.getItem('token'));
      }
  }, []);

  // ==============================================
  // 2. SEARCH STATE
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

  // ==============================================
  // 3. EXPORT VALUE
  // ==============================================
  const value = {
    currency, delivery_fee, navigate,
    
    // Auth
    token, setToken, logout,

    // Search
    search, setSearch, showSearch, setShowSearch, 
    searchHistory, addToHistory,

    // Legacy Stubs to prevent crashes in unmigrated components
    cartItems: {},
    getCartCount: () => 0,
    getCartAmount: () => 0,
    updateQuantity: () => {},
    addToCart: () => {},
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};