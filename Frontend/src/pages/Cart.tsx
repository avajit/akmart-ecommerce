import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/frontend_assets/assets';
import { RiDeleteBin6Line } from "react-icons/ri";
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for(const items in cartItems){
          for(const item in cartItems[items]){
              if (cartItems[items][item] > 0) {
                  tempData.push({
                      _id: items,
                      size: item,
                      quantity: cartItems[items][item]
                  })
              }
          }
      }
      setCartData(tempData);
    }
  }, [cartItems, products])

  return (
    <div className='border-t border-gray-700 pt-14'>
      
      <div className='text-2xl mb-3'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);

            return (
                <div key={index} className='py-4 border-t border-b border-gray-700 text-gray-200 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                    
                    {/* Product Info */}
                    <div className='flex items-start gap-6'>
                        <img className='w-16 sm:w-20 rounded-md' src={productData.image[0]} alt="" />
                        <div>
                            <p className='text-sm sm:text-lg font-medium text-white'>{productData.name}</p>
                            <div className='flex items-center gap-5 mt-2'>
                                <p className='text-amber-500 font-bold'>{currency}{productData.price}</p>
                                <p className='px-2 sm:px-3 sm:py-1 border border-gray-600 bg-[#1A1A1A] rounded-sm text-xs'>{item.size}</p>
                            </div>
                        </div>
                    </div>

                    {/* 🔥 NEW PROFESSIONAL QUANTITY SELECTOR */}
                    {/* Replaces the ugly input box with custom buttons */}
                    <div className='flex items-center gap-2'>
                        {/* DECREASE BUTTON */}
                        <button 
                            onClick={() => {
                                // If qty is 1, decrementing makes it 0 (delete)
                                const newQty = item.quantity - 1;
                                updateQuantity(item._id, item.size, newQty);
                            }}
                            className='w-8 h-8 flex items-center justify-center border border-gray-700 bg-[#1A1A1A] hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all rounded'
                        >
                            -
                        </button>

                        {/* NUMBER DISPLAY */}
                        <span className='w-10 h-8 flex items-center justify-center border border-gray-700 bg-[#121212] text-white rounded text-sm font-medium'>
                            {item.quantity}
                        </span>

                        {/* INCREASE BUTTON */}
                        <button 
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                            className='w-8 h-8 flex items-center justify-center border border-gray-700 bg-[#1A1A1A] hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all rounded'
                        >
                            +
                        </button>
                    </div>

                    {/* DELETE ICON */}
                    <RiDeleteBin6Line 
                        onClick={()=> updateQuantity(item._id, item.size, 0)} 
                        className='w-5 h-5 cursor-pointer hover:text-red-500 transition-colors text-gray-400' 
                    />
                </div>
            )
        })}
      </div>

      {/* Checkout Section */}
      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
            <CartTotal />
            <div className='w-full text-end'>
                <button 
                    onClick={()=>navigate('/place-order')} 
                    className='bg-amber-500 text-black text-sm my-8 px-8 py-3 uppercase font-bold rounded hover:bg-white transition-all shadow-lg'
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
      </div>

    </div>
  )
}

export default Cart