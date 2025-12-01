import React from 'react'
import { useNavigate } from 'react-router-dom'
// Import professional icons from 'react-icons'
import { RiExchangeLine, RiShieldCheckLine, RiHeadphoneLine } from "react-icons/ri";

const OurPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-400">
      
      {/* 1. EXCHANGE POLICY */}
      <div className="group cursor-pointer">
        <div className="mb-5 flex justify-center">
            {/* Professional Vector Icon */}
            <RiExchangeLine className="text-5xl text-white group-hover:text-amber-500 transition-colors duration-300" />
        </div>
        <p className="font-semibold text-white group-hover:text-amber-500 transition-colors">
            Easy Exchange Policy
        </p>
        <p className="text-gray-400">We offer hassle free exchange policy</p>
      </div>

      {/* 2. RETURN POLICY */}
      <div onClick={()=> navigate('/refund')} className="group cursor-pointer">
        <div className="mb-5 flex justify-center">
             <RiShieldCheckLine className="text-5xl text-white group-hover:text-amber-500 transition-colors duration-300" />
        </div>
        <p className="font-semibold text-white group-hover:text-amber-500 transition-colors">
            7 Days Return Policy
        </p>
        <p className="text-gray-400">We provide 7 days free return policy</p>
      </div>

      {/* 3. CUSTOMER SUPPORT */}
      <div onClick={()=> navigate('/contact')} className="group cursor-pointer">
        <div className="mb-5 flex justify-center">
            <RiHeadphoneLine className="text-5xl text-white group-hover:text-amber-500 transition-colors duration-300" />
        </div>
        <p className="font-semibold text-white group-hover:text-amber-500 transition-colors">
            Best Customer Support
        </p>
        <p className="text-gray-400">We provide 24/7 customer support</p>
      </div>

    </div>
  )
}

export default OurPolicy