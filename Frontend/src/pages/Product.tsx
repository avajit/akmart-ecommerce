import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductBySlug, addToCart } from '../api/consumer.api';
import { toast } from 'react-toastify';

export default function Product() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  
  useEffect(() => {
    if (slug) {
      getProductBySlug(slug).then((res: any) => {
        setProduct(res.data);
        if (res.data?.variants?.length > 0) {
          setSelectedVariantId(res.data.variants[0].id);
        }
      }).catch(() => toast.error("Product not found"));
    }
  }, [slug]);

  const handleAddToCart = async (listingId: string) => {
    try {
      await addToCart({ sellerListingId: listingId, variantId: selectedVariantId, quantity: 1 });
      toast.success("Added to cart!");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to add to cart. Are you logged in?");
    }
  };

  if (!product) return <div className="text-center py-20 text-white">Loading...</div>;

  const currentVariant = product.variants?.find((v: any) => v.id === selectedVariantId);
  const listings = currentVariant?.listings || [];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-1/2">
        <div className="w-full aspect-square bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center overflow-hidden">
           {currentVariant?.images?.[0]?.url ? (
             <img src={currentVariant.images[0].url} alt="" className="w-full h-full object-cover" />
           ) : <span className="text-gray-600">No Image</span>}
        </div>
      </div>
      <div className="w-full md:w-1/2 text-white">
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-gray-400 mb-6">{product.brand?.name} | {product.category?.name}</p>
        
        <p className="text-gray-300 mb-8">{product.description}</p>
        
        <div className="mb-8">
          <p className="font-medium text-gray-400 mb-3">Select Variant</p>
          <div className="flex gap-3">
            {product.variants?.map((v: any) => (
              <button 
                key={v.id} 
                onClick={() => setSelectedVariantId(v.id)}
                className={`px-4 py-2 rounded-lg border ${selectedVariantId === v.id ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-gray-700 text-gray-400 bg-gray-900'}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <button 
            onClick={async () => {
              try {
                await import('../api/consumer.api').then(m => m.addToWishlist(selectedVariantId));
                toast.success("Added to Wishlist! 💖");
              } catch (err: any) {
                toast.error(err.response?.data?.error?.message || "Failed to add to wishlist. Are you logged in?");
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors border border-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            Add to Wishlist
          </button>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <h3 className="font-bold text-xl mb-4">Sellers</h3>
          {listings.length === 0 ? (
            <p className="text-red-500">Currently out of stock from all sellers.</p>
          ) : (
            <div className="space-y-4">
              {listings.map((l: any) => (
                <div key={l.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-white">NPR {l.price}</p>
                    <p className="text-sm text-gray-400">Sold by: {l.sellerProfile?.shopName}</p>
                  </div>
                  <button onClick={() => handleAddToCart(l.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2 rounded-lg font-bold transition-colors">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
