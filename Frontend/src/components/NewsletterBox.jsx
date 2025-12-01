import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault();
    }

  return (
    <div className='text-center pb-20 pt-10 px-4 sm:px-0 bg-black'>
      <p className='text-2xl font-medium text-gray-200 uppercase tracking-wide'>
        Subscribe now & get <span className='text-amber-500 font-bold'>20% off</span>
      </p>
      <p className='text-gray-400 mt-3 text-sm sm:text-base'>
        Join our community to get the latest updates on new collections, exclusive deals, and styling tips.
      </p>

      {/* PRO CHANGE: Added 'focus-within:border-amber-500' 
          This makes the border glow Gold when user clicks inside. */}
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border border-gray-700 focus-within:border-amber-500 rounded-md overflow-hidden pl-3 bg-gray-900 transition-colors duration-300'>
        <input 
            className='w-full sm:flex-1 outline-none bg-transparent text-white placeholder-gray-500 py-3' 
            type="email" 
            placeholder='Enter your email' 
            required
        />
        <button type='submit' className='bg-amber-500 text-black font-bold text-xs px-10 py-4 uppercase hover:bg-amber-600 transition-transform active:scale-95 duration-200'>
            Subscribe
        </button>
      </form>
    </div>
  )
}

export default NewsletterBox