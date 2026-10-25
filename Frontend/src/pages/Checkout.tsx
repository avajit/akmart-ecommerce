import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart } from '../api/consumer.api';
import { getAddresses, addAddress, checkout } from '../api/order.api';
import { ShopContext } from '../context/ShopContext';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { 
  FiMapPin, 
  FiCheckCircle, 
  FiPlus, 
  FiLock, 
  FiTruck, 
  FiArrowRight, 
  FiAlertTriangle,
  FiShield,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiEdit2,
  FiBriefcase,
  FiTag,
  FiX
} from 'react-icons/fi';

const NEPAL_PROVINCES = [
  "Bagmati Province",
  "Gandaki Province",
  "Koshi Province",
  "Lumbini Province",
  "Madhesh Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const POPULAR_NEPAL_CITIES = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Biratnagar",
  "Bharatpur (Chitwan)",
  "Butwal",
  "Dharan",
  "Nepalgunj",
  "Dhangadhi",
  "Hetauda",
  "Birtamode",
  "Itahari",
  "Janakpur",
];

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const role = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();
  const isMerchantOrAdmin = role === 'SELLER' || role === 'ADMIN';

  const { 
    currency, 
    freeShippingThreshold = 2500,
    appliedCoupon,
    discountAmount = 0,
    applyCoupon,
    removeCoupon
  } = (useContext(ShopContext) as any) || { currency: 'NPR ', freeShippingThreshold: 2500 };

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim() || !applyCoupon) return;
    const ok = await applyCoupon(couponCodeInput);
    if (ok) setCouponCodeInput('');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ESEWA' | 'KHALTI'>('COD');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: 'Kathmandu',
    customCity: '',
    state: 'Bagmati Province',
    zipCode: '44600',
  });

  const { data: cartRes, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated && !isMerchantOrAdmin,
  });

  const { data: addrRes, refetch: refetchAddr } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: isAuthenticated && !isMerchantOrAdmin,
  });

  const cart = (cartRes as any)?.data;
  const addresses = (addrRes as any)?.data || [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Check if any cart item is out of stock or exceeds stock
  const hasOutOfStockItems = useMemo(() => {
    if (!cart?.items) return false;
    return cart.items.some((item: any) => {
      const listing = item.sellerListing;
      if (!listing || !listing.isActive || listing.deletedAt) return true;
      const available = (listing.stock || 0) - (listing.reservedStock || 0);
      return available < item.quantity;
    });
  }, [cart?.items]);

  const addAddrMutation = useMutation({
    mutationFn: (data: any) => addAddress(data),
    onSuccess: (res: any) => {
      toast.success("Delivery address saved! 📍");
      setShowAddAddress(false);
      setNewAddress({
        fullName: '',
        phone: '',
        street: '',
        city: 'Kathmandu',
        customCity: '',
        state: 'Bagmati Province',
        zipCode: '44600',
      });
      refetchAddr();
      setSelectedAddressId(res.data?.id);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to add address");
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: any) => checkout(data),
    onSuccess: (res: any) => {
      toast.success("Order placed successfully!");
      if (removeCoupon) removeCoupon();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      const createdOrder = res?.data || res;
      navigate('/place-order', { state: { order: createdOrder } });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Failed to place order. Please review your cart.");
    }
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate Nepali mobile number format (e.g. 98XXXXXXXX or 97XXXXXXXX, 10 digits)
    const cleanedPhone = newAddress.phone.replace(/[\s-]/g, '');
    const nepaliPhoneRegex = /^(?:\+?977)?(?:98\d{8}|97\d{8}|01\d{7})$/;

    if (!nepaliPhoneRegex.test(cleanedPhone)) {
      setPhoneError("Please enter a valid Nepali contact number (e.g. 9801234567)");
      return;
    }
    setPhoneError('');

    const resolvedCity = newAddress.city === 'Other' ? newAddress.customCity : newAddress.city;

    addAddrMutation.mutate({
      fullName: newAddress.fullName.trim(),
      phone: cleanedPhone,
      street: newAddress.street.trim(),
      city: resolvedCity.trim() || 'Kathmandu',
      state: newAddress.state,
      zipCode: newAddress.zipCode.trim() || '44600',
    });
  };

  const handlePlaceOrder = () => {
    if (hasOutOfStockItems) {
      return toast.error("Some items in your cart are currently out of stock. Please remove them from your cart to proceed.");
    }
    if (!selectedAddressId) {
      return toast.error("Please select or add a delivery address first.");
    }

    checkoutMutation.mutate({
      shippingAddressId: selectedAddressId,
      paymentMethod,
      couponCode: appliedCoupon?.code,
    });
  };

  if (cartLoading) {
    return (
      <div className="max-w-6xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Preparing secure checkout...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="w-16 h-16 bg-[#141414] rounded-2xl border border-gray-800 flex items-center justify-center mx-auto mb-4 text-orange-400">
          <FiTruck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
          Add authentic products to your shopping bag before proceeding with order placement.
        </p>
        <button
          onClick={() => navigate('/collection')}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider"
        >
          Explore Catalog <FiArrowRight />
        </button>
      </div>
    );
  }

  if (isMerchantOrAdmin) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-center mx-auto mb-5 text-orange-400">
          <FiBriefcase className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Merchant Account Detected</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
          You are signed in with a <strong>{role}</strong> account. Ordering and checkout are reserved for consumer accounts.
        </p>
        <button
          onClick={() => navigate(role === 'SELLER' ? '/seller/dashboard' : '/admin/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
        >
          Go to {role === 'SELLER' ? 'Seller' : 'Admin'} Dashboard &rarr;
        </button>
      </div>
    );
  }

  const subtotal = cart.items.reduce(
    (sum: number, item: any) => sum + (Number(item.priceAtAddTime || item.sellerListing?.price || 0) * item.quantity),
    0
  );
  // Free delivery based on dynamic threshold (default NPR 2,500)
  const deliveryFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 100;
  const finalDiscount = appliedCoupon ? (discountAmount || appliedCoupon.discountAmount || 0) : 0;
  const total = Math.max(0, subtotal + deliveryFee - finalDiscount);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-28 md:pb-12 font-poppins text-white min-h-screen">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase flex items-center gap-3">
            <span>Checkout</span>
            <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full font-bold">
              Nepal Delivery
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Review your destination, payment channel, and order items</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
          <FiShield className="text-green-400" />
          <span>SSL Encrypted Checkout</span>
        </div>
      </div>

      {/* Out of Stock Alert Banner */}
      {hasOutOfStockItems && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div className="text-xs">
            <p className="font-bold">Inventory Alert</p>
            <p className="text-gray-300 mt-0.5">
              One or more items in your cart have run out of stock or exceed current merchant inventory. Please return to your{' '}
              <button onClick={() => navigate('/cart')} className="underline text-orange-400 font-bold">Cart</button>{' '}
              to adjust quantities before confirming order.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── 1. Delivery Address (Nepal Localized) ── */}
          <section className="bg-[#141414] border border-gray-800/80 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Delivery Address (नेपाल)</span>
              </h2>
              {!showAddAddress && addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddAddress(true)}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
                >
                  <FiPlus /> Add New Address
                </button>
              )}
            </div>

            {/* Existing Address Cards */}
            {addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {addresses.map((addr: any) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500 shadow-md shadow-orange-500/10'
                          : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex items-center gap-2">
                          <FiMapPin className={isSelected ? 'text-orange-500' : 'text-gray-400'} size={15} />
                          <h3 className="font-bold text-white text-sm">{addr.fullName}</h3>
                        </div>
                        {isSelected && <FiCheckCircle className="text-orange-500 w-4 h-4 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-1"><FiSmartphone className="inline text-orange-400 mr-1" /> {addr.phone}</p>
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {addr.street}, {addr.city}
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="text-orange-400 font-semibold">{addr.state}</span>
                        <span>Postal: {addr.zipCode}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Address Form Modal / Inline */}
            {(addresses.length === 0 || showAddAddress) && (
              <form onSubmit={handleAddressSubmit} className="space-y-4 border-t border-gray-800 pt-5 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FiMapPin className="text-orange-500" />
                    <span>{addresses.length === 0 ? "Add Delivery Destination" : "Add New Nepali Address"}</span>
                  </h3>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      required
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Contact Phone (Nepal) *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 9801234567"
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 font-mono transition"
                      value={newAddress.phone}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, phone: e.target.value });
                        setPhoneError('');
                      }}
                    />
                    {phoneError && <p className="text-[10px] text-red-400 mt-1">{phoneError}</p>}
                  </div>

                  {/* Province Selector (1 to 7) */}
                  <div>
                    <label className="block text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Province / प्रदेश *
                    </label>
                    <select
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition cursor-pointer"
                    >
                      {NEPAL_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Selector */}
                  <div>
                    <label className="block text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      City / District *
                    </label>
                    <select
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition cursor-pointer"
                    >
                      {POPULAR_NEPAL_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                      <option value="Other">Other City / Municipality...</option>
                    </select>
                  </div>

                  {/* Custom City Input if Other chosen */}
                  {newAddress.city === 'Other' && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                        Specify Municipality / City Name *
                      </label>
                      <input
                        required
                        placeholder="e.g. Panauti, Kavre"
                        className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition"
                        value={newAddress.customCity}
                        onChange={(e) => setNewAddress({ ...newAddress, customCity: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Street / Landmark / Ward */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Street, Tole, Landmark & Ward No. *
                    </label>
                    <input
                      required
                      placeholder="e.g. Ward 4, Near Bhatbhateni Supermarket, New Baneshwor"
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 transition"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      placeholder="e.g. 44600"
                      className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 font-mono transition"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={addAddrMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99]"
                  >
                    {addAddrMutation.isPending ? "Saving..." : "Save Delivery Address"}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="text-gray-400 hover:text-white px-5 py-3 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* ── 2. Payment Method (Branded Nepali Payment Channels) ── */}
          <section className="bg-[#141414] border border-gray-800/80 rounded-3xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-3 mb-5">
              <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Payment Channel / भुक्तानी विकल्प</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {/* Option 1: Cash on Delivery (COD) */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500'
                    : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-orange-500 focus:ring-orange-500 bg-black border-gray-700"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-orange-400" />
                    <p className="font-bold text-white text-sm">Cash on Delivery (COD)</p>
                    <span className="text-[10px] font-bold text-green-400 bg-green-500/15 border border-green-500/20 px-2 py-0.5 rounded-full uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Pay securely in cash or via <strong>Fonepay QR</strong> at your doorstep upon parcel arrival.
                  </p>
                </div>
              </label>

              {/* Option 2: eSewa Mobile Wallet */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'ESEWA'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                    : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="ESEWA"
                  checked={paymentMethod === 'ESEWA'}
                  onChange={() => setPaymentMethod('ESEWA')}
                  className="mt-1 text-emerald-500 focus:ring-emerald-500 bg-black border-gray-700"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#60BB46] text-white flex items-center justify-center font-bold text-[10px]">
                      e
                    </span>
                    <p className="font-bold text-white text-sm">eSewa Mobile Wallet</p>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Instant Wallet
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Direct payment via eSewa ID. Orders confirm automatically on successful authorization.
                  </p>
                </div>
              </label>

              {/* Option 3: Khalti Digital Wallet */}
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'KHALTI'
                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                    : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="KHALTI"
                  checked={paymentMethod === 'KHALTI'}
                  onChange={() => setPaymentMethod('KHALTI')}
                  className="mt-1 text-purple-500 focus:ring-purple-500 bg-black border-gray-700"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#5D2E8E] text-white flex items-center justify-center font-bold text-[10px]">
                      K
                    </span>
                    <p className="font-bold text-white text-sm">Khalti Digital Wallet / mBanking</p>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded-full">
                      50+ Banks
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Pay via Khalti balance or connect through 50+ Nepali commercial banks and SCT cards.
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="space-y-6">
          <section className="bg-[#141414] border border-gray-800/80 rounded-3xl p-6 sticky top-24 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-5 tracking-tight uppercase flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-gray-400 font-normal">{cart.items.length} Item(s)</span>
            </h2>

            {/* Items Overview with Live Stock Status */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-5 border-b border-gray-800/80 pb-4 scrollbar-thin scrollbar-thumb-gray-800">
              {cart.items.map((item: any) => {
                const productName = item.variant?.product?.name || item.sellerListing?.variant?.product?.name || "Product";
                const variantName = item.variant?.name || item.sellerListing?.variant?.name || "Standard";
                const imageUrl = item.variant?.images?.[0]?.url || item.sellerListing?.variant?.images?.[0]?.url;
                const price = Number(item.priceAtAddTime || item.sellerListing?.price || 0);
                const listing = item.sellerListing;
                const isOutOfStock = !listing || !listing.isActive || listing.deletedAt || (listing.stock - (listing.reservedStock || 0) < item.quantity);

                return (
                  <div key={item.id} className="flex gap-3 items-center py-1">
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl border border-gray-800 overflow-hidden flex-shrink-0 relative">
                      {imageUrl ? (
                        <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-600 flex items-center justify-center h-full">No Img</span>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center">
                          <span className="text-[9px] text-red-300 font-bold">OOS</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{productName}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{variantName} &bull; Qty: {item.quantity}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-bold text-white">{currency}{(price * item.quantity).toLocaleString()}</span>
                        {isOutOfStock && (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2.5 text-xs mb-5">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="text-white font-medium">{currency}{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span className="flex items-center gap-1">
                  <span>Standard Delivery (Nepal)</span>
                  {deliveryFee === 0 && <span className="text-emerald-400 font-bold text-[10px]">(FREE)</span>}
                </span>
                <span className="text-white font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-extrabold uppercase text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      FREE
                    </span>
                  ) : (
                    `${currency}${deliveryFee.toLocaleString()}`
                  )}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1.5 font-bold">
                    <FiTag size={13} /> Coupon ({appliedCoupon.code})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold">-{currency}{finalDiscount.toLocaleString()}</span>
                    <button 
                      type="button"
                      onClick={removeCoupon} 
                      className="text-gray-400 hover:text-rose-400 transition-colors"
                      title="Remove coupon"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                </div>
              )}

              {!appliedCoupon && (
                <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. AKMART10)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 bg-black border border-gray-700 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl uppercase transition shadow-sm"
                  >
                    Apply
                  </button>
                </form>
              )}

              {subtotal < freeShippingThreshold && (
                <p className="text-[10px] text-orange-400/90 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
                  Tip: Add {currency}{(freeShippingThreshold - subtotal).toLocaleString()} more to qualify for <strong>FREE Delivery</strong> across Nepal!
                </p>
              )}
              <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Total Payable</span>
                <span className="text-2xl font-black text-orange-400">{currency}{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={checkoutMutation.isPending || !selectedAddressId || hasOutOfStockItems}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 uppercase tracking-wider text-xs active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {checkoutMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Confirming Order...</span>
                </div>
              ) : hasOutOfStockItems ? (
                <span>Resolve Out of Stock Items</span>
              ) : !selectedAddressId ? (
                <span>Select Delivery Address</span>
              ) : (
                <div className="flex items-center gap-2">
                  <FiLock />
                  <span>Place Order &bull; {currency}{total.toLocaleString()}</span>
                </div>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-800/80">
              <span className="flex items-center gap-1"><FiTruck className="text-orange-500" /> Nepal Doorstep</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><FiShield className="text-green-500" /> Buyer Protection</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
