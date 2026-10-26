import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import { authService } from '../api/auth.service';
import { getAddresses, addAddress, deleteAddress } from '../api/order.api';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiShield, 
  FiCheckCircle, 
  FiCalendar, 
  FiEdit2, 
  FiSave, 
  FiX, 
  FiMapPin, 
  FiPlus, 
  FiTrash2, 
  FiTruck, 
  FiHeart, 
  FiShoppingCart, 
  FiShoppingBag,
  FiBriefcase, 
  FiLock,
  FiArrowRight
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

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'ADDRESSES' | 'SERVICES'>('DETAILS');
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Information State
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    roleDescription: '',
    isEmailVerified: false,
    isPhoneVerified: false,
    createdAt: '',
    avatarUrl: '',
  });

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddrId, setDeletingAddrId] = useState<string | null>(null);
  const [addressPhoneError, setAddressPhoneError] = useState('');

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: 'Kathmandu',
    customCity: '',
    state: 'Bagmati Province',
    zipCode: '44600',
    isDefault: false,
  });

  const fetchProfile = async () => {
    try {
      const me = await authService.getMe();
      setUserData({
        fullName: me.fullName || '',
        email: me.email || '',
        phoneNumber: me.phoneNumber || '',
        role: me.role?.name || (me as any)?.roleName || 'CONSUMER',
        roleDescription: me.role?.description || 'Standard customer account',
        isEmailVerified: !!me.isEmailVerified,
        isPhoneVerified: !!me.isPhoneVerified,
        createdAt: me.createdAt ? new Date(me.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }) : 'N/A',
        avatarUrl: me.avatarUrl || '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(res.data || []);
    } catch (err) {
      // Non-critical if user is seller/admin
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  const handleSaveProfile = async () => {
    if (!userData.fullName.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await authService.updateMe({
        fullName: userData.fullName.trim(),
        phoneNumber: userData.phoneNumber.trim() || null,
        avatarUrl: userData.avatarUrl.trim() || null,
      });
      toast.success('Profile updated successfully!');
      setIsEdit(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = newAddress.phone.replace(/[\s-]/g, '');
    const nepaliPhoneRegex = /^(?:\+?977)?(?:98\d{8}|97\d{8}|01\d{7})$/;

    if (!nepaliPhoneRegex.test(cleanedPhone)) {
      setAddressPhoneError("Please enter a valid Nepali contact number (e.g. 9801234567)");
      return;
    }
    setAddressPhoneError('');

    const resolvedCity = newAddress.city === 'Other' ? newAddress.customCity : newAddress.city;

    setSavingAddress(true);
    try {
      await addAddress({
        fullName: newAddress.fullName.trim(),
        phone: cleanedPhone,
        street: newAddress.street.trim(),
        city: resolvedCity.trim() || 'Kathmandu',
        state: newAddress.state,
        zipCode: newAddress.zipCode.trim() || '44600',
        isDefault: newAddress.isDefault,
      });
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
        isDefault: false,
      });
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    setDeletingAddrId(id);
    try {
      await deleteAddress(id);
      toast.success("Address removed");
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove address");
    } finally {
      setDeletingAddrId(null);
    }
  };

  if (loading) {
    return (
      <div className='py-28 text-center text-gray-400 font-poppins flex flex-col items-center justify-center gap-3'>
        <div className='w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
        <p className="text-sm font-medium">Loading your account profile...</p>
      </div>
    );
  }

  const roleUpper = userData.role.toUpperCase();
  const isMerchant = roleUpper === 'SELLER' || roleUpper === 'ADMIN';

  return (
    <div className='border-t border-gray-800 pt-6 sm:pt-10 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-poppins text-white'>
      
      {/* Title Header */}
      <div className='text-2xl mb-8 text-center sm:text-left'>
        <Title text1={'ACCOUNT'} text2={'PROFILE'} />
      </div>

      {/* Main Container Card */}
      <div className='bg-[#141414] border border-gray-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden'>
        
        {/* Top Header Profile Banner */}
        <div className='flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-800/80'>
          <div className='flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left'>
            <div className='relative'>
              {userData.avatarUrl ? (
                <img 
                  src={userData.avatarUrl} 
                  alt="Profile Avatar" 
                  className='w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-orange-500/30 shadow-lg'
                />
              ) : (
                <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg'>
                  {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className='absolute bottom-0 right-0 bg-orange-500 text-white p-1.5 rounded-full text-xs shadow-md'>
                <FiShield className='w-3.5 h-3.5' />
              </span>
            </div>

            <div>
              <div className='flex flex-wrap items-center justify-center sm:justify-start gap-2'>
                <h2 className='text-2xl font-extrabold text-white capitalize tracking-tight'>
                  {userData.fullName || 'Valued Shopper'}
                </h2>
                <span className='text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider'>
                  {userData.role}
                </span>
              </div>
              
              <p className='text-xs text-gray-400 mt-1 max-w-sm'>
                {userData.roleDescription}
              </p>
              
              <p className='text-gray-500 text-xs mt-2 flex items-center justify-center sm:justify-start gap-1.5'>
                <FiCalendar className='w-3.5 h-3.5' /> Member since {userData.createdAt}
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          {activeTab === 'DETAILS' && (
            <div>
              {!isEdit ? (
                <button 
                  onClick={() => setIsEdit(true)}
                  className='flex items-center gap-2 bg-[#1A1A1A] hover:bg-orange-500 hover:text-white text-gray-200 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm border border-gray-800'
                >
                  <FiEdit2 className='w-3.5 h-3.5' /> Edit Details
                </button>
              ) : (
                <div className='flex items-center gap-2'>
                  <button 
                    onClick={() => setIsEdit(false)}
                    disabled={saving}
                    className='flex items-center gap-1 bg-[#1A1A1A] hover:bg-gray-800 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition'
                  >
                    <FiX className='w-3.5 h-3.5' /> Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className='flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-orange-500/20 active:scale-[0.99]'
                  >
                    <FiSave className='w-3.5 h-3.5' /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation Strip */}
        <div className='flex gap-2 pt-6 border-b border-gray-800/80 overflow-x-auto no-scrollbar'>
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'DETAILS'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FiUser className='w-4 h-4' />
            <span>Personal Details</span>
          </button>

          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'ADDRESSES'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FiMapPin className='w-4 h-4' />
            <span>Saved Addresses</span>
            <span className='text-[10px] bg-[#1A1A1A] px-1.5 py-0.5 rounded-full border border-gray-800 text-gray-300'>
              {addresses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'SERVICES'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <FiShoppingBag className='w-4 h-4' />
            <span>Services & Shortcuts</span>
          </button>
        </div>

        {/* ── TAB 1: PERSONAL DETAILS ── */}
        {activeTab === 'DETAILS' && (
          <div className='pt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Full Name */}
            <div className='space-y-1.5'>
              <label className='text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5'>
                <FiUser className='text-orange-500 w-3.5 h-3.5' /> Full Name *
              </label>
              {isEdit ? (
                <input 
                  type="text" 
                  value={userData.fullName}
                  onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                  className='w-full bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 transition'
                  placeholder="Enter your full name"
                />
              ) : (
                <p className='text-white text-xs font-medium bg-[#1A1A1A] border border-gray-800/80 rounded-xl px-4 py-3'>
                  {userData.fullName || 'Not provided'}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className='space-y-1.5'>
              <label className='text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between'>
                <span className='flex items-center gap-1.5'>
                  <FiMail className='text-orange-500 w-3.5 h-3.5' /> Email Address
                </span>
                <span className='text-emerald-400 text-[11px] flex items-center gap-1 font-semibold'>
                  <FiCheckCircle className='w-3 h-3' /> Verified Account
                </span>
              </label>
              <div className='relative'>
                <input 
                  type="email" 
                  disabled={true}
                  value={userData.email}
                  className='w-full bg-[#1A1A1A]/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-400 text-xs cursor-not-allowed select-none font-mono'
                />
                <FiLock className='absolute right-3.5 top-3.5 text-gray-600 w-3.5 h-3.5' />
              </div>
              <p className='text-[10px] text-gray-500'>Email is permanently verified and protected against unauthorized changes.</p>
            </div>

            {/* Phone Number */}
            <div className='space-y-1.5'>
              <label className='text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5'>
                <FiPhone className='text-orange-500 w-3.5 h-3.5' /> Contact Phone (Nepal)
              </label>
              {isEdit ? (
                <input 
                  type="tel" 
                  value={userData.phoneNumber}
                  onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})}
                  className='w-full bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-3 text-white text-xs font-mono outline-none focus:border-orange-500 transition'
                  placeholder="e.g. 9801234567"
                />
              ) : (
                <p className='text-white text-xs font-mono bg-[#1A1A1A] border border-gray-800/80 rounded-xl px-4 py-3'>
                  {userData.phoneNumber || 'Not provided'}
                </p>
              )}
            </div>

            {/* Avatar URL */}
            {isEdit && (
              <div className='space-y-1.5'>
                <label className='text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5'>
                  <FiUser className='text-orange-500 w-3.5 h-3.5' /> Avatar Image URL
                </label>
                <input 
                  type="url" 
                  value={userData.avatarUrl}
                  onChange={(e) => setUserData({...userData, avatarUrl: e.target.value})}
                  className='w-full bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-orange-500 transition'
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: SAVED DELIVERY ADDRESSES ── */}
        {activeTab === 'ADDRESSES' && (
          <div className='pt-8 space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-bold text-white uppercase tracking-wider'>
                  Nepali Delivery Destinations
                </h3>
                <p className='text-xs text-gray-400 mt-0.5'>
                  Manage your residential, office, and parcel pickup addresses across Nepal
                </p>
              </div>

              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className='inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm'
                >
                  <FiPlus /> Add New Address
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <form onSubmit={handleAddAddress} className='bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 space-y-4 animate-fadeIn'>
                <div className='flex items-center justify-between pb-3 border-b border-gray-800'>
                  <h4 className='text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2'>
                    <FiMapPin className='text-orange-500' />
                    <span>New Delivery Address</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className='text-xs text-gray-400 hover:text-white'
                  >
                    Cancel
                  </button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
                  <div>
                    <label className='block text-[11px] text-gray-400 uppercase font-semibold mb-1'>Recipient Full Name *</label>
                    <input
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                      className='w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500'
                    />
                  </div>

                  <div>
                    <label className='block text-[11px] text-gray-400 uppercase font-semibold mb-1'>Contact Phone (Nepal) *</label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 9801234567"
                      value={newAddress.phone}
                      onChange={(e) => {
                        setNewAddress({...newAddress, phone: e.target.value});
                        setAddressPhoneError('');
                      }}
                      className='w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-orange-500'
                    />
                    {addressPhoneError && <p className='text-[10px] text-red-400 mt-1'>{addressPhoneError}</p>}
                  </div>

                  <div>
                    <label className='block text-[11px] text-gray-400 uppercase font-semibold mb-1'>Province / प्रदेश *</label>
                    <select
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                      className='w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer'
                    >
                      {NEPAL_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='block text-[11px] text-gray-400 uppercase font-semibold mb-1'>City / District *</label>
                    <select
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      className='w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500 cursor-pointer'
                    >
                      {POPULAR_NEPAL_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="Other">Other City / Municipality...</option>
                    </select>
                  </div>

                  {newAddress.city === 'Other' && (
                    <div className='sm:col-span-2'>
                      <label className='block text-[11px] text-gray-400 uppercase font-semibold mb-1'>Specify Municipality / Town *</label>
                      <input
                        required
                        placeholder="e.g. Panauti, Kavre"
                        value={newAddress.customCity}
                        onChange={(e) => setNewAddress({...newAddress, customCity: e.target.value})}
                        className='w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500'
                      />
                    </div>
                  )}

                  <div className='sm:col-span-2'>
                    <label className='block text-[11px] text-gray-400 uppercase font-semibold mb-1'>Street, Landmark & Ward No. *</label>
                    <input
                      required
                      placeholder="e.g. Ward 4, Near Bhatbhateni, New Baneshwor"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      className='w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-orange-500'
                    />
                  </div>

                  <div>
                    <label className='block text-[11px] text-gray-400 uppercase font-semibold mb-1'>Postal Code</label>
                    <input
                      placeholder="e.g. 44600"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                      className='w-full bg-black border border-gray-800 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-orange-500'
                    />
                  </div>

                  <div className='flex items-center pt-5'>
                    <label className='flex items-center gap-2 cursor-pointer text-xs text-gray-300'>
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                        className='text-orange-500 focus:ring-orange-500 bg-black border-gray-800 rounded'
                      />
                      <span>Set as default delivery address</span>
                    </label>
                  </div>
                </div>

                <div className='flex gap-2.5 pt-2'>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className='px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm'
                  >
                    {savingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className='px-4 py-2.5 text-xs text-gray-400 hover:text-white'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {addresses.length === 0 && !showAddAddress ? (
              <div className='p-8 rounded-2xl bg-[#1A1A1A] border border-gray-800 text-center space-y-3'>
                <FiMapPin className='w-8 h-8 text-gray-500 mx-auto' />
                <h4 className='text-sm font-bold text-white'>No Saved Delivery Addresses</h4>
                <p className='text-xs text-gray-400 max-w-sm mx-auto'>
                  Add your home or office address to speed through checkout on future purchases.
                </p>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className='inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition'
                >
                  <FiPlus /> Add First Address
                </button>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      addr.isDefault
                        ? 'border-orange-500/60 bg-orange-500/5 ring-1 ring-orange-500/40 shadow-sm'
                        : 'border-gray-800 bg-[#1A1A1A]'
                    }`}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h4 className='text-sm font-bold text-white'>{addr.fullName}</h4>
                        {addr.isDefault && (
                          <span className='text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 uppercase tracking-wider inline-block mt-1'>
                            Default Address
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        disabled={deletingAddrId === addr.id}
                        className='text-gray-500 hover:text-rose-400 transition p-1'
                        title="Delete address"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    <p className='text-xs text-gray-300 leading-relaxed mt-2'>
                      {addr.street}, {addr.city}
                    </p>
                    <p className='text-[11px] text-gray-400 mt-1'>
                      {addr.state} • Postal: <span className='font-mono'>{addr.zipCode}</span>
                    </p>
                    <p className='text-xs text-gray-300 font-mono mt-2 pt-2 border-t border-gray-800/80 flex items-center gap-1.5'>
                      <FiPhone className='text-orange-400' size={12} /> {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SERVICES & SHORTCUTS ── */}
        {activeTab === 'SERVICES' && (
          <div className='pt-8 space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Orders Link */}
              <Link
                to="/orders"
                className='p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#202020] border border-gray-800 hover:border-orange-500/40 transition group flex items-start gap-4'
              >
                <div className='w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0'>
                  <FiTruck size={20} />
                </div>
                <div className='flex-1'>
                  <h4 className='text-sm font-bold text-white group-hover:text-orange-400 transition flex items-center justify-between'>
                    <span>My Orders & Tracking</span>
                    <FiArrowRight className='transition-transform group-hover:translate-x-1' />
                  </h4>
                  <p className='text-xs text-gray-400 mt-1 leading-relaxed'>
                    View order status, real-time tracking timeline, and cancel pending orders.
                  </p>
                </div>
              </Link>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className='p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#202020] border border-gray-800 hover:border-orange-500/40 transition group flex items-start gap-4'
              >
                <div className='w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0'>
                  <FiHeart size={20} />
                </div>
                <div className='flex-1'>
                  <h4 className='text-sm font-bold text-white group-hover:text-rose-400 transition flex items-center justify-between'>
                    <span>Saved Wishlist</span>
                    <FiArrowRight className='transition-transform group-hover:translate-x-1' />
                  </h4>
                  <p className='text-xs text-gray-400 mt-1 leading-relaxed'>
                    Manage your saved merchandise, check live stock, and bulk move items to cart.
                  </p>
                </div>
              </Link>

              {/* Shopping Cart Link */}
              <Link
                to="/cart"
                className='p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#202020] border border-gray-800 hover:border-orange-500/40 transition group flex items-start gap-4'
              >
                <div className='w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0'>
                  <FiShoppingCart size={20} />
                </div>
                <div className='flex-1'>
                  <h4 className='text-sm font-bold text-white group-hover:text-emerald-400 transition flex items-center justify-between'>
                    <span>Shopping Cart</span>
                    <FiArrowRight className='transition-transform group-hover:translate-x-1' />
                  </h4>
                  <p className='text-xs text-gray-400 mt-1 leading-relaxed'>
                    Selective checkout, free shipping tracker, and promotional coupon engine.
                  </p>
                </div>
              </Link>

              {/* Merchant / Admin Center if applicable */}
              {isMerchant ? (
                <Link
                  to={roleUpper === 'SELLER' ? '/seller/dashboard' : '/admin/dashboard'}
                  className='p-5 rounded-2xl bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/30 transition group flex items-start gap-4'
                >
                  <div className='w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0'>
                    <FiBriefcase size={20} />
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-sm font-bold text-orange-400 flex items-center justify-between'>
                      <span>{roleUpper === 'SELLER' ? 'Seller Merchant Hub' : 'Administrator Control Panel'}</span>
                      <FiArrowRight className='transition-transform group-hover:translate-x-1' />
                    </h4>
                    <p className='text-xs text-gray-300 mt-1 leading-relaxed'>
                      Access inventory fulfillment, sales analytics, product management, and moderation.
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/collection"
                  className='p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#202020] border border-gray-800 hover:border-orange-500/40 transition group flex items-start gap-4'
                >
                  <div className='w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0'>
                    <FiShoppingBag size={20} />
                  </div>
                  <div className='flex-1'>
                    <h4 className='text-sm font-bold text-white group-hover:text-blue-400 transition flex items-center justify-between'>
                      <span>Browse Storefront</span>
                      <FiArrowRight className='transition-transform group-hover:translate-x-1' />
                    </h4>
                    <p className='text-xs text-gray-400 mt-1 leading-relaxed'>
                      Discover newly added arrivals, trending gadgets, and promotional price deals.
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Profile;
