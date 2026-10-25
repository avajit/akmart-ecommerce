import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiExchangeLine, RiShieldCheckLine, RiHeadphoneLine } from "react-icons/ri";

const OurPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-around gap-10 sm:gap-2 text-center py-16 text-xs sm:text-sm md:text-base text-gray-400 font-poppins">
      
      {/* 1. EXCHANGE POLICY */}
      <div 
        onClick={() => { navigate('/refund'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
        className="group cursor-pointer p-4 rounded-2xl hover:bg-[#141414] transition-all duration-300"
      >
        <div className="mb-4 flex justify-center">
          <RiExchangeLine className="text-4xl sm:text-5xl text-white group-hover:text-orange-500 transition-colors duration-300" />
        </div>
        <p className="font-bold text-white group-hover:text-orange-400 transition-colors text-sm sm:text-base">
          Easy Exchange Policy
        </p>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">We offer hassle-free product exchanges</p>
      </div>

      {/* 2. RETURN POLICY */}
      <div 
        onClick={() => { navigate('/refund'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
        className="group cursor-pointer p-4 rounded-2xl hover:bg-[#141414] transition-all duration-300"
      >
        <div className="mb-4 flex justify-center">
          <RiShieldCheckLine className="text-4xl sm:text-5xl text-white group-hover:text-orange-500 transition-colors duration-300" />
        </div>
        <p className="font-bold text-white group-hover:text-orange-400 transition-colors text-sm sm:text-base">
          7 Days Return Policy
        </p>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Guaranteed free returns across Nepal</p>
      </div>

      {/* 3. CUSTOMER SUPPORT */}
      <div 
        onClick={() => { navigate('/contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
        className="group cursor-pointer p-4 rounded-2xl hover:bg-[#141414] transition-all duration-300"
      >
        <div className="mb-4 flex justify-center">
          <RiHeadphoneLine className="text-4xl sm:text-5xl text-white group-hover:text-orange-500 transition-colors duration-300" />
        </div>
        <p className="font-bold text-white group-hover:text-orange-400 transition-colors text-sm sm:text-base">
          Nepal Customer Support
        </p>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Active live support 7 days a week</p>
      </div>

    </div>
  );
};

export default OurPolicy;