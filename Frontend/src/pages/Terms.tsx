import React from 'react';
import Title from '../components/Title';
import { FiFileText, FiAlertTriangle, FiCheckCircle, FiDollarSign, FiTruck } from 'react-icons/fi';

export default function Terms() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-poppins text-gray-200 min-h-screen">
      
      {/* ── Page Header ── */}
      <div className="text-center py-6">
        <Title text1="TERMS OF" text2="SERVICE" />
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Effective Date: October 2026 &bull; AKMart Multi-Vendor Marketplace (Nepal)
        </p>
      </div>

      {/* ── Mandatory Legal Disclaimer Alert ── */}
      <div className="mb-8 p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3.5 shadow-lg">
        <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-amber-400 text-xs">
            Draft Legal Notice for Beta Testing
          </p>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            This document outlines the standard draft marketplace terms of service for the AKMart Public Beta launch in Nepal. Prior to commercial scale and non-beta operations, this draft must be audited and finalized by a qualified corporate attorney licensed by the Nepal Bar Council.
          </p>
        </div>
      </div>

      {/* ── Content Sections ── */}
      <div className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">1</span>
            Acceptance of Terms
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            By creating an account, browsing the product catalog, or placing an order on AKMart (akmart-ecommerce.vercel.app), you agree to be bound by these Terms of Service and all related policies (including our Privacy Policy and 7-Day Refund Policy). If you do not accept these terms, you must refrain from using the platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">2</span>
            User Accounts & Authenticity
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-300">
            <li>You must provide an authentic name and a valid 10-digit Nepali mobile number (NTC/Ncell).</li>
            <li>You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.</li>
            <li>We reserve the right to suspend or terminate accounts engaging in fraudulent Cash on Delivery orders or spoofed product reviews.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">3</span>
            Cash on Delivery (COD) Rules & Customer Duty
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Cash on Delivery is provided as a trusted convenience across Nepal. When opting for COD:
          </p>
          <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-2 text-xs text-gray-300">
            <p>• <strong>Payment in Full:</strong> You agree to tender the exact order amount in Nepali Rupees (NPR) upon courier arrival.</p>
            <p>• <strong>Verification Call:</strong> Our merchant or dispatch team may place a brief voice verification call to confirm address accuracy prior to parcel dispatch.</p>
            <p>• <strong>Abuse Prevention:</strong> Habitual refusal of verified COD parcels without valid defect reasons will result in the permanent suspension of COD eligibility for that user account and phone number.</p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">4</span>
            Pricing & Stock Integrity
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            All prices on AKMart are displayed in Nepali Rupees (NPR / Rs.) inclusive of applicable local value taxes unless explicitly marked otherwise. All orders are validated against real-time server inventory. In the rare event of an out-of-stock situation caused by simultaneous orders, the platform will automatically cancel the affected line item and restock inventory.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">5</span>
            Multi-Vendor Marketplace Relationship
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            AKMart operates as an electronic marketplace platform connecting independent verified vendors across Nepal with consumers. While AKMart screens vendors through administrative verification, product warranties and manufacturing defects are primarily warranted by the merchant or authorized brand distributor.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">6</span>
            Governing Law & Jurisdiction
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            These Terms of Service are governed by and construed in accordance with the laws of Nepal. Any disputes arising in connection with the platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Kathmandu, Nepal</strong>.
          </p>
        </section>

      </div>
    </div>
  );
}
