import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/frontend_assets/assets';
import { RiInstagramLine, RiTwitterXLine, RiFacebookCircleFill } from "react-icons/ri";

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-gray-800 text-sm text-gray-400 font-poppins pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-7xl mx-auto">
        {/* MAIN FOOTER COLUMNS */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10 mb-12'>

          {/* --- LEFT SECTION: LOGO & ABOUT --- */}
          <div className="md:col-span-2">
              <img src={assets.logo} className='mb-5 w-32 object-contain' alt="AkMart Logo" />
              <p className='text-gray-400 leading-relaxed max-w-md'>
                  Your premium destination for fashion and lifestyle. We are dedicated to providing the best shopping experience with top-notch customer support and curated collections.
              </p>
          </div>

          {/* --- MIDDLE SECTION: COMPANY --- */}
          <div>
              <p className='text-xs font-bold tracking-widest text-white uppercase mb-5'>Company</p>
              <ul className='flex flex-col gap-2.5'>
                  <li><Link to='/' className='hover:text-orange-500 transition-colors'>Home</Link></li>
                  <li><Link to='/collection' className='hover:text-orange-500 transition-colors'>Collection</Link></li>
                  <li><Link to='/about' className='hover:text-orange-500 transition-colors'>About us</Link></li>
                  <li><Link to='/privacy' className='hover:text-orange-500 transition-colors'>Privacy Policy</Link></li>
              </ul>
          </div>

          {/* --- RIGHT SECTION: GET IN TOUCH --- */}
          <div>
              <p className='text-xs font-bold tracking-widest text-white uppercase mb-5'>Get in Touch</p>
              <ul className='flex flex-col gap-2.5'>
                  <li className='text-white font-medium'>+1-212-456-7890</li>
                  <li className='text-white font-medium'>support@akmart.com</li>
                  
                  {/* Social Icons */}
                  <div className='flex gap-3 mt-3'>
                      <a href="https://instagram.com" target='_blank' rel='noreferrer' 
                         aria-label="Instagram"
                         className='w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300'>
                         <RiInstagramLine className="text-base" />
                      </a>
                      <a href="https://twitter.com" target='_blank' rel='noreferrer'
                         aria-label="Twitter"
                         className='w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300'>
                         <RiTwitterXLine className="text-sm" />
                      </a>
                      <a href="https://facebook.com" target='_blank' rel='noreferrer'
                         aria-label="Facebook"
                         className='w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300'>
                         <RiFacebookCircleFill className="text-base" />
                      </a>
                  </div>
              </ul>
          </div>

        </div>

        {/* --- COPYRIGHT --- */}
        <div className='border-t border-gray-800/80 pt-6 text-center text-xs text-gray-500'>
            <p>Copyright {new Date().getFullYear()} © AkMart.com - All Rights Reserved.</p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
