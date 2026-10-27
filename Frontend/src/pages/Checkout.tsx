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
  FiDollarSign,
  FiTag,
  FiX,
  FiCheck,
  FiFileText,
  FiInfo
} from 'react-icons/fi';

export const NEPAL_PROVINCES_DISTRICTS: Record<string, string[]> = {
  "Bagmati Province": [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Chitwan", "Dhading", "Dolakha", 
    "Kavrepalanchok", "Makwanpur (Hetauda)", "Nuwakot", "Ramechhap", "Rasuwa", 
    "Sindhuli", "Sindhupalchok"
  ],
  "Gandaki Province": [
    "Kaski (Pokhara)", "Baglung", "Gorkha", "Lamjung", "Manang", "Mustang", 
    "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahun"
  ],
  "Koshi Province": [
    "Morang (Biratnagar)", "Sunsari (Dharan/Itahari)", "Jhapa (Birtamode)", "Bhojpur", 
    "Dhankuta", "Ilam", "Khotang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", 
    "Solukhumbu", "Taplejung", "Terhathum", "Udayapur"
  ],
  "Lumbini Province": [
    "Rupandehi (Butwal/Bhairahawa)", "Banke (Nepalgunj)", "Bardiya", "Dang", 
    "Arghakhanchi", "Gulmi", "Kapilvastu", "Palpa", "Parasi", "Pyuthan", 
    "Rolpa", "Rukum East"
  ],
  "Madhesh Province": [
    "Dhanusha (Janakpur)", "Parsa (Birgunj)", "Bara", "Mahottari", "Rautahat", 
    "Saptari", "Sarlahi", "Siraha"
  ],
  "Karnali Province": [
    "Surkhet", "Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", 
    "Kalikot", "Mugu", "Rukum West", "Salyan"
  ],
  "Sudurpashchim Province": [
    "Kailali (Dhangadhi)", "Kanchanpur (Mahendranagar)", "Achham", "Baitadi", 
    "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti"
  ],
};

const POPULAR_NEPAL_CITIES = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar", 
  "Bharatpur (Chitwan)", "Butwal", "Dharan", "Nepalgunj", "Dhangadhi", 
  "Hetauda", "Birtamode", "Itahari", "Janakpur", "Birgunj"
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItemIds: string[] | undefined = location.state?.selectedItemIds;
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();

  const { 
    currency, 
    freeShippingThreshold = 2500,
    appliedCoupon,
    discountAmount = 0,
    applyCoupon,
    removeCoupon,
    clearCartLocally,
    refreshCart,
  } = (useContext(ShopContext) as any) || { currency: 'Rs. ', freeShippingThreshold: 2500 };

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ESEWA' | 'KHALTI'>('COD');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [idempotencyKey] = useState(() => 'akm_ord_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now());

  const [newAddress, setNewAddress] = useState({
    fullName: user?.fullName || '',
    phone: (user as any)?.phoneNumber || '',
    street: '',
    city: 'Kathmandu',
    customCity: '',
    district: 'Kathmandu',
    state: 'Bagmati Province',
    zipCode: '44600',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Handle province change and auto-update district
  const handleProvinceChange = (province: string) => {
    const districts = NEPAL_PROVINCES_DISTRICTS[province] || [];
    setNewAddress(prev => ({
      ...prev,
      state: province,
      district: districts[0] || '',
    }));
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim() || !applyCoupon) return;
    const ok = await applyCoupon(couponCodeInput);
    if (ok) setCouponCodeInput('');
  };

  // 1. Fetch Cart Data
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  const cart = cartData?.data || cartData;

  // Filter items for selective checkout
  const checkoutItems = useMemo(() => {
    if (!cart?.items) return [];
    if (!selectedItemIds || selectedItemIds.length === 0) return cart.items;
    return cart.items.filter((item: any) => selectedItemIds.includes(item.id));
  }, [cart, selectedItemIds]);

  // 2. Fetch User Addresses
  const { data: addressData, refetch: refetchAddr } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
    enabled: isAuthenticated,
  });

  const addresses = addressData?.data || [];

  // Set default address upon loading
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [addresses, selectedAddressId]);

  // Financial Calculations
  const subtotal = useMemo(() => {
    if (!checkoutItems) return 0;
    return checkoutItems.reduce((acc: number, item: any) => {
      const p = Number(item.priceAtAddTime || item.sellerListing?.price || 0);
      return acc + p * item.quantity;
    }, 0);
  }, [checkoutItems]);

  const deliveryFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 100;
  const finalDiscount = Math.min(discountAmount, subtotal);
  const total = Math.max(0, subtotal + deliveryFee - finalDiscount);

  // Check if any item in checkout is out of stock
  const hasOutOfStockItems = useMemo(() => {
    if (!checkoutItems || checkoutItems.length === 0) return false;
    return checkoutItems.some((item: any) => {
      const listing = item.sellerListing;
      if (!listing || !listing.isActive || listing.deletedAt) return true;
      const available = (listing.stock || 0) - (listing.reservedStock || 0);
      return available < item.quantity;
    });
  }, [checkoutItems]);

  // Add Address Mutation
  const addAddrMutation = useMutation({
    mutationFn: (data: any) => addAddress(data),
    onSuccess: (res: any) => {
      toast.success("Delivery address saved successfully!");
      setShowAddAddress(false);
      setNewAddress({
        fullName: user?.fullName || '',
        phone: '',
        street: '',
        city: 'Kathmandu',
        customCity: '',
        district: 'Kathmandu',
        state: 'Bagmati Province',
        zipCode: '44600',
      });
      refetchAddr();
      setSelectedAddressId(res.data?.id);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to add address");
    }
  });

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: (data: any) => checkout(data),
    onSuccess: (res: any) => {
      const createdOrder = res?.data || res;
      toast.success("Order placed successfully! Thank you for shopping with AKMart.");
      if (removeCoupon) removeCoupon();
      if (clearCartLocally) clearCartLocally(selectedItemIds);
      if (refreshCart) refreshCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });

      // Navigate to dedicated, permanent order confirmation route
      if (createdOrder?.id) {
        navigate(`/orders/${createdOrder.id}`, { state: { order: createdOrder } });
      } else {
        navigate('/orders');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to place order. Please review your cart.");
    }
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = newAddress.phone.replace(/[\s-]/g, '');
    const nepaliPhoneRegex = /^(?:\+?977)?(?:98\d{8}|97\d{8}|96\d{8})$/;

    if (!nepaliPhoneRegex.test(cleanedPhone)) {
      setPhoneError("Please enter a valid 10-digit Nepal mobile number starting with 96, 97, or 98");
      return;
    }
    setPhoneError('');

    const formattedPhone = cleanedPhone.startsWith('+977')
      ? cleanedPhone.slice(4)
      : cleanedPhone.startsWith('977')
      ? cleanedPhone.slice(3)
      : cleanedPhone;

    const resolvedCity = newAddress.city === 'Other' ? newAddress.customCity : newAddress.city;

    if (!newAddress.fullName.trim() || newAddress.fullName.trim().length < 2) {
      toast.error("Please enter a valid full name (minimum 2 characters)");
      return;
    }

    if (!newAddress.street.trim() || newAddress.street.trim().length < 3) {
      toast.error("Please enter your street address, tole, or landmark");
      return;
    }

    addAddrMutation.mutate({
      fullName: newAddress.fullName.trim(),
      phone: formattedPhone,
      street: newAddress.street.trim(),
      city: resolvedCity.trim() || 'Kathmandu',
      district: newAddress.district,
      state: newAddress.state,
      zipCode: newAddress.zipCode.trim() || '44600',
    });
  };

  const handlePlaceOrder = () => {
    if (checkoutMutation.isPending) return;

    if (hasOutOfStockItems) {
      return toast.error("Some items in your cart are currently out of stock. Please adjust your cart to proceed.");
    }
    if (!selectedAddressId) {
      return toast.error("Please select or add a delivery address first.");
    }

    checkoutMutation.mutate({
      shippingAddressId: selectedAddressId,
      paymentMethod: 'COD',
      couponCode: appliedCoupon?.code,
      selectedItemIds: selectedItemIds && selectedItemIds.length > 0 ? selectedItemIds : undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
      idempotencyKey,
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

  if (!cart || !checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center font-poppins">
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
          <FiTruck size={28} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Items Selected for Checkout</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
          Your cart is currently empty or you haven't selected any items to buy.
        </p>
        <button
          onClick={() => navigate('/collection')}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-poppins">
      {/* ── Page Header ── */}
      <div className="mb-8 border-b border-gray-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <span>Checkout</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <FiShield /> 256-Bit Encrypted
          </span>
        </h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">
          Review your Nepal delivery address, select Cash on Delivery, and confirm your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address, Payment, Delivery Notes */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* ── 1. Delivery Address Section ── */}
          <section className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Delivery Address / डेलिभरी ठेगाना</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition"
              >
                {showAddAddress ? <><FiX /> Cancel</> : <><FiPlus /> Add New Address</>}
              </button>
            </div>

            {/* Address Selection List */}
            {!showAddAddress && (
              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="p-6 border border-dashed border-gray-800 rounded-2xl text-center space-y-3 bg-black/30">
                    <FiMapPin className="w-8 h-8 mx-auto text-gray-500" />
                    <p className="text-xs text-gray-400">You haven't saved any delivery address yet.</p>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(true)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
                    >
                      Add Nepal Address
                    </button>
                  </div>
                ) : (
                  addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-orange-500 bg-orange-500/10 ring-1 ring-orange-500'
                          : 'border-gray-800 bg-[#161616] hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-semibold bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{addr.street}, {addr.city}</p>
                          <p className="text-xs text-gray-400">
                            District: <strong className="text-gray-200">{addr.district || 'Nepal'}</strong> | {addr.state} ({addr.zipCode})
                          </p>
                          <p className="text-xs text-orange-400/90 font-mono mt-1">Phone: {addr.phone}</p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <FiCheckCircle className="text-orange-500 w-5 h-5 shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add Address Form with Nepal 77 Districts */}
            {showAddAddress && (
              <form onSubmit={handleAddressSubmit} className="p-5 border border-gray-800 rounded-2xl bg-black/40 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  New Delivery Address (Nepal)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">Recipient Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Shrestha"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">Nepal Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="98XXXXXXXX / 97XXXXXXXX"
                      value={newAddress.phone}
                      onChange={(e) => {
                        setNewAddress({ ...newAddress, phone: e.target.value });
                        if (phoneError) setPhoneError('');
                      }}
                      className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 font-mono"
                    />
                    {phoneError && <p className="text-[11px] text-rose-400">{phoneError}</p>}
                  </div>

                  {/* Province Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">Province *</label>
                    <select
                      value={newAddress.state}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      {Object.keys(NEPAL_PROVINCES_DISTRICTS).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic District Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">District (77 Districts) *</label>
                    <select
                      value={newAddress.district}
                      onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      {(NEPAL_PROVINCES_DISTRICTS[newAddress.state] || []).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* City Selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">City / Municipality *</label>
                    <select
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      {POPULAR_NEPAL_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Other">Other Municipality</option>
                    </select>
                  </div>

                  {/* Custom City if Other */}
                  {newAddress.city === 'Other' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-300">Specify Municipality *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your town / municipality"
                        value={newAddress.customCity}
                        onChange={(e) => setNewAddress({ ...newAddress, customCity: e.target.value })}
                        className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  )}

                  {/* Postal / Zip Code */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-300">Postal / Zip Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 44600"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                {/* Street / Landmark Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Street, Tole, Landmark & House No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Baneshwor, near Standard Chartered Bank, House #14"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full bg-[#181818] border border-gray-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addAddrMutation.isPending}
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    {addAddrMutation.isPending ? "Saving..." : "Save Delivery Address"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* ── 2. Payment Channel Section (COD as Primary) ── */}
          <section className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Payment Channel / भुक्तानी विकल्प</span>
              </h2>
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <FiShield className="text-emerald-400" />
                <span>Zero Hidden Fees</span>
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Option 1: Cash on Delivery (COD) - PRIMARY & DEFAULT */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className="p-5 rounded-2xl border-2 border-orange-500 bg-orange-500/10 ring-1 ring-orange-500 cursor-pointer transition shadow-md shadow-orange-500/10"
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
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Default & Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                      Pay in cash (NPR) upon delivery at your doorstep across Nepal. Please keep exact change ready for the delivery partner.
                    </p>

                    <div className="mt-3 pt-3 border-t border-orange-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <FiCheck className="text-orange-400 shrink-0" />
                        <span>No advance online payment required</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiCheck className="text-orange-400 shrink-0" />
                        <span>Inspect parcel upon arrival</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Digital Wallets Info Note */}
              <div className="p-4 rounded-2xl border border-gray-800 bg-[#161616] text-xs space-y-2 text-gray-400">
                <div className="flex items-center gap-2 text-gray-300 font-semibold">
                  <FiInfo className="text-orange-400" />
                  <span>Digital Wallets (eSewa & Khalti)</span>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Merchant API Verification in Progress
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-400">
                  Direct online eSewa ePay and Khalti merchant payment gateways are pending merchant KYC approval for public release. Cash on Delivery is 100% active and supported across all 77 districts.
                </p>
              </div>
            </div>
          </section>

          {/* ── 3. Delivery Notes / Instructions ── */}
          <section className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 shadow-xl space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Delivery Instructions / डेलिभरी निर्देशन (Optional)</span>
            </h2>
            <p className="text-xs text-gray-400">
              Add any specific landmarks, apartment/floor details, or calling instructions for the delivery driver:
            </p>
            <div className="relative">
              <textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="e.g. Near Big Mart / ring bell on 2nd floor / please call before arriving"
                className="w-full bg-[#161616] border border-gray-800 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
              />
              <span className="absolute right-3 bottom-3 text-[10px] text-gray-500 font-mono">
                {deliveryNotes.length}/500
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Action */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 sticky top-24 shadow-2xl">
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
                        <div className="absolute inset-0 bg-rose-950/80 flex items-center justify-center">
                          <span className="text-[9px] text-rose-300 font-bold">OOS</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{productName}</h4>
                      <p className="text-[11px] text-gray-400 truncate">{variantName} &bull; Qty: {item.quantity}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-bold text-white font-mono">
                          Rs. {(price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {isOutOfStock && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
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
                <span className="text-white font-mono font-medium">Rs. {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span className="flex items-center gap-1">
                  <span>Standard Delivery (Nepal)</span>
                  {deliveryFee === 0 && <span className="text-emerald-400 font-bold text-[10px]">(FREE)</span>}
                </span>
                <span className="text-white font-mono font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-extrabold uppercase text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      FREE
                    </span>
                  ) : (
                    `Rs. ${deliveryFee.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                  <span className="flex items-center gap-1.5 font-bold">
                    <FiTag size={13} /> Coupon ({appliedCoupon.code})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold font-mono">-Rs. {finalDiscount.toLocaleString('en-IN')}</span>
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
                  Tip: Add Rs. {(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more to qualify for <strong>FREE Delivery</strong> across Nepal!
                </p>
              )}

              <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Total Payable</span>
                <span className="text-2xl font-black text-orange-400 font-mono">
                  Rs. {total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              id="checkout-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={checkoutMutation.isPending || !selectedAddressId || hasOutOfStockItems}
              className="w-full font-extrabold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider text-xs active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20"
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
                  <span>Confirm Order (COD) &bull; Rs. {total.toLocaleString('en-IN')}</span>
                </div>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-800/80">
              <span className="flex items-center gap-1"><FiTruck className="text-orange-500" /> Nepal Doorstep Delivery</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><FiShield className="text-emerald-500" /> 7-Day Returns</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
