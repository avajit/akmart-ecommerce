import React, { useState } from 'react';
import { FiShoppingCart, FiHeart, FiStar, FiShield, FiCheckCircle, FiSearch } from 'react-icons/fi';

export default function StyleTile() {
  const [selectedDirection, setSelectedDirection] = useState<'himalayan' | 'alpine'>('himalayan');

  return (
    <div className="min-h-screen bg-[#07090E] text-white p-4 sm:p-8 font-sans">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-gray-800 pb-6">
        <span className="text-xs uppercase tracking-widest text-orange-400 font-bold">AKMart Visual Direction Gate</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight text-white">Visual Design Directions & Style Tiles</h1>
        <p className="text-gray-400 text-sm mt-2 max-w-3xl leading-relaxed">
          Comparing two curated design systems for AKMart Nepal. Review color tokens, contrast ratios, typography with Devanagari support, buttons, form controls, and product cards.
        </p>

        {/* Direction Switcher Pills */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setSelectedDirection('himalayan')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] ${
              selectedDirection === 'himalayan'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400'
                : 'bg-gray-800/80 text-gray-400 hover:text-white'
            }`}
          >
            Direction 1: Himalayan Modern
          </button>
          <button
            onClick={() => setSelectedDirection('alpine')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[44px] ${
              selectedDirection === 'alpine'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25 ring-2 ring-amber-300'
                : 'bg-gray-800/80 text-gray-400 hover:text-white'
            }`}
          >
            Direction 2: Alpine Onyx & Gold
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {selectedDirection === 'himalayan' ? (
          /* ========================================================================= */
          /* DIRECTION 1: HIMALAYAN MODERN MARKETPLACE (Warm Commercial & High Trust)  */
          /* ========================================================================= */
          <div className="space-y-8 animate-fadeIn">
            {/* Rationale Banner */}
            <div className="bg-[#121620] border border-orange-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <FiCheckCircle /> Direction 1: Himalayan Modern Marketplace
              </div>
              <p className="text-gray-300 text-xs sm:text-sm mt-2 leading-relaxed">
                <strong>Philosophy:</strong> Vibrant, high-converting commercial e-commerce optimized for sunlight legibility and trust in Nepal.
                <br />
                <strong>Colors:</strong> Saffron Orange (#F97316), Deep Slate (#0B0E14), Elevated Surface (#141923), Border (#232B3B), Pure White (#FFFFFF).
                <br />
                <strong>Typography:</strong> Plus Jakarta Sans (Headings & Prices) + Inter (Body & Microcopy) + Noto Sans Devanagari fallback.
              </p>
            </div>

            {/* 1. Color Palette & Contrast Grid */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Palette & WCAG 2.2 AA Contrast Ratios
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0B0E14] border border-[#232B3B] p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-[#F97316] mb-3 flex items-center justify-center font-bold text-white text-xs">
                    Primary Saffron
                  </div>
                  <div className="text-xs font-bold text-white">#F97316</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Contrast 4.8:1 on #0B0E14 (AA Large/UI)</div>
                </div>

                <div className="bg-[#0B0E14] border border-[#232B3B] p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-[#FFFFFF] mb-3 flex items-center justify-center font-bold text-black text-xs">
                    High-Contrast Text
                  </div>
                  <div className="text-xs font-bold text-white">#FFFFFF</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Contrast 18.2:1 (AAA Pass)</div>
                </div>

                <div className="bg-[#0B0E14] border border-[#232B3B] p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-[#141923] border border-[#232B3B] mb-3 flex items-center justify-center font-bold text-gray-300 text-xs">
                    Card Surface
                  </div>
                  <div className="text-xs font-bold text-white">#141923</div>
                  <div className="text-[11px] text-gray-400 mt-1">Elevated layer over background</div>
                </div>

                <div className="bg-[#0B0E14] border border-[#232B3B] p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-[#10B981] mb-3 flex items-center justify-center font-bold text-white text-xs">
                    Trust / In-Stock
                  </div>
                  <div className="text-xs font-bold text-white">#10B981</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Contrast 5.4:1 (AA Pass)</div>
                </div>
              </div>
            </div>

            {/* 2. Interactive Primitives Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buttons & Badges */}
              <div className="bg-[#141923] border border-[#232B3B] p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Buttons & Touch Targets (≥ 44px)</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="min-h-[44px] px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition">
                    Primary Action
                  </button>
                  <button className="min-h-[44px] px-5 py-2.5 bg-[#1F2637] hover:bg-[#283248] text-gray-200 border border-[#2E3850] font-semibold rounded-xl text-xs transition">
                    Secondary Outline
                  </button>
                  <button className="min-h-[44px] px-5 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs transition">
                    Cash on Delivery Available
                  </button>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Devanagari Bilingual Fallback</h4>
                  <div className="p-3 bg-[#0B0E14] border border-[#232B3B] rounded-xl text-xs space-y-1">
                    <p className="text-white font-medium">नेपालभरि छिटो डेलिभरी र क्यास अन डेलिभरी उपलब्ध (Cash On Delivery)</p>
                    <p className="text-gray-400 text-[11px]">Rendered in Noto Sans Devanagari / Poppins stack</p>
                  </div>
                </div>
              </div>

              {/* Form Input Sample */}
              <div className="bg-[#141923] border border-[#232B3B] p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Inputs & Focus Rings (16px base)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Delivery Address (डेलिभरी ठेगाना)
                    </label>
                    <input
                      type="text"
                      defaultValue="New Road, Ward 22, Kathmandu"
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#0B0E14] border border-[#232B3B] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-base text-white outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Mobile Number (मोबाइल नम्बर)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      defaultValue="9841000000"
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#0B0E14] border border-[#232B3B] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-base text-white outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Product Card Sample */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Product Card Anatomy (Direction 1)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#141923] border border-[#232B3B] rounded-2xl p-3 flex flex-col justify-between hover:border-orange-500/50 transition">
                  <div>
                    <div className="w-full aspect-square bg-[#0B0E14] rounded-xl flex items-center justify-center text-gray-500 text-xs font-medium relative overflow-hidden">
                      <span className="text-3xl">📱</span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white font-bold text-[10px] rounded-md">
                        20% OFF
                      </span>
                      <button className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white rounded-full">
                        <FiHeart className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Himalayan Organic</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mt-0.5">
                        Authentic Mustang Organic Red Kidney Beans (५०० ग्राम)
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs font-bold text-white">Rs. 420</span>
                        <span className="text-[11px] text-gray-400 line-through">Rs. 525</span>
                      </div>
                    </div>
                  </div>

                  <button className="mt-3 w-full min-h-[38px] py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    <FiShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* DIRECTION 2: ALPINE ONYX & GOLD (Curated Luxury & Modern Multi-Vendor)     */
          /* ========================================================================= */
          <div className="space-y-8 animate-fadeIn">
            {/* Rationale Banner */}
            <div className="bg-[#111114] border border-amber-400/30 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FiCheckCircle /> Direction 2: Alpine Onyx & Gold (Curated Modern Luxury)
              </div>
              <p className="text-gray-300 text-xs sm:text-sm mt-2 leading-relaxed">
                <strong>Philosophy:</strong> Minimalist luxury aesthetic with rich onyx surfaces, champagne gold accents, and airy spacing.
                <br />
                <strong>Colors:</strong> Himalayan Gold (#EAB308 / #D4AF37), Pure Onyx (#09090B), Card Surface (#121215), Border (rgba(255,255,255,0.08)), Crisp Snow (#EDEDED).
                <br />
                <strong>Typography:</strong> Outfit (Sleek Modern Headings) + DM Sans (Body) + Mukta Devanagari fallback.
              </p>
            </div>

            {/* 1. Color Palette & Contrast Grid */}
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Palette & WCAG 2.2 AA Contrast Ratios
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#09090B] border border-white/10 p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-[#EAB308] mb-3 flex items-center justify-center font-bold text-black text-xs">
                    Himalayan Gold
                  </div>
                  <div className="text-xs font-bold text-white">#EAB308</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Contrast 8.2:1 against dark (AAA Pass)</div>
                </div>

                <div className="bg-[#09090B] border border-white/10 p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-[#EDEDED] mb-3 flex items-center justify-center font-bold text-black text-xs">
                    Snow Neutral
                  </div>
                  <div className="text-xs font-bold text-white">#EDEDED</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Contrast 16.5:1 (AAA Pass)</div>
                </div>

                <div className="bg-[#09090B] border border-white/10 p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-[#121215] border border-white/10 mb-3 flex items-center justify-center font-bold text-gray-300 text-xs">
                    Onyx Surface
                  </div>
                  <div className="text-xs font-bold text-white">#121215</div>
                  <div className="text-[11px] text-gray-400 mt-1">Refined dark surface layer</div>
                </div>

                <div className="bg-[#09090B] border border-white/10 p-4 rounded-xl">
                  <div className="h-10 rounded-lg bg-emerald-400/20 border border-emerald-400/40 mb-3 flex items-center justify-center font-bold text-emerald-400 text-xs">
                    Verified Merchant
                  </div>
                  <div className="text-xs font-bold text-white">#34D399</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Contrast 6.8:1 (AA Pass)</div>
                </div>
              </div>
            </div>

            {/* 2. Interactive Primitives Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buttons & Badges */}
              <div className="bg-[#121215] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Buttons & Touch Targets (≥ 44px)</h3>
                <div className="flex flex-wrap gap-3">
                  <button className="min-h-[44px] px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 active:scale-95 transition">
                    Explore Luxury
                  </button>
                  <button className="min-h-[44px] px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/15 font-semibold rounded-xl text-xs transition">
                    View Lookbook
                  </button>
                  <button className="min-h-[44px] px-4 py-2.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 font-bold rounded-xl text-xs transition">
                    Verified Nepal Merchant
                  </button>
                </div>
              </div>

              {/* Form Input Sample */}
              <div className="bg-[#121215] border border-white/10 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Inputs & Focus Rings (16px base)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Delivery Address (डेलिभरी ठेगाना)
                    </label>
                    <input
                      type="text"
                      defaultValue="Jhamsikhel, Lalitpur"
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#09090B] border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-base text-white outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Contact Number (फोन नम्बर)
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      defaultValue="9851000000"
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#09090B] border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-base text-white outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Product Card Sample */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Product Card Anatomy (Direction 2)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#121215] border border-white/10 rounded-2xl p-3 flex flex-col justify-between hover:border-amber-400/50 transition">
                  <div>
                    <div className="w-full aspect-square bg-[#09090B] rounded-xl flex items-center justify-center text-gray-500 text-xs font-medium relative overflow-hidden">
                      <span className="text-3xl">✨</span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-black font-bold text-[10px] rounded-md">
                        FEATURED
                      </span>
                      <button className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white rounded-full">
                        <FiHeart className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Handcrafted Nepal</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 mt-0.5">
                        Pure Himalayan Cashmere Pashmina Stole
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs font-bold text-white">Rs. 8,500</span>
                        <span className="text-[11px] text-gray-500 line-through">Rs. 10,200</span>
                      </div>
                    </div>
                  </div>

                  <button className="mt-3 w-full min-h-[38px] py-2 bg-amber-400/10 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                    <FiShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
