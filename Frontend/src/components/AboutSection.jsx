import React from 'react'
import { assets } from '../assets/frontend_assets/assets'
import Title from './Title'
import { useNavigate } from 'react-router-dom'

const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <div className='my-20 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      
      {/* Title */}
      <div className='text-center py-8 text-3xl'>
        <Title text1={'THE'} text2={'AKMART STORY'} />
      </div>

      {/* Content */}
      <div className='flex flex-col md:flex-row items-center gap-10 md:gap-16'>
        
        {/* Left Side: Image */}
        <div className='w-full md:w-1/2'>
            <img 
                src={assets.about_img} 
                className='w-full h-auto object-cover rounded-lg shadow-xl hover:scale-105 transition-transform duration-500' 
                alt="About AkMart" 
            />
        </div>

        {/* Right Side: Text & Button */}
        <div className='w-full md:w-1/2 flex flex-col items-start gap-6 text-gray-400'>
            <p className='leading-7 text-base'>
                AkMart isn't just a store; it's a reflection of style, quality, and innovation. 
                We started with a simple idea: to make premium fashion accessible to everyone. 
                Today, we stand as a beacon of trust and trendsetting designs.
            </p>
            <p className='leading-7 text-base'>
                From our curated collections to our customer-first policies, everything we do is driven by passion. 
                Join us on this journey and redefine your style.
            </p>

            {/* Link to Full Page */}
            <button 
                onClick={() => { navigate('/about'); window.scrollTo(0,0); }}
                className='bg-amber-500 text-black px-8 py-3 text-sm font-bold uppercase rounded hover:bg-white hover:text-black transition-all duration-300'
            >
                Read More
            </button>
        </div>

      </div>
    </div>
  )
}

export default AboutSection