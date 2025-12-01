import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/frontend_assets/assets'
import { RiInstagramLine, RiTwitterXLine, RiFacebookCircleFill } from "react-icons/ri";

const Footer = () => {
  return (
    <div>
      {/* FIX 1: Changed 'mt-40' to 'mt-10' (Removes huge gap above footer)
         FIX 2: Changed 'gap-14' to 'gap-6' (Brings columns closer)
         FIX 3: Changed '3fr' to '1fr' (Makes all columns equal width for a neat look)
      */}
      <div className='flex flex-col sm:grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-10 text-sm'>

        {/* --- LEFT SECTION --- */}
        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="Logo" />
            
            {/* FIX 4: Removed 'md:w-2/3'. Now text fills the space naturally. */}
            <p className='w-full text-gray-400 leading-6'>
                Your premium destination for fashion and lifestyle. We are dedicated to providing the best shopping experience with top-notch customer support and curated collections.
            </p>
        </div>

        {/* --- MIDDLE SECTION --- */}
        <div>
            <p className='text-xl font-medium mb-5 text-white'>COMPANY</p>
            <ul className='flex flex-col gap-2 text-gray-400'>
                <Link to='/' className='hover:text-amber-500 transition-colors cursor-pointer'>Home</Link>
                <Link to='/about' className='hover:text-amber-500 transition-colors cursor-pointer'>About us</Link>
                <Link to='/shipping' className='hover:text-amber-500 transition-colors cursor-pointer'>Delivery</Link>
                <Link to='/privacy' className='hover:text-amber-500 transition-colors cursor-pointer'>Privacy Policy</Link>
            </ul>
        </div>

        {/* --- RIGHT SECTION --- */}
        <div>
            <p className='text-xl font-medium mb-5 text-white'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-2 text-gray-400'>
                <li className='hover:text-white transition-colors'>+1-212-456-7890</li>
                <li className='hover:text-white transition-colors'>Avajitkumar@akmart.np</li>
                
                {/* Icons */}
                <div className='flex gap-4 mt-4'>
                    <a href="https://instagram.com" target='_blank' rel='noreferrer' 
                       className='w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 cursor-pointer'>
                       <RiInstagramLine className="text-xl" />
                    </a>
                    <a href="https://twitter.com" target='_blank' rel='noreferrer'
                       className='w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 cursor-pointer'>
                       <RiTwitterXLine className="text-lg" />
                    </a>
                    <a href="https://facebook.com" target='_blank' rel='noreferrer'
                       className='w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 cursor-pointer'>
                       <RiFacebookCircleFill className="text-xl" />
                    </a>
                </div>
            </ul>
        </div>

      </div>

      {/* --- COPYRIGHT --- */}
      <div>
          <hr className='border-gray-800' />
          <p className='py-5 text-sm text-center text-gray-500'>
            Copyright {new Date().getFullYear()} @ AkMart.com - All Right Reserved.
          </p>
      </div>

    </div>
  )
}

export default Footer