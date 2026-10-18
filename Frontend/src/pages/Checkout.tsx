import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart } from '../api/consumer.api';
import { getAddresses, addAddress, checkout } from '../api/order.api';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { FiMapPin, FiCheckCircle, FiPlus, FiLock, FiTruck, FiArrowRight } from 'react-icons/fi';

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency } = useContext(ShopContext) || { currency: 'NPR ' };

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const { data: cartRes, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
  });

  const { data: addrRes, refetch: refetchAddr } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const cart = (cartRes as any)?.data;
  const addresses = (addrRes as any)?.data || [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const addAddrMutation = useMutation({
    mutationFn: (data: any) => addAddress(data),
    onSuccess: (res: any) => {
      toast.success("Address added successfully!");
      setShowAddAddress(false);
      setNewAddress({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '' });
      refetchAddr();
      setSelectedAddressId(res.data?.id);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to add address");
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: any) => checkout(data),
    onSuccess: () => {
      toast.success("🎉 Order placed successfully!");
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      navigate('/orders');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to place order. Please try again.");
    }
  });

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      return toast.error("Please select or add a delivery address first.");
    }
    checkoutMutation.mutate({
      shippingAddressId: selectedAddressId,
      paymentMethod,
    });
  };

  if (cartLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm">Preparing checkout...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center font-poppins">
        <h2 className="text-2xl font-bold text-white mb-3">Your Cart is Empty</h2>
        <p className="text-gray-400 text-sm mb-6">Add products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => navigate('/collection')}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-sm"
        >
          Browse Products
        </button>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-poppins text-white">
      <div className="mb-8 pb-6 border-b border-gray-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">Checkout</h1>
        <p className="text-sm text-gray-400 mt-1">Complete your order with secure delivery</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address */}
          <section className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Shipping Address
              </h2>
              {!showAddAddress && addresses.length > 0 && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="text-xs font-semibold text-orange-400 hover:underline flex items-center gap-1"
                >
                  <FiPlus /> Add New
                </button>
              )}
            </div>

            {/* Address Grid */}
            {addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {addresses.map((addr: any) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500'
                          : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-bold text-white text-sm">{addr.fullName}</h3>
                        {isSelected && <FiCheckCircle className="text-orange-500 w-5 h-5 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400">{addr.phone}</p>
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty Address State or Add Address Form */}
            {(addresses.length === 0 || showAddAddress) && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addAddrMutation.mutate(newAddress);
                }}
                className="space-y-4 border-t border-gray-800 pt-5 mt-4"
              >
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {addresses.length === 0 ? "Add Your Delivery Address" : "New Address Form"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Full Name *"
                    className="bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  />
                  <input
                    required
                    placeholder="Phone Number *"
                    className="bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  />
                  <input
                    required
                    placeholder="Street / Landmark / Area *"
                    className="sm:col-span-2 bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                  <input
                    required
                    placeholder="City / Municipality *"
                    className="bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  />
                  <input
                    required
                    placeholder="State / Province *"
                    className="bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  />
                  <input
                    required
                    placeholder="ZIP / Postal Code *"
                    className="bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addAddrMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow"
                  >
                    {addAddrMutation.isPending ? "Saving..." : "Save Address"}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="text-gray-400 hover:text-white px-4 py-2.5 text-xs"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* 2. Payment Method */}
          <section className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
              <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                2
              </span>
              Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500'
                    : 'border-gray-800 bg-[#1A1A1A]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-orange-500 focus:ring-orange-500 bg-black border-gray-700"
                />
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">Cash on Delivery (COD)</p>
                  <p className="text-xs text-gray-400 mt-0.5">Pay in cash when your order is delivered at your doorstep</p>
                </div>
                <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md">
                  VERIFIED
                </span>
              </label>

              <label className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 bg-[#1A1A1A] opacity-50 cursor-not-allowed">
                <input disabled type="radio" name="payment" value="ESEWA" className="text-gray-600 bg-black" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-400 text-sm">eSewa / Khalti / Card</p>
                  <p className="text-xs text-gray-500 mt-0.5">Online payments opening soon</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="space-y-6">
          <section className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 sticky top-24 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5 tracking-tight uppercase">Order Summary</h2>

            {/* Items Overview */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1 mb-6 border-b border-gray-800 pb-4">
              {cart.items.map((item: any) => {
                const productName = item.variant?.product?.name || item.sellerListing?.variant?.product?.name || "Product";
                const variantName = item.variant?.name || item.sellerListing?.variant?.name || "Standard";
                const imageUrl = item.variant?.images?.[0]?.url || item.sellerListing?.variant?.images?.[0]?.url;
                const price = Number(item.priceAtAddTime || item.sellerListing?.price || 0);

                return (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-600 flex items-center justify-center h-full">No Img</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{productName}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{variantName} &bull; Qty: {item.quantity}</p>
                      <p className="text-xs font-bold text-white mt-0.5">{currency}{(price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="space-y-2.5 text-sm mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">{currency}{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Standard Delivery</span>
                <span className="text-white font-medium">{currency}{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Order Total</span>
                <span className="text-2xl font-extrabold text-white">{currency}{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={checkoutMutation.isPending || !selectedAddressId}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs active:scale-[0.99]"
            >
              {checkoutMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Placing Order...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiLock />
                  <span>Confirm Order ({currency}{total.toLocaleString()})</span>
                </div>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400 mt-3">
              By confirming, you agree to our terms of purchase.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
