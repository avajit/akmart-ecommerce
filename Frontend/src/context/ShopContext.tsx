import React, { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getCart, 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist, 
  updateCartItem, 
  removeCartItem, 
  addToCart as apiAddToCart,
  validateCoupon 
} from "../api/consumer.api";
import { useAuthStore } from "../store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export interface AddToCartPayload {
  sellerListingId: string;
  variantId: string;
  quantity: number;
  itemDetails?: {
    productName?: string;
    productSlug?: string;
    variantName?: string;
    imageUrl?: string;
    price?: number;
    stock?: number;
    shopName?: string;
  };
}

interface ShopContextType {
  currency: string;
  delivery_fee: number;
  freeShippingThreshold: number;
  navigate: any;
  search: string;
  setSearch: (s: string) => void;
  showSearch: boolean;
  setShowSearch: (b: boolean) => void;
  searchHistory: string[];
  addToHistory: (term: string) => void;

  // Cart State & Totals
  cart: any | null;
  cartLoading: boolean;
  cartCount: number;
  getCartCount: () => number;
  cartSubtotal: number;
  shippingFee: number;
  cartTotal: number;
  freeShippingGap: number;
  freeShippingProgress: number;

  // Cart Actions (Optimistic & Debounced)
  refreshCart: () => Promise<void>;
  refreshCartCount: () => void;
  clearCartLocally: (clearedItemIds?: string[]) => void;
  updateCartItemQty: (itemId: string, newQty: number) => void;
  removeCartItemOptimistic: (itemId: string) => Promise<void>;
  undoRemoveItem: () => Promise<void>;
  moveToWishlist: (item: any) => Promise<void>;
  addToCartOptimistic: (data: AddToCartPayload) => Promise<void>;

  // Mini-Cart Drawer
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;

  // Wishlist
  wishlistCount: number;
  wishlistIds: Set<string>;
  isInWishlist: (variantId: string) => boolean;
  toggleWishlist: (variantId: string) => Promise<boolean>;
  refreshWishlist: () => void;

  // Coupon Engine
  appliedCoupon: any;
  setAppliedCoupon: (coupon: any) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  discountAmount: number;
  finalPayable: number;

  // Legacy compatibility fallbacks
  cartItems: Record<string, any>;
  getCartAmount: () => number;
  updateQuantity: (id: string, qty: number) => void;
  addToCart: (data?: any) => void;
}

export const ShopContext = createContext<ShopContextType>({
  currency: "NPR ",
  delivery_fee: 100,
  freeShippingThreshold: 2500,
  navigate: () => {},
  search: "",
  setSearch: () => {},
  showSearch: false,
  setShowSearch: () => {},
  searchHistory: [],
  addToHistory: () => {},

  cart: null,
  cartLoading: false,
  cartCount: 0,
  getCartCount: () => 0,
  cartSubtotal: 0,
  shippingFee: 100,
  cartTotal: 0,
  freeShippingGap: 2500,
  freeShippingProgress: 0,

  refreshCart: async () => {},
  refreshCartCount: () => {},
  clearCartLocally: () => {},
  updateCartItemQty: () => {},
  removeCartItemOptimistic: async () => {},
  undoRemoveItem: async () => {},
  moveToWishlist: async () => {},
  addToCartOptimistic: async () => {},

  isCartDrawerOpen: false,
  setIsCartDrawerOpen: () => {},
  openCartDrawer: () => {},
  closeCartDrawer: () => {},

  wishlistCount: 0,
  wishlistIds: new Set(),
  isInWishlist: () => false,
  toggleWishlist: async () => false,
  refreshWishlist: () => {},

  appliedCoupon: null,
  setAppliedCoupon: () => {},
  applyCoupon: async () => false,
  removeCoupon: () => {},
  discountAmount: 0,
  finalPayable: 0,

  cartItems: {},
  getCartAmount: () => 0,
  updateQuantity: () => {},
  addToCart: () => {},
});

const GUEST_CART_STORAGE_KEY = 'akmart_guest_cart';

const getGuestCartItems = (): any[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuestCartItems = (items: any[]) => {
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save guest cart to localStorage", err);
  }
};

export const ShopContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currency = "NPR ";
  const FREE_SHIPPING_THRESHOLD = 2500;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const role = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();
  const isConsumerOrGuest = !isAuthenticated || role === 'CONSUMER';

  // Cart State
  const [cart, setCart] = useState<any | null>(null);
  const [cartLoading, setCartLoading] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Debounce timers & undo buffer
  const debounceTimers = useRef<Record<string, any>>({});
  const lastRemovedItem = useRef<any | null>(null);

  // Fetch Cart from Backend or Guest LocalStorage
  const refreshCart = async () => {
    if (isAuthenticated && isConsumerOrGuest) {
      try {
        setCartLoading(true);
        const res: any = await getCart();
        setCart(res.data);
        queryClient.setQueryData(['cart'], res);
      } catch {
        setCart(null);
      } finally {
        setCartLoading(false);
      }
    } else if (!isAuthenticated) {
      const guestCart = { id: 'guest-cart', items: getGuestCartItems() };
      setCart(guestCart);
      queryClient.setQueryData(['cart'], { success: true, data: guestCart });
      setCartLoading(false);
    } else {
      setCart(null);
      setCartLoading(false);
    }
  };

  // Synchronously clears checked out items (or entire cart) with 0ms UI lag
  const clearCartLocally = (clearedItemIds?: string[]) => {
    if (clearedItemIds && clearedItemIds.length > 0) {
      setCart((prev: any) => {
        if (!prev || !prev.items) return prev;
        const updatedItems = prev.items.filter((item: any) => !clearedItemIds.includes(item.id));
        const updatedCart = { ...prev, items: updatedItems };
        queryClient.setQueryData(['cart'], { success: true, data: updatedCart });
        return updatedCart;
      });
      if (!isAuthenticated) {
        const currentGuest = getGuestCartItems();
        const updated = currentGuest.filter((item: any) => !clearedItemIds.includes(item.id));
        saveGuestCartItems(updated);
      }
    } else {
      const emptyCart = { id: isAuthenticated ? cart?.id || 'cart' : 'guest-cart', items: [] };
      setCart(emptyCart);
      queryClient.setQueryData(['cart'], { success: true, data: emptyCart });
      if (!isAuthenticated) {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      }
    }
  };

  // Synchronize Guest Cart on Login & Mount
  useEffect(() => {
    if (isAuthenticated && isConsumerOrGuest) {
      const guestItems = getGuestCartItems();
      if (guestItems.length > 0) {
        (async () => {
          setCartLoading(true);
          try {
            for (const item of guestItems) {
              try {
                await apiAddToCart({
                  sellerListingId: item.sellerListingId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                });
              } catch (err) {
                console.error("Could not sync guest cart item to server", item, err);
              }
            }
            localStorage.removeItem(GUEST_CART_STORAGE_KEY);
            toast.success("Guest items synchronized with your account cart!");
          } finally {
            await refreshCart();
          }
        })();
        return;
      }
      refreshCart();
    } else if (!isAuthenticated) {
      setCart({ id: 'guest-cart', items: getGuestCartItems() });
      setCartLoading(false);
    } else {
      setCart(null);
      setCartLoading(false);
    }
  }, [isAuthenticated, role]);

  // Derived Financials
  const items = cart?.items || [];
  const cartCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const cartSubtotal = items.reduce(
    (sum: number, item: any) => sum + (Number(item.priceAtAddTime || item.sellerListing?.price || 0) * (item.quantity || 1)),
    0
  );
  const shippingFee = cartSubtotal >= FREE_SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : 100;
  const cartTotal = cartSubtotal + shippingFee;
  const freeShippingGap = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  // Applied Coupon State (Shared seamlessly across Cart, Drawer, and Checkout)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id?: string;
    code: string;
    description?: string | null;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    discountAmount: number;
    maxDiscount?: number | null;
    minOrderAmount?: number | null;
  } | null>(null);

  // Auto-invalidation if cart subtotal drops below coupon minimum order
  useEffect(() => {
    if (!appliedCoupon) return;
    if (appliedCoupon.minOrderAmount && cartSubtotal < appliedCoupon.minOrderAmount) {
      toast.warn(`Promo code "${appliedCoupon.code}" removed: subtotal is below NPR ${appliedCoupon.minOrderAmount.toLocaleString()}`);
      setAppliedCoupon(null);
    }
  }, [cartSubtotal, appliedCoupon]);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayable = Math.max(0, cartTotal - discountAmount);

  const applyCoupon = async (code: string): Promise<boolean> => {
    const clean = (code || "").trim().toUpperCase();
    if (!clean) {
      toast.error("Please enter a promo code");
      return false;
    }
    try {
      const res = await validateCoupon({ code: clean, subtotal: cartSubtotal });
      if (res.data?.coupon) {
        setAppliedCoupon(res.data.coupon);
        toast.success(res.message || `Coupon "${res.data.coupon.code}" applied!`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Invalid coupon code");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  // 1. Optimistic Debounced Quantity Stepper (0ms UI lag)
  const updateCartItemQty = (itemId: string, newQty: number) => {
    if (newQty < 1) {
      removeCartItemOptimistic(itemId);
      return;
    }

    const currentItem = cart?.items?.find((i: any) => i.id === itemId);
    const maxStock = Math.min(currentItem?.availableStock ?? 10, 10);
    if (newQty > maxStock) {
      toast.info(`Maximum quantity available is ${maxStock}`);
      return;
    }

    // Guest Mode (localStorage sync)
    if (!isAuthenticated) {
      const currentGuest = getGuestCartItems();
      const updated = currentGuest.map((i: any) => i.id === itemId ? { ...i, quantity: newQty } : i);
      saveGuestCartItems(updated);
      setCart({ id: 'guest-cart', items: updated });
      return;
    }

    // Authenticated Mode (Optimistic 0ms UI lag + 400ms debounce)
    const previousCart = cart;

    // Instant local state update (0ms)
    setCart((prev: any) => {
      if (!prev || !prev.items) return prev;
      return {
        ...prev,
        items: prev.items.map((item: any) => 
          item.id === itemId ? { ...item, quantity: newQty } : item
        ),
      };
    });

    // Clear any pending debounce timer for this specific item
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId]);
    }

    // Debounce server call by 400ms
    debounceTimers.current[itemId] = setTimeout(async () => {
      try {
        await updateCartItem(itemId, newQty);
        delete debounceTimers.current[itemId];
      } catch (err: any) {
        // Rollback on server error
        setCart(previousCart);
        const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to update quantity";
        toast.error(msg);
        delete debounceTimers.current[itemId];
      }
    }, 400);
  };

  // 2. Optimistic Item Removal with 1-Click "Undo"
  const removeCartItemOptimistic = async (itemId: string) => {
    if (!cart?.items) return;
    const itemToRemove = cart.items.find((i: any) => i.id === itemId);
    if (!itemToRemove) return;

    lastRemovedItem.current = itemToRemove;
    const previousCart = cart;

    // Instant local removal
    setCart((prev: any) => ({
      ...prev,
      items: prev.items.filter((i: any) => i.id !== itemId),
    }));

    if (!isAuthenticated) {
      const currentGuest = getGuestCartItems();
      const updated = currentGuest.filter((i: any) => i.id !== itemId);
      saveGuestCartItems(updated);
      toast.info(
        ({ closeToast }) => (
          <div className="flex items-center justify-between gap-3 text-xs font-poppins">
            <span>Removed item from cart</span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                closeToast();
                await undoRemoveItem();
              }}
              className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-lg text-[10px] uppercase tracking-wide transition shadow-sm"
            >
              Undo
            </button>
          </div>
        ),
        { autoClose: 5000 }
      );
      return;
    }

    try {
      await removeCartItem(itemId);
      toast.info(
        ({ closeToast }) => (
          <div className="flex items-center justify-between gap-3 text-xs font-poppins">
            <span>Removed item from cart</span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                closeToast();
                await undoRemoveItem();
              }}
              className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold rounded-lg text-[10px] uppercase tracking-wide transition shadow-sm"
            >
              Undo
            </button>
          </div>
        ),
        { autoClose: 5000 }
      );
    } catch {
      setCart(previousCart);
      toast.error("Failed to remove item");
    }
  };

  // 3. Undo Removal Handler
  const undoRemoveItem = async () => {
    if (!lastRemovedItem.current) return;
    const item = lastRemovedItem.current;
    lastRemovedItem.current = null;

    if (!isAuthenticated) {
      const currentGuest = getGuestCartItems();
      const updated = [item, ...currentGuest];
      saveGuestCartItems(updated);
      setCart({ id: 'guest-cart', items: updated });
      toast.success("Item restored to cart!");
      return;
    }

    try {
      await apiAddToCart({
        sellerListingId: item.sellerListingId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
      toast.success("Item restored to cart!");
      await refreshCart();
    } catch {
      toast.error("Could not restore item");
    }
  };

  // 4. Move to Wishlist 1-Click Transfer
  const moveToWishlist = async (item: any) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save items to your wishlist");
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    const variantId = item.variantId;
    const itemId = item.id;
    try {
      // 1. Add to wishlist
      await addToWishlist(variantId);
      setWishlistIds(prev => new Set(prev).add(variantId));

      // 2. Optimistic remove from cart
      setCart((prev: any) => ({
        ...prev,
        items: prev.items.filter((i: any) => i.id !== itemId),
      }));
      await removeCartItem(itemId);

      toast.success("Moved to your Wishlist!");
    } catch {
      toast.error("Failed to move item to Wishlist");
      await refreshCart();
    }
  };

  // 5. Add to Cart with Drawer Trigger (Guests + Authenticated)
  const addToCartOptimistic = async (data: AddToCartPayload) => {
    if (!isAuthenticated) {
      // Guest Cart persistence
      const currentGuestItems = getGuestCartItems();
      const existingIdx = currentGuestItems.findIndex(
        (i: any) => i.sellerListingId === data.sellerListingId
      );

      let updatedItems: any[];
      if (existingIdx >= 0) {
        const item = currentGuestItems[existingIdx];
        const maxStock = Math.min(item.availableStock ?? data.itemDetails?.stock ?? 10, 10);
        const newQty = Math.min(item.quantity + data.quantity, maxStock);
        if (newQty === item.quantity) {
          toast.info(`Item already in cart at maximum quantity (${newQty})`);
          return;
        }
        updatedItems = [...currentGuestItems];
        updatedItems[existingIdx] = { ...item, quantity: newQty };
      } else {
        const price = Number(data.itemDetails?.price || 0);
        const newItem = {
          id: 'guest_' + data.sellerListingId + '_' + Date.now(),
          sellerListingId: data.sellerListingId,
          variantId: data.variantId,
          quantity: data.quantity,
          priceAtAddTime: price,
          isAvailable: true,
          availableStock: data.itemDetails?.stock ?? 10,
          currentPrice: price,
          priceChanged: false,
          sellerListing: {
            id: data.sellerListingId,
            price: price,
            stock: data.itemDetails?.stock ?? 10,
            isActive: true,
            sellerProfile: {
              shopName: data.itemDetails?.shopName || 'AkMart Verified Store',
            },
            variant: {
              id: data.variantId,
              name: data.itemDetails?.variantName || 'Standard',
              images: data.itemDetails?.imageUrl ? [{ url: data.itemDetails?.imageUrl, isPrimary: true }] : [],
              product: {
                name: data.itemDetails?.productName || 'Product',
                slug: data.itemDetails?.productSlug || '',
              }
            }
          },
          variant: {
            id: data.variantId,
            name: data.itemDetails?.variantName || 'Standard',
            images: data.itemDetails?.imageUrl ? [{ url: data.itemDetails?.imageUrl, isPrimary: true }] : [],
            product: {
              name: data.itemDetails?.productName || 'Product',
              slug: data.itemDetails?.productSlug || '',
            }
          }
        };
        updatedItems = [newItem, ...currentGuestItems];
      }

      saveGuestCartItems(updatedItems);
      setCart({ id: 'guest-cart', items: updatedItems });
      queryClient.setQueryData(['cart'], { success: true, data: { id: 'guest-cart', items: updatedItems } });
      toast.success("Added to cart!");
      return;
    }

    try {
      await apiAddToCart({
        sellerListingId: data.sellerListingId,
        variantId: data.variantId,
        quantity: data.quantity,
      });
      toast.success("Added to cart!");
      await refreshCart();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || err.response?.data?.message || err.message || "Failed to add to cart");
    }
  };

  // Wishlist Handling
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const refreshWishlist = () => {
    if (isAuthenticated) {
      getWishlist()
        .then((res: any) => {
          const items = res.data?.items || [];
          const ids = new Set<string>(items.map((i: any) => i.variantId));
          setWishlistIds(ids);
        })
        .catch(() => setWishlistIds(new Set()));
    } else {
      setWishlistIds(new Set());
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const isInWishlist = (variantId: string) => wishlistIds.has(variantId);

  const toggleWishlist = async (variantId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return false;
    }
    const currentlyWishlisted = wishlistIds.has(variantId);
    try {
      if (currentlyWishlisted) {
        await removeFromWishlist(variantId);
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(variantId);
          return next;
        });
        toast.info("Removed from wishlist");
        return false;
      } else {
        await addToWishlist(variantId);
        setWishlistIds(prev => new Set(prev).add(variantId));
        toast.success("Saved to your wishlist!");
        return true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update wishlist");
      return currentlyWishlisted;
    }
  };

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
    refreshCart();
  };

  const value: ShopContextType = {
    currency,
    delivery_fee: shippingFee,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    navigate,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    searchHistory,
    addToHistory,

    // Cart
    cart,
    cartLoading,
    cartCount,
    getCartCount: () => cartCount,
    cartSubtotal,
    shippingFee,
    cartTotal,
    freeShippingGap,
    freeShippingProgress,

    refreshCart,
    refreshCartCount,
    clearCartLocally,
    updateCartItemQty,
    removeCartItemOptimistic,
    undoRemoveItem,
    moveToWishlist,
    addToCartOptimistic,

    // Drawer
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    openCartDrawer: () => setIsCartDrawerOpen(true),
    closeCartDrawer: () => setIsCartDrawerOpen(false),

    // Wishlist
    wishlistCount: wishlistIds.size,
    wishlistIds,
    isInWishlist,
    toggleWishlist,
    refreshWishlist,

    // Coupon Engine
    appliedCoupon,
    setAppliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalPayable,

    // Legacy fallbacks
    cartItems: {},
    getCartAmount: () => cartSubtotal,
    updateQuantity: (id: string, qty: number) => updateCartItemQty(id, qty),
    addToCart: (data?: any) => data && addToCartOptimistic(data),
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};
