import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import PaymentMethod from '../components/PaymentMethod'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/frontend_assets/assets' // Ensure you have a checkmark icon or similar if needed

const PlaceOrder = () => {

  const { navigate, setCartItems } = useContext(ShopContext);
  const [method, setMethod] = useState('cod');
  
  // 1. New State to track if order is done
  const [orderPlaced, setOrderPlaced] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    
    // 2. Instead of navigating, we set the state to TRUE
    setOrderPlaced(true);
    
    // Optional: Clear the cart since they bought the items
    // setCartItems({}); 
  }

  // 3. IF ORDER IS PLACED, SHOW SUCCESS SCREEN INSTEAD OF FORM
  if (orderPlaced) {
    return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-center py-20 px-4'>
            {/* Success Icon */}
            <div className='w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30'>
                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            
            <h2 className='text-3xl font-bold text-white mb-2'>Order Placed Successfully!</h2>
            <p className='text-gray-400 mb-8'>Thank you for shopping with AkMart.</p>
            
            <div className='flex gap-4'>
                <button 
                    onClick={() => navigate('/')}
                    className='border border-gray-600 px-8 py-3 text-sm text-gray-300 rounded hover:bg-white hover:text-black transition-all'
                >
                    Continue Shopping
                </button>
                <button 
                    onClick={() => navigate('/orders')}
                    className='bg-amber-500 text-black px-8 py-3 text-sm font-bold rounded hover:bg-white transition-all'
                >
                    Track Order
                </button>
            </div>
        </div>
    )
  }

  return (
    // 4. NORMAL FORM (Shows if orderPlaced is false)
    <form onSubmit={onSubmitHandler} className='flex flex-col md:flex-row justify-between gap-10 pt-10 min-h-[80vh] border-t border-gray-700 max-w-6xl mx-auto px-4 sm:px-0'>
      
      {/* ---------------- LEFT: FORM ---------------- */}
      <div className='flex flex-col gap-6 w-full md:max-w-[480px]'>
        <div className='text-2xl my-3'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
            <input required name='firstName' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="text" placeholder='First name' />
            <input required name='lastName' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="text" placeholder='Last name' />
        </div>
        <input required name='email' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="email" placeholder='Email address' />
        <input required name='street' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="text" placeholder='Street Address' />
        <div className='flex gap-3'>
            <input required name='city' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="text" placeholder='City' />
            <input required name='state' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="text" placeholder='State' />
        </div>
        <div className='flex gap-3'>
            <input required name='zipcode' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="number" placeholder='Zipcode' />
            <input required name='country' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="text" placeholder='Country' />
        </div>
        <input required name='phone' className='border border-gray-700 rounded-lg py-2.5 px-3.5 w-full bg-[#1A1A1A] text-white outline-none focus:border-amber-500 transition-all' type="number" placeholder='Phone Number' />
      </div>

      {/* ---------------- RIGHT: TOTALS & PAYMENT ---------------- */}
      <div className='mt-8 md:mt-0 w-full md:max-w-[400px]'>
        <div className='mt-4 min-w-80'>
            <CartTotal />
        </div>
        <div className='mt-12'>
            <PaymentMethod method={method} setMethod={setMethod} />
            <div className='w-full text-end mt-8'>
                <button 
                    type='submit' 
                    className='bg-amber-500 text-black px-12 py-3.5 text-sm font-bold uppercase rounded-lg hover:bg-white hover:shadow-xl transition-all duration-300 w-full md:w-auto'
                >
                    Place Order
                </button>
            </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder