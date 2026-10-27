import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { RiInstagramLine, RiTwitterXLine, RiFacebookCircleFill } from "react-icons/ri";
import { FiShield, FiTruck, FiCreditCard, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-gray-800 text-sm text-gray-400 font-poppins pt-16 pb-28 md:pb-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-7xl mx-auto">
        {/* MAIN FOOTER COLUMNS */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10 mb-12'>

          {/* --- LEFT SECTION: LOGO & ABOUT --- */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <BrandLogo size="lg" />
            </div>
            <p className='text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md'>
              AkMart is Nepal's premier multi-vendor e-commerce marketplace delivering authentic groceries, tech, apparel, and lifestyle essentials across all 7 provinces with guaranteed low prices.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-300">
              <span className="flex items-center gap-1.5 text-[11px] bg-[#141414] px-2.5 py-1 rounded-lg border border-gray-800">
                <FiShield className="text-orange-400" /> 100% Genuine Products
              </span>
              <span className="flex items-center gap-1.5 text-[11px] bg-[#141414] px-2.5 py-1 rounded-lg border border-gray-800">
                <FiTruck className="text-orange-400" /> Nationwide Delivery
              </span>
              <span className="flex items-center gap-1.5 text-[11px] bg-[#141414] px-2.5 py-1 rounded-lg border border-gray-800">
                <FiCreditCard className="text-orange-400" /> COD, eSewa & Khalti
              </span>
            </div>
          </div>

          <div>
            <p className='text-xs font-bold tracking-widest text-white uppercase mb-4'>Marketplace</p>
            <ul className='flex flex-col gap-2.5 text-xs sm:text-sm'>
              <li><Link to='/' className='hover:text-orange-400 transition-colors'>Home</Link></li>
              <li><Link to='/collection' className='hover:text-orange-400 transition-colors'>All Collections</Link></li>
              <li><Link to='/about' className='hover:text-orange-400 transition-colors'>About AkMart</Link></li>
              <li><Link to='/shipping' className='hover:text-orange-400 transition-colors'>Shipping & Delivery</Link></li>
              <li><Link to='/refund' className='hover:text-orange-400 transition-colors'>7-Day Returns Policy</Link></li>
              <li><Link to='/privacy' className='hover:text-orange-400 transition-colors'>Privacy Policy</Link></li>
              <li><Link to='/terms' className='hover:text-orange-400 transition-colors'>Terms of Service</Link></li>
              <li><Link to='/contact' className='hover:text-orange-400 transition-colors'>Contact Support</Link></li>
              <li><Link to='/orders' className='hover:text-orange-400 transition-colors'>Order Tracking</Link></li>
              <li><Link to='/seller/onboarding' className='hover:text-orange-400 transition-colors text-orange-400 font-semibold'>Sell on AkMart</Link></li>
            </ul>
          </div>

          {/* --- RIGHT SECTION: CONTACT & LOCAL SUPPORT --- */}
          <div>
            <p className='text-xs font-bold tracking-widest text-white uppercase mb-4'>Nepal Customer Support</p>
            <ul className='flex flex-col gap-2.5 text-xs text-gray-300'>
              <li className='flex items-center gap-2'>
                <FiMapPin className="text-orange-400 shrink-0" />
                <span>Kathmandu, Bagmati Province, Nepal</span>
              </li>
              <li className='flex items-center gap-2'>
                <FiPhone className="text-orange-400 shrink-0" />
                <span className="font-mono">+977-9801234567 (WhatsApp / Support)</span>
              </li>
              <li className='flex items-center gap-2'>
                <FiMail className="text-orange-400 shrink-0" />
                <span>support@akmart.com.np</span>
              </li>
              
              {/* Social Icons */}
              <div className='flex gap-3 pt-2'>
                <a 
                  href="https://instagram.com" 
                  target='_blank' 
                  rel='noreferrer' 
                  aria-label="Instagram"
                  className='w-8 h-8 rounded-full bg-[#141414] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-orange-500 transition-all'
                >
                  <RiInstagramLine className="text-sm" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target='_blank' 
                  rel='noreferrer'
                  aria-label="Twitter"
                  className='w-8 h-8 rounded-full bg-[#141414] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-orange-500 transition-all'
                >
                  <RiTwitterXLine className="text-xs" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target='_blank' 
                  rel='noreferrer'
                  aria-label="Facebook"
                  className='w-8 h-8 rounded-full bg-[#141414] border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-orange-500 transition-all'
                >
                  <RiFacebookCircleFill className="text-sm" />
                </a>
              </div>
            </ul>
          </div>

        </div>

        {/* --- PAYMENT CHANNELS & COPYRIGHT --- */}
        <div className='border-t border-gray-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500'>
          <p>© {new Date().getFullYear()} AkMart Nepal Hub Inc. All rights reserved.</p>

          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="px-2 py-0.5 rounded bg-[#141414] border border-gray-800 font-semibold text-green-400">Cash on Delivery</span>
            <span className="px-2 py-0.5 rounded bg-[#141414] border border-gray-800 font-semibold text-emerald-400">eSewa Wallet</span>
            <span className="px-2 py-0.5 rounded bg-[#141414] border border-gray-800 font-semibold text-purple-400">Khalti Wallet</span>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
