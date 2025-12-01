import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div className='border-t border-gray-700 pt-8'>
      
      {/* --- ABOUT INTRO SECTION --- */}
      <div className='text-2xl text-center pt-8 mb-16'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          {/* Left Image */}
          <img 
            className='w-full md:max-w-[450px] rounded-lg shadow-lg' 
            src={assets.about_img} 
            alt="About AkMart" 
          />
          
          {/* Right Text Content */}
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-400 leading-7'>
              <p>
                AkMart was born out of a passion for innovation and a desire to revolutionize the way people shop online. Starting as a small team, we have grown into a global brand that customers trust.
              </p>
              <p>
                Since our inception, we have worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. From fashion and beauty to electronics and home essentials, our collection is handpicked for quality.
              </p>
              
              <div className='mt-4'>
                <b className='text-gray-200 text-lg block mb-2'>Our Mission</b>
                <p>
                  Our mission is to empower customers with choice, convenience, and confidence. We are dedicated to providing a seamless shopping experience that exceeds expectations, every single time.
                </p>
              </div>
          </div>
      </div>

      {/* --- WHY CHOOSE US SECTION --- */}
      <div className='text-xl py-10 mt-10'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20 gap-6'>
        
        {/* Box 1 */}
        <div className='border border-gray-700 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 rounded-lg hover:bg-[#1A1A1A] hover:border-amber-500 transition-all duration-300 cursor-default'>
          <b className='text-white text-base'>Quality Assurance:</b>
          <p className='text-gray-400'>
            We meticulously select and vet each product to ensure it meets our stringent quality standards.
          </p>
        </div>

        {/* Box 2 */}
        <div className='border border-gray-700 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 rounded-lg hover:bg-[#1A1A1A] hover:border-amber-500 transition-all duration-300 cursor-default'>
          <b className='text-white text-base'>Convenience:</b>
          <p className='text-gray-400'>
            With our user-friendly interface and hassle-free checkout process, shopping has never been easier.
          </p>
        </div>

        {/* Box 3 */}
        <div className='border border-gray-700 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 rounded-lg hover:bg-[#1A1A1A] hover:border-amber-500 transition-all duration-300 cursor-default'>
          <b className='text-white text-base'>Exceptional Service:</b>
          <p className='text-gray-400'>
            Our team of dedicated professionals is here to assist you every step of the way, ensuring your satisfaction is our top priority.
          </p>
        </div>

      </div>
      
      {/* --- NEWSLETTER --- */}
      <NewsletterBox/>
      
    </div>
  )
}

export default About