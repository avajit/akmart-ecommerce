import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  RiWhatsappFill, 
  RiMessage3Fill, 
  RiCustomerService2Fill,
  RiPhoneFill
} from 'react-icons/ri';
import { FiX, FiCheck } from 'react-icons/fi';

export default function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const location = useLocation();

  // Suppress floating widget on focused auth & checkout flows to prevent blocking CTAs and form links
  const suppressedRoutes = ['/login', '/register', '/verify', '/forgot-password', '/reset-password', '/checkout'];
  if (suppressedRoutes.includes(location.pathname)) {
    return null;
  }

  const SUPPORT_PHONE = "9779801234567";
  const WHATSAPP_URL = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent("Namaste AKMart Nepal! I have an inquiry regarding a product / order.")}`;
  const VIBER_URL = `viber://chat?number=%2B${SUPPORT_PHONE}`;

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-8 right-3 md:right-8 z-30 font-poppins print:hidden">
      
      {/* ── Expandable Chat Options Menu ── */}
      {isOpen && (
        <div className="mb-3 w-64 bg-[#141414] border border-gray-800 rounded-3xl p-4 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Nepal Support Online</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition"
              aria-label="Close contact drawer"
            >
              <FiX size={14} />
            </button>
          </div>

          <p className="text-[11px] text-gray-400 leading-relaxed">
            Connect directly with an AKMart support specialist in Kathmandu (Sunday – Friday, 9AM – 8PM NPT):
          </p>

          <div className="space-y-2 pt-1">
            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 text-white text-xs font-semibold transition group"
            >
              <span className="w-8 h-8 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#25D366]/30">
                <RiWhatsappFill size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">Chat on WhatsApp</p>
                <p className="text-[10px] text-emerald-400">Instant Reply &bull; Free</p>
              </div>
            </a>

            {/* Viber */}
            <a
              href={VIBER_URL}
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#7360F2]/10 border border-[#7360F2]/30 hover:bg-[#7360F2]/20 text-white text-xs font-semibold transition group"
            >
              <span className="w-8 h-8 rounded-xl bg-[#7360F2] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#7360F2]/30">
                <RiMessage3Fill size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">Message on Viber</p>
                <p className="text-[10px] text-purple-300">Nepal Hotline</p>
              </div>
            </a>

            {/* Direct Call */}
            <a
              href="tel:+97714567890"
              className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#1A1A1A] border border-gray-800 hover:bg-gray-800 text-white text-xs font-semibold transition"
            >
              <span className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/30">
                <RiPhoneFill size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white">Direct Phone Call</p>
                <p className="text-[10px] text-gray-400">+977 1-4567890</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* ── Main Trigger Button ── */}
      <div className="relative flex items-center gap-2">
        {/* Subtle Tooltip on initial load */}
        {showTooltip && !isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] border border-gray-800 shadow-xl text-xs text-gray-300 animate-in fade-in duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-medium">Need help? Chat with us</span>
            <button
              onClick={() => setShowTooltip(false)}
              className="ml-1 text-gray-500 hover:text-white"
              aria-label="Dismiss tooltip"
            >
              <FiX size={12} />
            </button>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen 
              ? 'bg-gray-800 hover:bg-gray-700 text-white rotate-90' 
              : 'bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30 hover:scale-105 ring-4 ring-orange-500/10'
          }`}
          aria-label="Open customer support chat"
          title="AKMart Support Hotline"
        >
          {isOpen ? (
            <FiX className="w-6 h-6" />
          ) : (
            <RiCustomerService2Fill className="w-6 h-6 sm:w-7 sm:h-7" />
          )}
        </button>
      </div>

    </div>
  );
}
