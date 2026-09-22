import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../api/consumer.api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<any>(null);

  const fetchWishlist = () => {
    getWishlist().then((res: any) => setWishlist(res.data)).catch(() => {});
  };

  useEffect(() => fetchWishlist(), []);

  const handleRemove = async (variantId: string) => {
    try {
      await removeFromWishlist(variantId);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch {
      toast.error("Failed to remove");
    }
  };

  if (!wishlist || !wishlist.items || wishlist.items.length === 0) {
    return <div className="text-center py-20 text-gray-400">Your wishlist is empty.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">My Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {wishlist.items.map((item: any) => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col relative group">
            <button onClick={() => handleRemove(item.variantId)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><FiTrash2 /></button>
            <Link to={`/product/${item.variant?.product?.slug}`} className="flex-1 cursor-pointer">
              <div className="w-full aspect-square bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                 {item.variant?.images?.[0]?.url ? (
                   <img src={item.variant.images[0].url} alt="" className="w-full h-full object-cover" />
                 ) : <span className="text-xs text-gray-600">No Img</span>}
              </div>
              <p className="text-white font-medium line-clamp-1">{item.variant?.product?.name}</p>
              <p className="text-gray-400 text-sm mb-2">{item.variant?.name}</p>
              <p className="text-emerald-500 font-bold">See latest price</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
