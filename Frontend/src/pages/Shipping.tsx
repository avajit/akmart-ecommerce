import React from 'react';
import Title from '../components/Title';
import { FiTruck, FiClock, FiMapPin, FiShield, FiDollarSign, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export default function Shipping() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-poppins text-gray-200 min-h-screen">
      
      {/* ── Page Header ── */}
      <div className="text-center py-6">
        <Title text1="SHIPPING &" text2="DELIVERY" />
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Doorstep delivery coverage across all 7 provinces and 77 districts of Nepal.
        </p>
      </div>

      {/* ── Legal Disclaimer Banner ── */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3.5 shadow-lg">
        <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-amber-400 text-xs">
            Beta Logistics Guidelines
          </p>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            These delivery turnaround times represent standard operational targets established with our courier partners (Nepal Post, Nepal Can Move, Aramex, and local logistics riders). Subject to road conditions, natural terrain, and festival peak volumes.
          </p>
        </div>
      </div>

      {/* ── Delivery Speed Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#121212] border border-orange-500/20 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <FiClock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Kathmandu Valley</h3>
          <p className="text-xs text-orange-400 font-semibold font-mono">24 – 48 Hours Delivery</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Covers Kathmandu, Lalitpur, and Bhaktapur municipal areas. Includes same-day or next-day delivery on selected vendor items.
          </p>
        </div>

        <div className="bg-[#121212] border border-blue-500/20 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <FiTruck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Major Regional Cities</h3>
          <p className="text-xs text-blue-400 font-semibold font-mono">2 – 4 Business Days</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Covers Pokhara, Biratnagar, Bharatpur (Chitwan), Butwal, Dharan, Nepalgunj, Hetauda, Itahari, Birtamode, and Janakpur.
          </p>
        </div>

        <div className="bg-[#121212] border border-emerald-500/20 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <FiMapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Hill & Outer Districts</h3>
          <p className="text-xs text-emerald-400 font-semibold font-mono">4 – 7 Business Days</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Delivered via regional district distribution hubs and local transport networks to all 77 districts across Nepal.
          </p>
        </div>
      </div>

      {/* ── Detailed Policy Card ── */}
      <div className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        
        {/* Shipping Rates */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">1</span>
            Delivery Rates & Free Shipping Rule
          </h2>
          <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-2 text-xs text-gray-300">
            <p className="flex items-center gap-2">
              <FiCheckCircle className="text-emerald-400 shrink-0" />
              <span><strong>FREE Delivery across Nepal:</strong> Automatically granted on all orders with a subtotal of <strong>Rs. 2,500 or higher</strong>.</span>
            </p>
            <p className="flex items-center gap-2">
              <FiCheckCircle className="text-orange-400 shrink-0" />
              <span><strong>Standard Flat Delivery:</strong> A flat shipping charge of <strong>Rs. 100</strong> applies to orders below Rs. 2,500 anywhere in Nepal.</span>
            </p>
          </div>
        </section>

        {/* Order Verification & Tracking */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">2</span>
            Order Tracking & Verification Call
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Once you place an order, you can track its progress live on our interactive <strong>Orders</strong> page. For Cash on Delivery orders, our dispatch desk will place a brief verification phone call to confirm your address before the rider is dispatched.
          </p>
        </section>

        {/* Doorstep Inspection */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">3</span>
            Doorstep Parcel Inspection
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Customers have the right to inspect the external packaging in the presence of the delivery rider. If the seal is compromised or the package shows visible transit damage, you may reject the parcel and contact our support hotline immediately.
          </p>
        </section>

        {/* Undelivered Parcels */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">4</span>
            Failed Delivery Attempts
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Our courier will make up to <strong>three (3) delivery attempts</strong> to reach your specified contact number. If the recipient remains unreachable after 3 attempts, the parcel is safely returned to the vendor warehouse and marked as cancelled.
          </p>
        </section>

      </div>
    </div>
  );
}
