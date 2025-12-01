import React, { useState } from 'react'
import Title from '../components/Title'
import NewsletterBox from '../components/NewsletterBox'
import { assets, companyDetails } from "../assets/frontend_assets/assets"; 
import { toast } from 'react-toastify' // Import Toast

const Contact = () => {

  const [result, setResult] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    setTimeout(() => {
        setResult("");
        toast.success("Message Sent Successfully!");
        event.target.reset();
    }, 2000);
  };

  // --- NEW FUNCTION: Handle "Explore Jobs" Click ---
  const handleExploreJobs = () => {
    // Option 1: Show a message (Best for Portfolio/MVP)
    toast.info("We are currently fully staffed! Please check back later.");
    
    // Option 2: If you had a LinkedIn page, you would do this:
    // window.open("https://www.linkedin.com/company/akmart/jobs", "_blank");
  }

  return (
    <div className='border-t border-gray-700 pt-10'>
      
      <div className='text-center text-2xl pt-10 border-t border-gray-800'>
          <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-10 mb-28 max-w-6xl mx-auto px-4 sm:px-0'>
        
        <div className='flex flex-col justify-center items-start gap-6 md:w-1/2'>
            <img className='w-full md:max-w-[480px] rounded-lg shadow-lg opacity-90' src={assets.contact_img} alt="Store Location" />
            <div className='flex flex-col gap-4'>
                <h3 className='font-semibold text-xl text-gray-200'>Our Store</h3>
                <p className='text-gray-400 max-w-xs'>{companyDetails.address}</p>
                <p className='text-gray-400'>Tel: <span className='text-amber-500'>{companyDetails.phone}</span> <br /> Email: <span className='text-amber-500'>{companyDetails.email}</span></p>
                <h3 className='font-semibold text-xl text-gray-200 mt-4'>Careers at AkMart</h3>
                <p className='text-gray-400'>Learn more about our teams and job openings.</p>
                
                {/* --- ADDED ONCLICK EVENT HERE --- */}
                <button 
                    onClick={handleExploreJobs}
                    className='border border-gray-500 px-6 py-2 text-sm text-white hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-300 w-fit'
                >
                    Explore Jobs
                </button>

            </div>
        </div>

        <div className='md:w-1/2 bg-[#121212] p-8 rounded-xl shadow-2xl border border-gray-800'>
            <h3 className='text-2xl text-white font-semibold mb-6'>Get in Touch</h3>
            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-2'>
                    <label className='text-sm text-gray-400'>Name</label>
                    <input type="text" required className='bg-[#1A1A1A] border border-gray-700 text-white p-3 rounded outline-none focus:border-amber-500 transition-colors' placeholder='Enter your name' />
                </div>
                <div className='flex flex-col gap-2'>
                    <label className='text-sm text-gray-400'>Email</label>
                    <input type="email" required className='bg-[#1A1A1A] border border-gray-700 text-white p-3 rounded outline-none focus:border-amber-500 transition-colors' placeholder='Enter your email' />
                </div>
                <div className='flex flex-col gap-2'>
                    <label className='text-sm text-gray-400'>Message</label>
                    <textarea required rows='4' className='bg-[#1A1A1A] border border-gray-700 text-white p-3 rounded outline-none focus:border-amber-500 transition-colors resize-none' placeholder='How can we help you?'></textarea>
                </div>
                <button className='mt-4 bg-amber-500 text-black font-bold py-3 px-8 rounded hover:bg-white hover:text-black transition-all duration-300'>
                    {result ? result : "SEND MESSAGE"}
                </button>
            </form>
        </div>

      </div>

      <div className='my-20 px-4 sm:px-0 max-w-4xl mx-auto'>
          <h2 className='text-2xl text-white font-bold text-center mb-10'>Frequently Asked Questions</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-[#121212] p-6 rounded-lg border border-gray-800'>
                  <h4 className='text-amber-500 font-semibold mb-2'>How do I track my order?</h4>
                  <p className='text-gray-400 text-sm'>You can track your order by clicking on the tracking link sent to your email or in your profile order history.</p>
              </div>
              <div className='bg-[#121212] p-6 rounded-lg border border-gray-800'>
                  <h4 className='text-amber-500 font-semibold mb-2'>What is your return policy?</h4>
                  <p className='text-gray-400 text-sm'>We offer a 7-day hassle-free return policy. If you are not satisfied, you can return the product for a full refund.</p>
              </div>
          </div>
      </div>

      <NewsletterBox/>
    </div>
  )
}

export default Contact;