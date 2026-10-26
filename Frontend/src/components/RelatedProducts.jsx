import React, { useEffect, useState } from 'react'
import Title from './Title';
import ProductItem from './ProductItem';
import { browseProducts } from '../api/consumer.api';

const RelatedProducts = ({category, subCategory}) => {
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        if (category) {
            // Fetch products in the same category
            // Our backend accepts category slug. Assuming `category` prop is the slug.
            browseProducts({ category, limit: 5 }).then((res) => {
                setRelated(res?.data?.products || []);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [category, subCategory])

  return (
    <div className='my-24'>
      {/* Title Section */}
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading related products...</div>
      ) : related.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No related products found.</div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {related.map((item,index)=>(
              <ProductItem 
                  key={item.id || index} 
                  slug={item.slug} 
                  name={item.name} 
                  price={item.cheapestPrice ?? 0} 
                  image={item.primaryImage}
                  variantId={item.variants?.[0]?.id}
              />
          ))}
        </div>
      )}
    </div>
  )
}

export default RelatedProducts