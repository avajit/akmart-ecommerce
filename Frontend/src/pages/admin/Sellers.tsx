import React, { useEffect, useState, useMemo } from 'react';
import { getAllSellersAdmin, verifySeller, rejectSeller, suspendSeller } from '../../api/admin.api';
import { toast } from 'react-toastify';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle, 
  FiSearch, 
  FiShield, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCreditCard, 
  FiFileText, 
  FiRefreshCw, 
  FiChevronDown, 
  FiChevronUp,
  FiBox
} from 'react-icons/fi';

type SellerTab = 'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED';

export default function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SellerTab>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSellerId, setExpandedSellerId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: 'VERIFY' | 'REJECT' | 'SUSPEND';
    seller: any;
  } | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = () => {
    setLoading(true);
    getAllSellersAdmin()
      .then((res: any) => {
        setSellers(res.data?.sellers || []);
        setLoading(false);
      })
      .catch((err: any) => {
        toast.error(err.response?.data?.message || err.message || 'Failed to load sellers');
        setLoading(false);
      });
  };

  const handleExecuteAction = async () => {
    if (!actionModal) return;
    const { type, seller } = actionModal;
    setProcessingAction(true);

    try {
      if (type === 'VERIFY') {
        await verifySeller(seller.id);
        toast.success(`Merchant "${seller.shopName}" verified successfully!`);
      } else if (type === 'REJECT') {
        await rejectSeller(seller.id);
        toast.warning(`Application for "${seller.shopName}" rejected`);
      } else if (type === 'SUSPEND') {
        await suspendSeller(seller.id);
        toast.error(`Merchant "${seller.shopName}" suspended`);
      }
      setActionModal(null);
      fetchSellers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || err.message || "Action failed");
    } finally {
      setProcessingAction(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let verifiedCount = 0;
    let suspendedCount = 0;

    sellers.forEach(s => {
      if (s.verificationStatus === 'PENDING') pendingCount += 1;
      else if (s.verificationStatus === 'VERIFIED') verifiedCount += 1;
      else if (s.verificationStatus === 'SUSPENDED' || s.verificationStatus === 'REJECTED') suspendedCount += 1;
    });

    return {
      total: sellers.length,
      pending: pendingCount,
      verified: verifiedCount,
      suspended: suspendedCount,
    };
  }, [sellers]);

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter(s => {
      if (activeTab === 'PENDING' && s.verificationStatus !== 'PENDING') return false;
      if (activeTab === 'VERIFIED' && s.verificationStatus !== 'VERIFIED') return false;
      if (activeTab === 'SUSPENDED' && (s.verificationStatus !== 'SUSPENDED' && s.verificationStatus !== 'REJECTED')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const shop = (s.shopName || '').toLowerCase();
        const email = (s.user?.email || '').toLowerCase();
        const name = (s.user?.fullName || '').toLowerCase();
        const phone = (s.phoneNumber || s.user?.phoneNumber || '').toLowerCase();
        const pan = (s.panNumber || '').toLowerCase();
        const gst = (s.gstNumber || '').toLowerCase();

        return shop.includes(q) || email.includes(q) || name.includes(q) || phone.includes(q) || pan.includes(q) || gst.includes(q);
      }

      return true;
    });
  }, [sellers, activeTab, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-poppins text-white pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <span className="text-orange-500 text-xs font-bold tracking-widest uppercase">Admin Moderation</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 uppercase">Vendor KYC & Verification</h1>
          <p className="text-sm text-gray-400 mt-0.5">Audit merchant onboarding documentation, banking credentials, and platform licensing</p>
        </div>

        <button
          onClick={fetchSellers}
          disabled={loading}
          className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#242424] text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-800 text-xs font-semibold transition"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Syncing..." : "Refresh Vendors"}
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-gray-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Vendors</span>
            <FiUsers className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-4">{metrics.total}</p>
          <span className="text-[11px] text-gray-500 mt-1">Registered suppliers</span>
        </div>

        <div className="bg-[#141414] border border-amber-500/30 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <FiAlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-4">{metrics.pending}</p>
          <span className="text-[11px] text-amber-500/70 mt-1">Awaiting verification</span>
        </div>

        <div className="bg-[#141414] border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Merchants</span>
            <FiCheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-4">{metrics.verified}</p>
          <span className="text-[11px] text-emerald-500/70 mt-1">Authorized to sell & payout</span>
        </div>

        <div className="bg-[#141414] border border-rose-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Suspended / Rejected</span>
            <FiXCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-4">{metrics.suspended}</p>
          <span className="text-[11px] text-rose-500/70 mt-1">Restricted from selling</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Pending Review ({metrics.pending})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'VERIFIED'
                ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Verified ({metrics.verified})
          </button>
          <button
            onClick={() => setActiveTab('SUSPENDED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'SUSPENDED'
                ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            Suspended ({metrics.suspended})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'ALL'
                ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20'
                : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
            }`}
          >
            All Vendors ({metrics.total})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            type="text"
            placeholder="Search shop, name, email, PAN, GST..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/80 transition"
          />
        </div>
      </div>

      {/* Vendors List */}
      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xs">Loading supplier verification queue...</p>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-16 text-center">
          <FiShield size={36} className="mx-auto mb-3 text-gray-600" />
          <h3 className="text-base font-bold text-white mb-1">No Vendors in this Category</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery
              ? `No vendors matched your search term "${searchQuery}".`
              : activeTab === 'PENDING'
              ? 'Awesome! The vendor verification queue is currently empty.'
              : 'No suppliers found in this filter view.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSellers.map((seller: any) => {
            const isExpanded = expandedSellerId === seller.id;
            const hasPayoutInfo = Boolean(
              seller.gstNumber && seller.panNumber &&
              seller.bankAccountNumber && seller.bankIfscCode && seller.bankAccountName
            );

            return (
              <div
                key={seller.id}
                className="bg-[#141414] border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700 transition shadow-lg space-y-4"
              >
                {/* Top Row: Shop Info, Contact & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Shop Details */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-extrabold text-base flex-shrink-0">
                      {seller.shopName ? seller.shopName.charAt(0).toUpperCase() : 'S'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">{seller.shopName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            seller.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : seller.verificationStatus === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {seller.verificationStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <FiMail size={12} className="text-gray-500" />
                          {seller.user?.email || "No email"}
                        </span>
                        <span className="text-gray-600">&bull;</span>
                        <span className="flex items-center gap-1">
                          <FiPhone size={12} className="text-gray-500" />
                          {seller.phoneNumber || seller.user?.phoneNumber || "No phone"}
                        </span>
                        <span className="text-gray-600">&bull;</span>
                        <span className="flex items-center gap-1">
                          <FiBox size={12} className="text-gray-500" />
                          {seller._count?.listings || 0} Listings
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2.5 self-end lg:self-auto">
                    <button
                      onClick={() => setExpandedSellerId(isExpanded ? null : seller.id)}
                      className="px-3 py-2 bg-[#1F1F1F] hover:bg-[#282828] text-gray-300 hover:text-white rounded-xl text-xs font-semibold border border-gray-800 transition flex items-center gap-1.5"
                    >
                      <FiFileText size={13} />
                      {isExpanded ? "Hide KYC" : "Inspect KYC"}
                      {isExpanded ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                    </button>

                    {seller.verificationStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => setActionModal({ type: 'VERIFY', seller })}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                        >
                          <FiCheckCircle size={13} />
                          Verify & Approve
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'REJECT', seller })}
                          className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <FiXCircle size={13} />
                          Reject
                        </button>
                      </>
                    )}

                    {seller.verificationStatus === 'VERIFIED' && (
                      <button
                        onClick={() => setActionModal({ type: 'SUSPEND', seller })}
                        className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <FiAlertTriangle size={13} />
                        Suspend Vendor
                      </button>
                    )}

                    {seller.verificationStatus === 'SUSPENDED' && (
                      <button
                        onClick={() => setActionModal({ type: 'VERIFY', seller })}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <FiCheckCircle size={13} />
                        Re-verify & Restore
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded KYC Details Panel */}
                {isExpanded && (
                  <div className="pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs animate-fadeIn">
                    {/* Column 1: Business Tax & Registration */}
                    <div className="bg-black/50 border border-gray-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-orange-400 font-bold uppercase tracking-wider text-[11px]">
                        <FiFileText size={13} />
                        Tax Registration
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">PAN Number</span>
                        <span className="font-mono text-white font-semibold">{seller.panNumber || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">GST / VAT Number</span>
                        <span className="font-mono text-white font-semibold">{seller.gstNumber || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Merchant Onboarding Date</span>
                        <span className="text-gray-300">
                          {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Bank Payout Coordinates */}
                    <div className="bg-black/50 border border-gray-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                          <FiCreditCard size={13} />
                          Banking Credentials
                        </div>
                        {hasPayoutInfo ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                            Complete
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-bold">
                            Incomplete
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Account Holder</span>
                        <span className="text-white font-semibold">{seller.bankAccountName || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Account Number</span>
                        <span className="font-mono text-white font-semibold">{seller.bankAccountNumber || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">IFSC / Routing Code</span>
                        <span className="font-mono text-white font-semibold">{seller.bankIfscCode || "Not Provided"}</span>
                      </div>
                    </div>

                    {/* Column 3: Warehouse & Physical Address */}
                    <div className="bg-black/50 border border-gray-800 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                        <FiMapPin size={13} />
                        Store Address
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Street Address</span>
                        <span className="text-white font-semibold">{seller.address || "Not Provided"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">City & Region</span>
                        <span className="text-white font-semibold">
                          {seller.city ? `${seller.city}, ${seller.state}` : 'Not Provided'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Postal Code & Country</span>
                        <span className="text-white font-semibold">
                          {seller.pincode ? `${seller.pincode} (${seller.country || 'NP'})` : 'Not Provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181818] border border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  actionModal.type === 'VERIFY'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {actionModal.type === 'VERIFY' ? <FiCheckCircle size={24} /> : <FiAlertTriangle size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {actionModal.type === 'VERIFY'
                    ? 'Verify & Authorize Merchant'
                    : actionModal.type === 'REJECT'
                    ? 'Reject Seller Application'
                    : 'Suspend Merchant Account'}
                </h3>
                <p className="text-xs text-gray-400">{actionModal.seller.shopName}</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {actionModal.type === 'VERIFY'
                ? `Confirming verification will grant "${actionModal.seller.shopName}" full selling privileges on AkMart, activate their listings in the consumer catalog, and enable merchant payouts.`
                : actionModal.type === 'REJECT'
                ? `Rejecting this application will notify the applicant and leave their shop in a rejected state. They will need to re-submit updated KYC.`
                : `Suspending "${actionModal.seller.shopName}" will immediately deactivate all their active product listings from the public store and prevent any further sales.`}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal(null)}
                disabled={processingAction}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={processingAction}
                className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                  actionModal.type === 'VERIFY'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {processingAction ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
