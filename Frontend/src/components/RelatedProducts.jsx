import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const RelatedProducts = ({category, subCategory}) => {

    const { products } = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(()=>{
        if (products.length > 0) {
            let productsCopy = products.slice();
            
            // 1. Filter by same Category (Men/Women/Kids)
            productsCopy = productsCopy.filter((item) => category === item.category);
            
            // 2. Filter by same Type (Topwear/Bottomwear)
            productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);

            // 3. Take the top 5 results
            setRelated(productsCopy.slice(0,5)); 
        }
    },[products, category, subCategory])

  return (
    <div className='my-24'>
      {/* Title Section */}
      <div className='text-center text-3xl py-2'>
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>

      {/* Grid Display */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item,index)=>(
            <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image}/>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts