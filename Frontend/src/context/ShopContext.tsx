import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCart } from "../api/consumer.api";
import { useAuthStore } from "../store/authStore";

interface ShopContextType {
  currency: string;
  delivery_fee: number;
  navigate: any;
  search: string;
  setSearch: (s: string) => void;
  showSearch: boolean;
  setShowSearch: (b: boolean) => void;
  searchHistory: string[];
  addToHistory: (term: string) => void;
  cartCount: number;
  getCartCount: () => number;
  refreshCartCount: () => void;
  cartItems: Record<string, any>;
  getCartAmount: () => number;
  updateQuantity: () => void;
  addToCart: () => void;
}

export const ShopContext = createContext<ShopContextType>({
  currency: "NPR ",
  delivery_fee: 100,
  navigate: () => {},
  search: "",
  setSearch: () => {},
  showSearch: false,
  setShowSearch: () => {},
  searchHistory: [],
  addToHistory: () => {},
  cartCount: 0,
  getCartCount: () => 0,
  refreshCartCount: () => {},
  cartItems: {},
  getCartAmount: () => 0,
  updateQuantity: () => {},
  addToCart: () => {},
});

export const ShopContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currency = "NPR ";
  const delivery_fee = 100;
  const navigate = useNavigate();

  const { isAuthenticated } = useAuthStore();
  const [cartCount, setCartCount] = useState<number>(0);

  // Fetch cart count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getCart()
        .then((res: any) => {
          const items = res.data?.items || [];
          const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
          setCartCount(count);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  // Search state
  const [search, setSearch] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    setSearchHistory((prev) => {
      const updated = [term, ...prev.filter((i) => i !== term)];
      return updated.slice(0, 5);
    });
  };

  const refreshCartCount = () => {
    if (isAuthenticated) {
      getCart().then((res: any) => {
        const items = res.data?.items || [];
        const count = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      }).catch(() => {});
    }
  };

  const value: ShopContextType = {
    currency,
    delivery_fee,
    navigate,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    searchHistory,
    addToHistory,
    cartCount,
    getCartCount: () => cartCount,
    refreshCartCount,
    cartItems: {},
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
