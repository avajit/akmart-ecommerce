import React, { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeCartItem } from '../api/consumer.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = () => {
    getCart().then((res: any) => {
      setCart(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => fetchCart(), []);

  const handleUpdate = async (id: string, qty: number) => {
    if (qty < 1) return handleRemove(id);
    try {
      await updateCartItem(id, qty);
      fetchCart();
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to update quantity");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeCartItem(id);
      fetchCart();
    } catch (err: any) {
      toast.error("Failed to remove item");
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading Cart...</div>;
  if (!cart || !cart.items || cart.items.length === 0) return <div className="text-center py-20 text-gray-400">Your cart is empty.</div>;

  const total = cart.items.reduce((sum: number, item: any) => sum + (item.priceAtAddTime * item.quantity), 0);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex gap-6 items-center">
               <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                 {item.variant?.images?.[0]?.url ? (
                   <img src={item.variant.images[0].url} alt="" className="w-full h-full object-cover" />
                 ) : <span className="text-xs text-gray-600 flex items-center justify-center h-full">No Img</span>}
               </div>
               <div className="flex-1">
                 <p className="text-white font-bold text-lg">{item.variant?.product?.name}</p>
                 <p className="text-gray-400 text-sm">{item.variant?.name} | Sold by {item.sellerListing?.sellerProfile?.shopName}</p>
                 <p className="text-emerald-500 font-bold mt-1">NPR {item.priceAtAddTime}</p>
                 {item.sellerListing?.price !== item.priceAtAddTime && (
                    <p className="text-yellow-500 text-xs">Price changed from {item.sellerListing?.price}</p>
                 )}
                 {!item.isAvailable && <p className="text-red-500 text-xs mt-1">Item is no longer available.</p>}
                 {item.isAvailable && item.availableStock < item.quantity && (
                    <p className="text-red-500 text-xs mt-1">Only {item.availableStock} available.</p>
                 )}
               </div>
               <div className="flex items-center gap-4">
                 <div className="flex items-center bg-black border border-gray-700 rounded-lg">
                   <button onClick={() => handleUpdate(item.id, item.quantity - 1)} className="px-3 py-1 text-white hover:text-emerald-500">-</button>
                   <span className="text-white px-2">{item.quantity}</span>
                   <button onClick={() => handleUpdate(item.id, item.quantity + 1)} className="px-3 py-1 text-white hover:text-emerald-500">+</button>
                 </div>
                 <button onClick={() => handleRemove(item.id)} className="text-gray-500 hover:text-red-500 transition-colors"><FiTrash2 size={18} /></button>
               </div>
            </div>
          ))}
        </div>
        
        <div className="w-full lg:w-96">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-20">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            <div className="flex justify-between text-gray-400 mb-4">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>NPR {total}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg border-t border-gray-800 pt-4 mb-6">
              <span>Total</span>
              <span>NPR {total}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold py-3 rounded-lg hover:scale-[1.02] transition-transform">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
