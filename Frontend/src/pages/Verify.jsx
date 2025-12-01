import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const Verify = () => {

  // This logic handles the callback from Stripe/Razorpay
  const { navigate, token, setTasks, backendUrl } = useContext(ShopContext)
  const [searchParams, setSearchParams] = useSearchParams()

  const success = searchParams.get('success')
  const orderId = searchParams.get('orderId')

  const verifyPayment = async () => {
    try {
      if (!token) {
        return null
      }
      
      const response = await axios.post(
        backendUrl + '/api/order/verifyStripe', 
        { success, orderId }, 
        { headers: { token } }
      )

      if (response.data.success) {
        setTasks([]) // Clear cart
        navigate('/orders')
      } else {
        navigate('/cart')
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
      navigate('/')
    }
  }

  useEffect(() => {
    verifyPayment()
  }, [token])

  return (
    // Simple loader UI while verifying
    <div className='min-h-[60vh] grid place-items-center'>
        <div className='w-20 h-20 border-4 border-gray-400 border-t-amber-500 rounded-full animate-spin'></div>
    </div>
  )
}

export default Verify