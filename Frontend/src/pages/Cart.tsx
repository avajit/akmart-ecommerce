import React, { useEffect, useState, useContext } from 'react';
import { getCart, updateCartItem, removeCartItem } from '../api/consumer.api';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiShield, FiAlertTriangle } from 'react-icons/fi';

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { currency } = useContext(ShopContext) || { currency: 'NPR ' };

  const fetchCart = () => {
    getCart()
      .then((res: any) => {
        setCart(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdate = async (id: string, qty: number) => {
    if (qty < 1) return handleRemove(id);
    setUpdatingId(id);
    try {
      await updateCartItem(id, qty);
      fetchCart();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    setUpdatingId(id);
    try {
      await removeCartItem(id);
      toast.info("Item removed from cart");
      fetchCart();
    } catch (err: any) {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Loading your shopping cart...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="w-20 h-20 bg-[#141414] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
          <FiShoppingBag className="w-10 h-10 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Cart is Empty</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          Looks like you haven't added anything to your cart yet. Explore our curated collections!
        </p>
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-sm"
        >
          Explore Collection <FiArrowRight />
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + (Number(item.priceAtAddTime || item.sellerListing?.price || 0) * item.quantity),
    0
  );
  const deliveryFee = 100;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Shopping Cart</h1>
          <p className="text-sm text-gray-400 mt-1">
            You have <span className="text-white font-medium">{cart.items.length}</span> item(s) in your cart
          </p>
        </div>
        <Link to="/collection" className="text-sm font-semibold text-orange-400 hover:underline hidden sm:inline-block">
          Continue Shopping &rarr;
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart Items List */}
        <div className="flex-1 w-full space-y-4">
          {cart.items.map((item: any) => {
            const productName = item.variant?.product?.name || item.sellerListing?.variant?.product?.name || "Product";
            const productSlug = item.variant?.product?.slug || item.sellerListing?.variant?.product?.slug || "";
            const variantName = item.variant?.name || item.sellerListing?.variant?.name || "Standard";
            const imageUrl = item.variant?.images?.[0]?.url || item.sellerListing?.variant?.images?.[0]?.url;
            const price = Number(item.priceAtAddTime || item.sellerListing?.price || 0);
            const livePrice = Number(item.sellerListing?.price || price);
            const isPriceChanged = item.priceChanged || (livePrice !== price);

            return (
              <div
                key={item.id}
                className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all hover:border-orange-500/50"
              >
                {/* Product Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1A1A1A] rounded-xl overflow-hidden flex-shrink-0 border border-gray-800">
                  {imageUrl ? (
                    <img src={imageUrl} alt={productName} className="w-full h-full object-cover object-center" />
                  ) : (
                    <span className="text-xs text-gray-600 flex items-center justify-center h-full">No Img</span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${productSlug}`} className="text-white font-bold text-base hover:text-orange-400 transition truncate block">
                    {productName}
                  </Link>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {variantName} • Sold by <span className="text-gray-300">{item.sellerListing?.sellerProfile?.shopName || "Seller"}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-white font-bold text-base">
                      {currency}{price.toLocaleString()}
                    </p>
                    {isPriceChanged && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        <FiAlertTriangle className="w-3 h-3" /> Live: {currency}{livePrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {!item.isAvailable && (
                    <p className="text-rose-400 text-xs mt-1 font-medium">⚠️ Currently unavailable or out of stock</p>
                  )}
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-5">
                  <div className="flex items-center bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={updatingId === item.id}
                      className="px-3 py-1.5 text-gray-300 hover:text-orange-400 transition font-bold"
                    >
                      -
                    </button>
                    <span className="text-white px-3 font-semibold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={updatingId === item.id}
                      className="px-3 py-1.5 text-gray-300 hover:text-orange-400 transition font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-20">
                    <p className="text-sm font-bold text-white">
                      {currency}{(price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={updatingId === item.id}
                    className="text-gray-500 hover:text-rose-400 transition p-2 rounded-xl hover:bg-gray-800"
                    title="Remove item"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 sticky top-24 space-y-6">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="text-white font-medium">{currency}{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Estimated Shipping</span>
                <span className="text-white font-medium">{currency}{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Total</span>
                <span className="text-2xl font-extrabold text-white">{currency}{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs active:scale-[0.99]"
            >
              Proceed to Checkout <FiArrowRight />
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center pt-2">
              <FiShield className="text-orange-500 w-4 h-4 shrink-0" />
              <span>Safe & Secure Checkout • Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
