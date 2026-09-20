import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { toast } from 'react-toastify'; // 1. Import Toast

const Orders = () => {

  const { products, currency } = useContext(ShopContext);
  
  // Load initial data
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
        // Simulate fetching orders from database
        setOrderData(products.slice(1, 4));
    }
  }, [products]);

  // 2. TRACK ORDER FUNCTION (Simulates API Call)
  const handleTrackOrder = (index) => {
      // Show user something is happening
      toast.info("Checking delivery status...", { autoClose: 1000 });
      
      // Simulate network delay
      setTimeout(() => {
          toast.success(`Order #${index + 1240} is Ready to Ship!`);
      }, 1500);
  }

  return (
    <div className='border-t border-gray-700 pt-16 min-h-[60vh]'>
      
      <div className='text-2xl mb-8'>
          <Title text1={'MY'} text2={'ORDERS'}/>
      </div>

      <div className='flex flex-col gap-6'>
        {orderData.map((item, index) => (
          
          <div key={index} className='py-4 border-t border-b border-gray-700 text-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
             
             {/* Product Info */}
             <div className='flex items-start gap-6 text-sm'>
                 <img className='w-16 sm:w-20 object-cover rounded-lg border border-gray-700' src={item.image[0]} alt="" />
                 <div>
                     <p className='sm:text-base font-medium text-white'>{item.name}</p>
                     <div className='flex items-center gap-3 mt-1 text-base text-gray-400'>
                         <p className='text-lg text-amber-500 font-bold'>{currency}{item.price}</p>
                         <p>Quantity: 1</p>
                         <p>Size: M</p>
                     </div>
                     <p className='mt-1 text-gray-500'>Date: <span className='text-gray-300'>25 Jul, 2025</span></p>
                     <p className='text-gray-500'>Payment: <span className='text-gray-300'>COD</span></p>
                 </div>
             </div>

             {/* Status & Action */}
             <div className='md:w-1/2 flex justify-between items-center'>
                 
                 <div className='flex items-center gap-2'>
                     <p className='min-w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]'></p>
                     <p className='text-sm md:text-base text-gray-300'>Ready to ship</p>
                 </div>

                 {/* 3. BUTTON WITH CLICK EVENT */}
                 <button 
                    onClick={() => handleTrackOrder(index)}
                    className='border border-gray-600 px-6 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-[#1A1A1A] hover:text-amber-500 hover:border-amber-500 transition-all duration-300 active:scale-95'
                 >
                     Track Order
                 </button>
             </div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default Orders