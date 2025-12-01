import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from "../assets/frontend_assets/assets";
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import { RiArrowDropRightLine } from "react-icons/ri";

const Collection = () => {

  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');

  // --- FILTER LOGIC: CATEGORY ---
  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
        setCategory(prev => prev.filter(item => item !== e.target.value))
    }
    else{
      setCategory(prev => [...prev,e.target.value])
    }
  }

  // --- FILTER LOGIC: TYPE ---
  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory(prev => prev.filter(item => item !== e.target.value))
    }
    else{
      setSubCategory(prev => [...prev,e.target.value])
    }
  }

  // --- MAIN FILTER FUNCTION ---
  const applyFilter = () => {
    let productsCopy = products.slice();

    // 1. Search Filter
    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    // 2. Category Filter
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }

    // 3. SubCategory Filter
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy)
  }

  // --- SORT FUNCTION ---
  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price - b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price - a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }

  // --- EFFECT HOOKS ---
  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products])

  useEffect(() => {
    sortProduct();
  }, [sortType])

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t border-gray-800 items-start'>
      
      {/* --- LEFT SIDEBAR (FILTERS) --- */}
      {/* Sticky makes it stay visible while scrolling */}
      <div className='min-w-60 sticky top-20'>
        
        {/* Mobile Toggle Button */}
        <p onClick={()=>setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 text-white uppercase font-medium'>
            Filters
            <RiArrowDropRightLine className={`sm:hidden text-2xl transition-transform ${showFilter ? 'rotate-90' : ''}`}/>
        </p>
        
        {/* Filter 1: CATEGORY */}
        {/* Clean Design: No box, just clean lines and typography */}
        <div className={`border-b border-gray-800 py-6 mt-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-xs font-bold text-gray-200 uppercase tracking-widest'>Categories</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-400'>
            {['Men', 'Women', 'Kids'].map((cat) => (
               <label key={cat} className='flex gap-3 items-center cursor-pointer hover:text-amber-500 transition-colors'>
                 <input className='w-3 h-3 accent-amber-500 bg-gray-800 border-gray-600 rounded' type="checkbox" value={cat} onChange={toggleCategory}/> 
                 {cat}
               </label>
            ))}
          </div>
        </div>

        {/* Filter 2: TYPE */}
        <div className={`border-b border-gray-800 py-6 ${showFilter ? '' :'hidden'} sm:block`}>
          <p className='mb-3 text-xs font-bold text-gray-200 uppercase tracking-widest'>Type</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-400'>
             {['Topwear', 'Bottomwear', 'Winterwear'].map((type) => (
               <label key={type} className='flex gap-3 items-center cursor-pointer hover:text-amber-500 transition-colors'>
                 <input className='w-3 h-3 accent-amber-500 bg-gray-800 border-gray-600 rounded' type="checkbox" value={type} onChange={toggleSubCategory}/> 
                 {type}
               </label>
            ))}
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE (PRODUCT GRID) --- */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTIONS'} />
            
            {/* Sort Dropdown */}
            <select onChange={(e)=>setSortType(e.target.value)} className='border border-gray-800 bg-black text-sm px-4 py-2 text-gray-300 outline-none focus:border-amber-500 transition-colors cursor-pointer'>
              <option value="relavent">Sort by: Relevant</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
        </div>

        {/* Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item,index)=>(
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.image}/>
            ))
          }
        </div>
      </div>

    </div>
  )
}

export default Collection