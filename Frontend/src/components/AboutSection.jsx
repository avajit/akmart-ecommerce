import React from 'react';
import { assets } from '../assets/frontend_assets/assets';
import Title from './Title';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <div className="my-20 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] font-poppins">
      
      {/* Title */}
      <div className="text-center py-6 text-3xl">
        <Title text1="THE" text2="AKMART STORY" />
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2">
          <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl group">
            <img 
              src={assets.about_img || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop"} 
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" 
              alt="About AkMart" 
            />
          </div>
        </div>

        {/* Right Side: Text & Button */}
        <div className="w-full md:w-1/2 flex flex-col items-start gap-5 text-gray-300">
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Connecting Nepali Shoppers & Verified Local Merchants
          </h3>
          <p className="leading-relaxed text-sm sm:text-base text-gray-400">
            AkMart isn&apos;t just an e-commerce platform; it&apos;s a digital hub for reliable, authentic products across Nepal. We bridge the gap between verified sellers and discerning consumers with guaranteed market rates and transparent fulfillment.
          </p>
          <p className="leading-relaxed text-sm sm:text-base text-gray-400">
            From electronics and fashion to home essentials, everything we list adheres to stringent quality standards, supported by 7-day returns and responsive local support.
          </p>

          {/* Link to Full Page */}
          <button 
            onClick={() => { navigate('/about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.99]"
          >
            <span>Read Our Full Story</span>
            <FiArrowRight />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AboutSection;