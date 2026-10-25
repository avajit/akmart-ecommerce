import React from 'react';
import Title from '../components/Title';
import { FiCheckCircle, FiClock, FiShield, FiRefreshCw, FiDollarSign, FiHelpCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Refund() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-poppins text-white min-h-screen">
      <div className="text-center py-6 text-3xl">
        <Title text1="RETURNS &" text2="REFUND POLICY" />
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Clear, consumer-first guarantees for every order placed across Nepal.
        </p>
      </div>

      {/* 3 Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-3">
            <FiClock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">7-Day Window</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Report any defective, damaged, or incorrect items within 7 days of package delivery for full coverage.
          </p>
        </div>

        <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-3">
            <FiRefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Doorstep Pickup</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Our courier partners pick up the return parcel directly from your doorstep in Kathmandu, Pokhara, and major cities.
          </p>
        </div>

        <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mb-3">
            <FiDollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Direct Wallet Refund</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Receive full refunds directly to your eSewa, Khalti, or Nepali bank account within 24–48 hours of verification.
          </p>
        </div>
      </div>

      {/* Detailed Policy Text */}
      <div className="bg-[#141414] border border-gray-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-xs sm:text-sm text-gray-300 leading-relaxed">
        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiCheckCircle className="text-orange-500" />
            <span>1. Eligibility for Returns & Exchanges</span>
          </h3>
          <p>
            An item is eligible for return or exchange if it meets any of the following criteria upon arrival:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li>Product delivered is damaged, physically broken, or defective.</li>
            <li>Item does not match the specifications, brand, size, or color listed in your order.</li>
            <li>Missing accessories, parts, or warranty cards mentioned in product description.</li>
            <li>Counterfeit or unverified goods (AkMart strictly guarantees 100% authentic merchandise).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiShield className="text-orange-500" />
            <span>2. Condition of Returned Items</span>
          </h3>
          <p>
            To ensure quick approval, products must be returned in original condition with all manufacturer tags, barcode stickers, brand boxes, and warranty cards intact. Apparel and footwear must be unworn and unwashed.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiDollarSign className="text-orange-500" />
            <span>3. Refund Channels & Timelines</span>
          </h3>
          <p>
            Once our inspection team receives and verifies the returned product at our Kathmandu logistics hub, refunds are processed immediately:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-black/40 border border-gray-800 p-3 rounded-xl text-xs">
              <span className="font-bold text-emerald-400">eSewa Wallet</span>
              <p className="text-gray-400 mt-1">Processed within 24 hours</p>
            </div>
            <div className="bg-black/40 border border-gray-800 p-3 rounded-xl text-xs">
              <span className="font-bold text-purple-400">Khalti Wallet</span>
              <p className="text-gray-400 mt-1">Processed within 24 hours</p>
            </div>
            <div className="bg-black/40 border border-gray-800 p-3 rounded-xl text-xs">
              <span className="font-bold text-blue-400">Nepali Bank Account</span>
              <p className="text-gray-400 mt-1">Direct IPS transfer in 1–2 banking days</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 pt-4 border-t border-gray-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FiHelpCircle className="text-orange-500" />
            <span>Need Help Initiating a Return?</span>
          </h3>
          <p>
            Please check your active purchase under <Link to="/orders" className="text-orange-400 underline font-semibold">My Orders</Link> or reach out directly to our customer support team at <strong className="text-white">support@akmart.com.np</strong> or hotline <strong className="text-white">+977 1-4567890</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
