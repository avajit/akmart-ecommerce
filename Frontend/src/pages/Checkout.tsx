import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  FiX,
  FiCheck,
  FiClock,
  FiRefreshCw,
  FiExternalLink
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
  const location = useLocation();
  const selectedItemIds: string[] | undefined = location.state?.selectedItemIds;
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const role = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();
  const isMerchantOrAdmin = role === 'ADMIN';

  const { 
    currency, 
    freeShippingThreshold = 2500,
    appliedCoupon,
    discountAmount = 0,
    applyCoupon,
    removeCoupon,
    clearCartLocally,
    refreshCart,
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

  // Online Payment Gateway Simulation State (eSewa & Khalti)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'PROCESSING' | 'SUCCESS'>('DETAILS');
  const [onlineTab, setOnlineTab] = useState<'WALLET' | 'QR'>('WALLET');
  const [walletPhone, setWalletPhone] = useState('');
  const [walletMpin, setWalletMpin] = useState('');
  const [qrCountdown, setQrCountdown] = useState(300);
  const [simulatedTxnId, setSimulatedTxnId] = useState('');

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

  // Support selective checkout: filter items if specific items were selected from Cart
  const checkoutItems = useMemo(() => {
    if (!cart?.items) return [];
    if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
      return cart.items.filter((it: any) => selectedItemIds.includes(it.id));
    }
    return cart.items;
  }, [cart?.items, selectedItemIds]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  // Dynamic QR Code Countdown Timer
  useEffect(() => {
    let timer: any;
    if (showPaymentModal && onlineTab === 'QR' && qrCountdown > 0 && paymentStep === 'DETAILS') {
      timer = setInterval(() => {
        setQrCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPaymentModal, onlineTab, qrCountdown, paymentStep]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if any item in checkout is out of stock or exceeds stock
  const hasOutOfStockItems = useMemo(() => {
    if (!checkoutItems || checkoutItems.length === 0) return false;
    return checkoutItems.some((item: any) => {
      const listing = item.sellerListing;
      if (!listing || !listing.isActive || listing.deletedAt) return true;
      const available = (listing.stock || 0) - (listing.reservedStock || 0);
      return available < item.quantity;
    });
  }, [checkoutItems]);

  const addAddrMutation = useMutation({
    mutationFn: (data: any) => addAddress(data),
    onSuccess: (res: any) => {
      toast.success("Delivery address saved!");
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
      if (clearCartLocally) clearCartLocally(selectedItemIds);
      if (refreshCart) refreshCart();
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

    // Intercept online payment channels to launch authentic Gateway dialog
    if (paymentMethod === 'ESEWA' || paymentMethod === 'KHALTI') {
      const selectedAddr = addresses.find((a: any) => a.id === selectedAddressId);
      setWalletPhone(selectedAddr?.phone || (user as any)?.phone || '9801234567');
      setWalletMpin('');
      setQrCountdown(300);
      setPaymentStep('DETAILS');
      setShowPaymentModal(true);
      return;
    }

    // Cash on Delivery (COD) directly submits order
    checkoutMutation.mutate({
      shippingAddressId: selectedAddressId,
      paymentMethod: 'COD',
      couponCode: appliedCoupon?.code,
      selectedItemIds: selectedItemIds && selectedItemIds.length > 0 ? selectedItemIds : undefined,
    });
  };

  // Authorizes online payment via simulated gateway API
  const handleConfirmOnlinePayment = () => {
    if (onlineTab === 'WALLET') {
      if (!walletPhone.trim()) {
        return toast.error(`Please enter your ${paymentMethod === 'ESEWA' ? 'eSewa' : 'Khalti'} mobile number or ID.`);
      }
      if (walletMpin.length < 4) {
        return toast.error("Please enter your 4-digit MPIN for security verification.");
      }
    }

    setPaymentStep('PROCESSING');
    const txnPrefix = paymentMethod === 'ESEWA' ? 'TXN-ESEWA' : 'TXN-KHALTI';
    const generatedTxnId = `${txnPrefix}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setSimulatedTxnId(generatedTxnId);

    // Realistic authorization handshake delay
    setTimeout(() => {
      checkoutMutation.mutate(
        {
          shippingAddressId: selectedAddressId!,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          selectedItemIds: selectedItemIds && selectedItemIds.length > 0 ? selectedItemIds : undefined,
        },
        {
          onSuccess: (res: any) => {
            setPaymentStep('SUCCESS');
            toast.success(`${paymentMethod === 'ESEWA' ? 'eSewa' : 'Khalti'} payment authorized!`);
            if (removeCoupon) removeCoupon();
            if (clearCartLocally) clearCartLocally(selectedItemIds);
            if (refreshCart) refreshCart();
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            const createdOrder = res?.data || res;
            setTimeout(() => {
              setShowPaymentModal(false);
              navigate('/place-order', {
                state: {
                  order: createdOrder,
                  transactionId: generatedTxnId,
                  paymentChannel: paymentMethod,
                },
              });
            }, 900);
          },
          onError: (err: any) => {
            setPaymentStep('DETAILS');
            toast.error(err.response?.data?.message || "Payment authorization failed. Please try again.");
          },
        }
      );
    }, 1200);
  };

  if (cartLoading) {
    return (
      <div className="max-w-6xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 text-sm font-medium">Preparing secure checkout...</p>
      </div>
    );
  }

  if (!cart || !checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center font-poppins">
        <div className="w-16 h-16 bg-[#141414] rounded-2xl border border-gray-800 flex items-center justify-center mx-auto mb-4 text-orange-400">
          <FiTruck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Items Selected for Checkout</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
          Please select at least one item from your cart to proceed with order placement.
        </p>
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider"
        >
          Return to Cart <FiArrowRight />
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

  const subtotal = checkoutItems.reduce(
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
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Payment Channel / भुक्तानी विकल्प</span>
              </h2>
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <FiShield className="text-emerald-400" />
                <span>Zero Transaction Fees</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Option 1: Cash on Delivery (COD) */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500 shadow-md shadow-orange-500/10'
                    : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 text-orange-500 focus:ring-orange-500 bg-black border-gray-700 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                        <FiDollarSign />
                      </div>
                      <p className="font-bold text-white text-sm">Cash on Delivery (COD)</p>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      Pay securely in cash or via <strong>Fonepay QR</strong> at your doorstep upon parcel arrival.
                    </p>

                    {paymentMethod === 'COD' && (
                      <div className="mt-3 pt-3 border-t border-orange-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <FiCheck className="text-orange-400 shrink-0" />
                          <span>No advance payment needed</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <FiCheck className="text-orange-400 shrink-0" />
                          <span>Inspect parcel before payment</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Option 2: eSewa Mobile Wallet */}
              <div
                onClick={() => setPaymentMethod('ESEWA')}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'ESEWA'
                    ? 'border-[#60BB46] bg-[#60BB46]/10 ring-1 ring-[#60BB46] shadow-md shadow-[#60BB46]/10'
                    : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="radio"
                    name="payment"
                    value="ESEWA"
                    checked={paymentMethod === 'ESEWA'}
                    onChange={() => setPaymentMethod('ESEWA')}
                    className="mt-1 text-[#60BB46] focus:ring-[#60BB46] bg-black border-gray-700 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#60BB46] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#60BB46]/30">
                        e
                      </span>
                      <p className="font-bold text-white text-sm">eSewa Mobile Wallet</p>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Instant Wallet
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full">
                        0% Fee
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      Instant authorization via eSewa account ID or dynamic Scan & Pay QR. 100% automated confirmation.
                    </p>

                    {paymentMethod === 'ESEWA' && (
                      <div className="mt-3 pt-3 border-t border-[#60BB46]/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <FiCheck className="text-emerald-400 shrink-0" />
                          <span>Direct eSewa ID or QR scan</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <FiCheck className="text-emerald-400 shrink-0" />
                          <span>Instant automated dispatch</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Option 3: Khalti Digital Wallet */}
              <div
                onClick={() => setPaymentMethod('KHALTI')}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'KHALTI'
                    ? 'border-[#5C2D91] bg-[#5C2D91]/10 ring-1 ring-[#5C2D91] shadow-md shadow-[#5C2D91]/10'
                    : 'border-gray-800 bg-[#1A1A1A] hover:border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="radio"
                    name="payment"
                    value="KHALTI"
                    checked={paymentMethod === 'KHALTI'}
                    onChange={() => setPaymentMethod('KHALTI')}
                    className="mt-1 text-[#5C2D91] focus:ring-[#5C2D91] bg-black border-gray-700 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#5C2D91] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#5C2D91]/30">
                        K
                      </span>
                      <p className="font-bold text-white text-sm">Khalti Digital Wallet / mBanking</p>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        50+ Banks & SCT
                      </span>
                      <span className="text-[10px] font-bold text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full">
                        Instant Clearance
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      Pay via Khalti balance, ConnectIPS, or 50+ Nepali commercial banks (Nabil, Global IME, NIC Asia, etc.).
                    </p>

                    {paymentMethod === 'KHALTI' && (
                      <div className="mt-3 pt-3 border-t border-[#5C2D91]/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300">
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <FiCheck className="text-purple-400 shrink-0" />
                          <span>50+ Nepali Banks & SCT cards</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <FiCheck className="text-purple-400 shrink-0" />
                          <span>Earn Khalti loyalty points</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="space-y-6">
          <section className="bg-[#141414] border border-gray-800/80 rounded-3xl p-6 sticky top-24 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-5 tracking-tight uppercase flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs text-gray-400 font-normal">{checkoutItems.length} Item(s)</span>
            </h2>

            {/* Items Overview with Live Stock Status */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-5 border-b border-gray-800/80 pb-4 scrollbar-thin scrollbar-thumb-gray-800">
              {checkoutItems.map((item: any) => {
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
                <span>Subtotal ({checkoutItems.length} items)</span>
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

            {/* Dynamic Place Order CTA Button */}
            <button
              id="checkout-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={checkoutMutation.isPending || !selectedAddressId || hasOutOfStockItems}
              className={`w-full font-extrabold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider text-xs active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none ${
                paymentMethod === 'ESEWA'
                  ? 'bg-[#60BB46] hover:bg-[#52a43b] text-white shadow-[#60BB46]/25'
                  : paymentMethod === 'KHALTI'
                  ? 'bg-[#5C2D91] hover:bg-[#4d257b] text-white shadow-[#5C2D91]/25'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20'
              }`}
            >
              {checkoutMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Authorization...</span>
                </div>
              ) : hasOutOfStockItems ? (
                <span>Resolve Out of Stock Items</span>
              ) : !selectedAddressId ? (
                <span>Select Delivery Address</span>
              ) : paymentMethod === 'ESEWA' ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-[#60BB46] flex items-center justify-center font-black text-[11px]">
                    e
                  </span>
                  <span>Pay via eSewa &bull; {currency}{total.toLocaleString()}</span>
                  <FiArrowRight />
                </div>
              ) : paymentMethod === 'KHALTI' ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white text-[#5C2D91] flex items-center justify-center font-black text-[11px]">
                    K
                  </span>
                  <span>Pay via Khalti &bull; {currency}{total.toLocaleString()}</span>
                  <FiArrowRight />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiLock />
                  <span>Place Order (COD) &bull; {currency}{total.toLocaleString()}</span>
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

      {/* ── 3. High-Fidelity Online Payment Gateway Modal (eSewa & Khalti) ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-gray-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative animate-fadeIn">
            
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                paymentMethod === 'ESEWA'
                  ? 'bg-gradient-to-r from-[#60BB46]/20 via-[#182914] to-[#141414] border-[#60BB46]/30'
                  : 'bg-gradient-to-r from-[#5C2D91]/20 via-[#231533] to-[#141414] border-[#5C2D91]/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                    paymentMethod === 'ESEWA' ? 'bg-[#60BB46] shadow-[#60BB46]/30' : 'bg-[#5C2D91] shadow-[#5C2D91]/30'
                  }`}
                >
                  {paymentMethod === 'ESEWA' ? 'e' : 'K'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm tracking-tight">
                      {paymentMethod === 'ESEWA' ? 'eSewa ePay Gateway' : 'Khalti Checkout v2.1'}
                    </h3>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                        paymentMethod === 'ESEWA'
                          ? 'bg-[#60BB46]/20 text-emerald-400 border-[#60BB46]/30'
                          : 'bg-[#5C2D91]/20 text-purple-300 border-[#5C2D91]/30'
                      }`}
                    >
                      Sandbox
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {paymentMethod === 'ESEWA'
                      ? "Nepal's First Digital Wallet"
                      : 'Digital Wallet & Instant Banking'}
                  </p>
                </div>
              </div>

              {paymentStep === 'DETAILS' && (
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-gray-400 hover:text-white flex items-center justify-center transition"
                  title="Close Modal"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>

            {/* Merchant Snapshot Strip */}
            <div className="px-5 py-3 bg-[#181818] border-b border-gray-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Merchant</span>
                <span className="text-white font-bold">AKMart Nepal Official</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Amount Due</span>
                <span
                  className={`text-base font-black ${
                    paymentMethod === 'ESEWA' ? 'text-emerald-400' : 'text-purple-400'
                  }`}
                >
                  {currency}{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Processing State */}
            {paymentStep === 'PROCESSING' && (
              <div className="p-10 text-center space-y-4">
                <div
                  className={`w-14 h-14 border-4 rounded-full border-t-transparent animate-spin mx-auto ${
                    paymentMethod === 'ESEWA' ? 'border-[#60BB46]' : 'border-[#5C2D91]'
                  }`}
                />
                <h4 className="text-white font-bold text-base">Authorizing Payment...</h4>
                <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                  Connecting to {paymentMethod === 'ESEWA' ? 'eSewa Secure Switch' : 'Khalti Payment Engine'}. Please do not refresh or navigate away.
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-mono">
                  <FiLock className="text-emerald-400" />
                  <span>NCHL 256-bit Handshake Verified</span>
                </div>
              </div>
            )}

            {/* Success State */}
            {paymentStep === 'SUCCESS' && (
              <div className="p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <FiCheck className="w-8 h-8" />
                </div>
                <h4 className="text-white font-bold text-base">Payment Authorized!</h4>
                <p className="text-xs text-gray-400">
                  Transaction reference: <span className="text-emerald-400 font-mono font-bold">{simulatedTxnId}</span>
                </p>
                <p className="text-[11px] text-gray-500">Redirecting to order confirmation receipt...</p>
              </div>
            )}

            {/* Details State: Tabs & Form */}
            {paymentStep === 'DETAILS' && (
              <div className="p-5 space-y-4">
                {/* Method Tabs: Wallet Login vs Dynamic QR */}
                <div className="grid grid-cols-2 gap-1 bg-[#1A1A1A] p-1 rounded-xl border border-gray-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setOnlineTab('WALLET')}
                    className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                      onlineTab === 'WALLET'
                        ? 'bg-[#242424] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiSmartphone size={14} />
                    <span>Wallet Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineTab('QR')}
                    className={`py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                      onlineTab === 'QR'
                        ? 'bg-[#242424] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiCreditCard size={14} />
                    <span>Scan & Pay QR</span>
                  </button>
                </div>

                {/* Tab Content: Wallet Login */}
                {onlineTab === 'WALLET' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">
                        {paymentMethod === 'ESEWA' ? 'eSewa ID / Mobile Number' : 'Khalti ID / Mobile Number'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-xs text-gray-500 font-mono">+977</span>
                        <input
                          type="tel"
                          value={walletPhone}
                          onChange={(e) => setWalletPhone(e.target.value)}
                          placeholder="98XXXXXXXX"
                          className="w-full bg-black border border-gray-800 rounded-xl pl-14 pr-3 py-2.5 text-xs text-white font-mono outline-none focus:border-orange-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-400 uppercase font-semibold mb-1">
                        4-Digit Security MPIN
                      </label>
                      <input
                        type="password"
                        maxLength={6}
                        value={walletMpin}
                        onChange={(e) => setWalletMpin(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono tracking-widest outline-none focus:border-orange-500 transition text-center"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-orange-300">
                      <strong>Sandbox Demo:</strong> Enter any 4-digit MPIN (e.g. <code>1234</code>) to simulate successful clearance.
                    </div>
                  </div>
                )}

                {/* Tab Content: Scan & Pay QR */}
                {onlineTab === 'QR' && (
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-white rounded-2xl inline-block shadow-md">
                      {/* SVG Vector QR Code */}
                      <svg className="w-36 h-36 mx-auto" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="120" height="120" rx="8" fill="white" />
                        {/* Finder Patterns */}
                        <rect x="10" y="10" width="30" height="30" rx="4" fill="black" />
                        <rect x="15" y="15" width="20" height="20" rx="2" fill="white" />
                        <rect x="19" y="19" width="12" height="12" rx="2" fill="black" />

                        <rect x="80" y="10" width="30" height="30" rx="4" fill="black" />
                        <rect x="85" y="15" width="20" height="20" rx="2" fill="white" />
                        <rect x="89" y="19" width="12" height="12" rx="2" fill="black" />

                        <rect x="10" y="80" width="30" height="30" rx="4" fill="black" />
                        <rect x="15" y="85" width="20" height="20" rx="2" fill="white" />
                        <rect x="19" y="89" width="12" height="12" rx="2" fill="black" />

                        {/* QR Matrix Details */}
                        <rect x="46" y="12" width="6" height="6" fill="black" />
                        <rect x="58" y="12" width="6" height="6" fill="black" />
                        <rect x="68" y="12" width="6" height="6" fill="black" />
                        <rect x="46" y="24" width="6" height="6" fill="black" />
                        <rect x="68" y="24" width="6" height="6" fill="black" />
                        <rect x="46" y="34" width="6" height="6" fill="black" />
                        <rect x="58" y="34" width="6" height="6" fill="black" />
                        <rect x="12" y="46" width="6" height="6" fill="black" />
                        <rect x="24" y="46" width="6" height="6" fill="black" />
                        <rect x="34" y="46" width="6" height="6" fill="black" />
                        <rect x="12" y="68" width="6" height="6" fill="black" />
                        <rect x="34" y="68" width="6" height="6" fill="black" />
                        <rect x="80" y="46" width="6" height="6" fill="black" />
                        <rect x="102" y="46" width="6" height="6" fill="black" />
                        <rect x="92" y="58" width="6" height="6" fill="black" />
                        <rect x="80" y="68" width="6" height="6" fill="black" />
                        <rect x="102" y="68" width="6" height="6" fill="black" />
                        <rect x="46" y="80" width="6" height="6" fill="black" />
                        <rect x="68" y="80" width="6" height="6" fill="black" />
                        <rect x="58" y="92" width="6" height="6" fill="black" />
                        <rect x="46" y="102" width="6" height="6" fill="black" />
                        <rect x="68" y="102" width="6" height="6" fill="black" />

                        {/* Center Branded Logo Circle */}
                        <circle cx="60" cy="60" r="14" fill={paymentMethod === 'ESEWA' ? '#60BB46' : '#5C2D91'} />
                        <circle cx="60" cy="60" r="12" fill={paymentMethod === 'ESEWA' ? '#60BB46' : '#5C2D91'} stroke="white" strokeWidth="2" />
                        <text x="60" y="65" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="sans-serif">
                          {paymentMethod === 'ESEWA' ? 'e' : 'K'}
                        </text>
                      </svg>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-gray-300 font-medium">Awaiting QR scan from app</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
                      <FiClock className="text-orange-400" />
                      <span>Expires in: <strong className="font-mono text-white">{formatCountdown(qrCountdown)}</strong></span>
                      {qrCountdown === 0 && (
                        <button
                          type="button"
                          onClick={() => setQrCountdown(300)}
                          className="text-orange-400 hover:underline flex items-center gap-1 font-bold ml-1"
                        >
                          <FiRefreshCw size={11} /> Refresh
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmOnlinePayment}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2 ${
                      paymentMethod === 'ESEWA'
                        ? 'bg-[#60BB46] hover:bg-[#52a43b] shadow-[#60BB46]/25'
                        : 'bg-[#5C2D91] hover:bg-[#4d257b] shadow-[#5C2D91]/25'
                    }`}
                  >
                    <span>Simulate Successful Payment (Test Mode)</span>
                    <FiArrowRight />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-2.5 text-xs text-gray-400 hover:text-white transition font-semibold"
                  >
                    Cancel & Return to Checkout
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-800/80 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                  <FiShield className="text-emerald-400" />
                  <span>256-bit SSL Encrypted • Nepal Clearing House Limited (NCHL)</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
