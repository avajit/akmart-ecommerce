import React from 'react';
import Title from '../components/Title';
import { FiShield, FiAlertTriangle, FiLock, FiEye, FiUserCheck, FiFileText } from 'react-icons/fi';

export default function Privacy() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-poppins text-gray-200 min-h-screen">
      
      {/* ── Page Header ── */}
      <div className="text-center py-6">
        <Title text1="PRIVACY" text2="POLICY" />
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Effective Date: October 2026 &bull; AKMart Nepal (Multi-Vendor Marketplace)
        </p>
      </div>

      {/* ── Mandatory Legal Disclaimer Alert ── */}
      <div className="mb-8 p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3.5 shadow-lg">
        <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <p className="font-bold uppercase tracking-wider text-amber-400 text-xs">
            Notice for Pre-Launch Beta Review
          </p>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            This document is a draft privacy policy prepared for the AKMart Public Beta launch under the laws of Nepal (including the <em>Individual Privacy Act 2075</em> and <em>Electronic Transactions Act 2063</em>). This text must be formally audited and reviewed by a licensed Nepali advocate/attorney prior to commercial scale.
          </p>
        </div>
      </div>

      {/* ── Content Sections ── */}
      <div className="bg-[#121212] border border-gray-800/80 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">1</span>
            Introduction & Scope
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            AKMart (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the multi-vendor e-commerce platform deployed at <strong>akmart-ecommerce.vercel.app</strong>, serving consumers, merchants, and logistics partners across the Federal Democratic Republic of Nepal. We are committed to safeguarding the privacy and digital security of every customer and merchant in compliance with Nepal&apos;s <em>Privacy Act, 2075 (2018)</em>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">2</span>
            Information We Collect
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            To fulfill orders, verify customer identities, and facilitate doorstep deliveries across Nepal, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-300">
            <li><strong>Identity & Account Data:</strong> Full name, verified email address, and 10-digit Nepali mobile number (NTC/Ncell).</li>
            <li><strong>Logistics & Address Data:</strong> Province, district (across Nepal&apos;s 77 districts), municipality/city, street address/tole, and optional customer delivery instructions.</li>
            <li><strong>Transactional Data:</strong> Order history, selected payment channel (Cash on Delivery or digital wallet references), item quantities, and snapshot prices in NPR (Rs.).</li>
            <li><strong>Device & Telemetry Data:</strong> IP address, browser type, session identifiers, and security audit logs strictly utilized for brute-force and DDoS prevention.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">3</span>
            How We Use Your Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-1">
              <span className="font-bold text-xs text-orange-400">Order Fulfillment</span>
              <p className="text-xs text-gray-300">Dispatching parcels with courier partners and notifying you of delivery status via SMS/Email.</p>
            </div>
            <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-1">
              <span className="font-bold text-xs text-orange-400">Fraud Prevention</span>
              <p className="text-xs text-gray-300">Screening for fake COD order placement and preventing brute-force authentication attacks.</p>
            </div>
            <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-1">
              <span className="font-bold text-xs text-orange-400">Customer Support</span>
              <p className="text-xs text-gray-300">Resolving 7-day refund/return requests and inquiries via our support desk and WhatsApp hotline.</p>
            </div>
            <div className="p-4 bg-black/40 border border-gray-800 rounded-2xl space-y-1">
              <span className="font-bold text-xs text-orange-400">Merchant Payouts</span>
              <p className="text-xs text-gray-300">Accurately calculating seller item commissions and sales reporting across verified Nepal vendors.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">4</span>
            Data Sharing & Third-Party Disclosure
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            We respect your privacy and <strong>never sell or lease personal data</strong> to third-party advertisers. Data is shared exclusively on a need-to-know basis with:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-300">
            <li><strong>Verified Third-Party Merchants:</strong> Shared your shipping name, delivery address, and phone number to fulfill and pack your order.</li>
            <li><strong>Logistics & Courier Partners:</strong> Shared recipient details for physical doorstep delivery within Kathmandu Valley and across all 7 provinces.</li>
            <li><strong>Law Enforcement & Judicial Authorities:</strong> Only when strictly mandated by formal subpoenas or orders from a competent court of law in Nepal.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">5</span>
            Your Rights Under Nepal Law
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Under the Individual Privacy Act 2075, you have the right to request access to your stored personal information, correct inaccurate shipping data via your Profile page, or request complete account deletion by contacting our Data Protection Officer at <span className="text-orange-400 font-mono">privacy@akmart.com.np</span>.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 flex items-center justify-center text-xs font-bold">6</span>
            Contacting Our Privacy Officer
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            If you have questions regarding this Privacy Policy, your account security, or data handling practices:
          </p>
          <div className="p-4 bg-[#181818] border border-gray-800 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-white">AKMart Nepal Privacy Office</p>
            <p className="text-gray-400">New Baneshwor, Ward 10, Kathmandu, Nepal</p>
            <p className="text-gray-400">Email: <span className="text-orange-400 font-mono">support@akmart.com.np</span> | Phone: +977 1-4567890</p>
          </div>
        </section>

      </div>
    </div>
  );
}
