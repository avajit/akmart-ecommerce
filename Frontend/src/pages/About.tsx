import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/frontend_assets/assets';
import { FiShield, FiTruck, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-poppins text-white min-h-screen">
      {/* Title */}
      <div className="text-center py-6 text-3xl">
        <Title text1="ABOUT" text2="AKMART" />
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
          Empowering modern commerce and direct consumer-vendor trade across Nepal.
        </p>
      </div>

      {/* Hero Story Section */}
      <div className="my-10 flex flex-col md:flex-row items-center gap-10 lg:gap-16">
        <div className="w-full md:w-1/2">
          <div className="relative rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
            <img
              src={assets.about_img || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop"}
              alt="AkMart Nepal Team"
              className="w-full h-[360px] sm:h-[420px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="px-3 py-1 bg-orange-500 text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                Our Story
              </span>
              <p className="text-white font-bold text-lg mt-2">Founded in Kathmandu, Serving All 7 Provinces</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-start gap-5 text-gray-300 text-sm leading-relaxed">
          <h3 className="text-2xl font-extrabold text-white">
            Transforming Nepal&apos;s Digital Retail Landscape
          </h3>
          <p>
            AkMart was founded with a singular conviction: every shopper across Nepal—from the heart of Kathmandu to Pokhara, Biratnagar, and remote towns—deserves seamless access to 100% authentic products at genuine market prices.
          </p>
          <p>
            We operate as a high-performance multi-vendor marketplace where verified Nepali sellers, artisans, and leading global brands connect directly with passionate shoppers. By eliminating predatory middleman markups, we ensure fair returns for vendors and unbeatable value for consumers.
          </p>
          <p className="text-gray-400">
            Backed by localized payments (Cash on Delivery, eSewa, Khalti) and dedicated nationwide delivery logistics, AkMart is shaping the next era of e-commerce in the Himalayas.
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl transition shadow-lg shadow-orange-500/20 text-xs uppercase tracking-wider mt-2"
          >
            Explore Catalog <FiArrowRight />
          </Link>
        </div>
      </div>

      {/* Core Values Strip */}
      <div className="mt-20">
        <div className="text-center mb-10">
          <Title text1="WHY CHOOSE" text2="AKMART" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 text-center hover:border-orange-500/50 transition duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <FiShield className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">100% Genuine</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every listing undergoes rigorous authenticity verification to prevent counterfeit products.
            </p>
          </div>

          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 text-center hover:border-orange-500/50 transition duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <FiTruck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Nepal-Wide Delivery</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Rapid doorstep dispatch covering Kathmandu Valley and all major cities across 7 provinces.
            </p>
          </div>

          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 text-center hover:border-orange-500/50 transition duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <FiAward className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">7-Day Guarantee</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hassle-free return and exchange policy if an item arrives damaged, defective, or mismatched.
            </p>
          </div>

          <div className="bg-[#141414] border border-gray-800/80 rounded-2xl p-6 text-center hover:border-orange-500/50 transition duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <FiUsers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Verified Merchants</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              We empower local Nepali entrepreneurs and businesses with advanced storefront tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
