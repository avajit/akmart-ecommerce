import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createSellerProfile } from '../../api/seller.api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { FiBriefcase, FiCheckCircle, FiShield, FiArrowRight, FiInfo } from 'react-icons/fi';

export default function Onboarding() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rawRole = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();

  // If already a seller or admin, give them 1-click access to dashboard
  useEffect(() => {
    if (rawRole === 'SELLER') {
      toast.info('You already have an active merchant account!', { toastId: 'already-seller' });
      navigate('/seller/dashboard', { replace: true });
    } else if (rawRole === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [rawRole, navigate]);

  const [formData, setFormData] = useState({
    shopName: '',
    phoneNumber: user?.phoneNumber || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'NP',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createSellerProfile(formData);
      updateUser({ role: 'SELLER', roleName: 'SELLER' });
      toast.success('Congratulations! Your seller store has been created.', { toastId: 'seller-created' });
      navigate('/seller/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || err.message || '';
      if (err.response?.status === 409 || errMsg.toLowerCase().includes('already exists')) {
        updateUser({ role: 'SELLER', roleName: 'SELLER' });
        toast.info('You already have an active merchant store! Welcome back.', { toastId: 'seller-exists' });
        navigate('/seller/dashboard', { replace: true });
        return;
      }
      toast.error(errMsg || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-4 shadow-lg">
          <FiBriefcase className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Open Your AkMart Merchant Store
        </h1>
        <p className="mt-2 text-sm text-gray-400 max-w-lg mx-auto">
          Start selling to thousands of shoppers across Nepal. Use your existing AkMart account with zero hassle.
        </p>
      </div>

      {/* Admin Verification Notice Pill */}
      <div className="mb-6 p-4 rounded-xl bg-[#161616] border border-orange-500/20 flex items-start gap-3 text-xs text-gray-300">
        <FiShield className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Platform Verification Process:</span> Once submitted, your shop profile is created instantly. AkMart Admin will review your shop details to approve bank payouts and catalog listings.
        </div>
      </div>

      {/* Setup Form */}
      <form onSubmit={handleSubmit} className="bg-[#121212] p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
            Shop / Business Name <span className="text-orange-500">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="e.g. Kathmandu Gadgets & Fashion"
            className="w-full bg-[#1A1A1A] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
            Business Contact Phone <span className="text-orange-500">*</span>
          </label>
          <input
            required
            type="tel"
            placeholder="e.g. 9801234567"
            className="w-full bg-[#1A1A1A] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              City <span className="text-orange-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Kathmandu"
              className="w-full bg-[#1A1A1A] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              State / Province <span className="text-orange-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Bagmati Province"
              className="w-full bg-[#1A1A1A] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Shop Physical Address <span className="text-orange-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. New Road, Ward 22"
              className="w-full bg-[#1A1A1A] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
              Postal / Pincode <span className="text-orange-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. 44600"
              className="w-full bg-[#1A1A1A] border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25 mt-6 cursor-pointer active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating Your Merchant Store...</span>
            </>
          ) : (
            <>
              <span>Complete Setup & Enter Dashboard</span>
              <FiArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
