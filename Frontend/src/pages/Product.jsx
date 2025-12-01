import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/frontend_assets/assets'
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {

  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  const fetchProductData = async () => {
    products.map((item) => {
        if (item._id === productId) {
            setProductData(item);
            setImage(item.image[0]);
            return null;
        }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  return productData ? (
    <div className='border-t-2 border-gray-800 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      
      {/* --- PRODUCT DATA --- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/* --- LEFT: IMAGES --- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
                {productData.image.map((item, index) => (
                    <img 
                        onClick={() => setImage(item)} 
                        src={item} 
                        key={index} 
                        className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer rounded-md border border-gray-700 hover:border-amber-500 transition-all opacity-80 hover:opacity-100' 
                        alt="" 
                    />
                ))}
            </div>
            <div className='w-full sm:w-[80%]'>
                <img className='w-full h-auto rounded-lg border border-gray-800 bg-[#1a1a1a]' src={image} alt="" />
            </div>
        </div>

        {/* --- RIGHT: PRODUCT DETAILS --- */}
        <div className='flex-1'>
            <h1 className='font-medium text-2xl mt-2 text-white tracking-wide'>{productData.name}</h1>
            
            <div className='flex items-center gap-1 mt-2 text-amber-500'>
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_icon} alt="" className="w-3.5" />
                <img src={assets.star_dull_icon} alt="" className="w-3.5" />
                <p className='pl-2 text-gray-400 text-sm'>(122)</p>
            </div>

            <p className='mt-5 text-3xl font-medium text-amber-500'>{currency}{productData.price}</p>
            <p className='mt-5 text-gray-400 md:w-4/5 leading-7 font-light'>{productData.description}</p>

            <div className='flex flex-col gap-4 my-8'>
                <p className='text-gray-200 font-medium text-sm uppercase tracking-wide'>Select Size</p>
                <div className='flex gap-2'>
                    {productData.sizes.map((item, index) => (
                        <button 
                            onClick={() => setSize(item)}
                            className={`py-2 px-4 bg-[#1A1A1A] border text-sm font-medium rounded transition-all duration-300
                            ${item === size ? 'border-amber-500 text-amber-500 bg-[#252525]' : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`} 
                            key={index}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🔥 ADD TO CART BUTTON IS NOW ACTIVE */}
            <button 
                onClick={() => addToCart(productData._id, size)} 
                className='bg-amber-500 text-black px-8 py-3 text-sm font-bold uppercase rounded hover:bg-amber-600 active:scale-95 transition-all shadow-lg hover:shadow-amber-500/20'
            >
                Add to Cart
            </button>

            <hr className='mt-8 sm:w-4/5 border-gray-700' />

            <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1 font-light'>
                <p>100% Original product.</p>
                <p>Cash on delivery is available on this product.</p>
                <p>Easy return and exchange policy within 7 days.</p>
            </div>
        </div>
      </div>

      {/* --- DESCRIPTION & REVIEW SECTION --- */}
      <div className='mt-20'>
        <div className='flex'>
            <b className='border border-gray-700 px-5 py-3 text-sm text-white border-b-0 cursor-pointer'>Description</b>
            <p className='border border-gray-700 border-l-0 px-5 py-3 text-sm text-gray-500 border-b-0 cursor-pointer hover:text-white transition-colors'>Reviews (122)</p>
        </div>
        <div className='flex flex-col gap-4 border border-gray-700 px-6 py-6 text-sm text-gray-400 leading-6 bg-[#121212] rounded-b-lg rounded-tr-lg'>
            <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence.</p>
            <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>
      </div>

      {/* --- RELATED PRODUCTS --- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <div className='opacity-0'></div>
}

export default Product