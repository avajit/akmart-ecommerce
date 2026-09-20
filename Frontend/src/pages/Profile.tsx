import React, { useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'

const Profile = () => {

  const [isEdit, setIsEdit] = useState(false);

  const [userData, setUserData] = useState({
    name: "Avajit Kumar",
    image: assets.profile_icon, 
    email: "avajitkumar@akmart.np",
    phone: "+1 123 456 7890",
    address: {
        line1: "54709 Willms Station",
        line2: "Washington, USA"
    },
    gender: 'Male',
    dob: '2000-01-20'
  });

  return (
    <div className='border-t border-gray-700 pt-10 mb-20'>
      
      {/* --- PAGE HEADER --- */}
      <div className='text-2xl mb-8'>
          <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      {/* --- PROFILE CARD --- */}
      <div className='max-w-3xl mx-auto bg-[#121212] rounded-2xl p-8 md:p-12 border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)]'>
          
          {/* --- TOP SECTION: AVATAR & NAME --- */}
          <div className='flex flex-col items-center gap-6 mb-10'>
              {/* Avatar with Premium Glow */}
              <div className='relative group'>
                { isEdit ? (
                    <>
                        <img className='w-32 h-32 rounded-full object-cover border-4 border-gray-800 opacity-50' src={userData.image} alt="" />
                        <div className='absolute inset-0 flex items-center justify-center cursor-pointer'>
                            <p className='text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm'>Upload</p>
                        </div>
                    </>
                ) : (
                    <img className='w-32 h-32 rounded-full object-cover border-4 border-amber-500/20 shadow-xl shadow-amber-500/10' src={userData.image} alt="" />
                )}
              </div>

              {/* Name Display / Edit */}
              { isEdit ? (
                <input 
                    className='bg-[#1A1A1A] border border-gray-700 text-white text-center text-2xl font-medium px-4 py-2 rounded-lg outline-none focus:border-amber-500 transition-colors w-full max-w-sm' 
                    type="text" 
                    value={userData.name} 
                    onChange={e => setUserData(prev => ({...prev, name: e.target.value}))}
                />
              ) : (
                <h2 className='text-3xl font-medium text-white tracking-wide'>{userData.name}</h2>
              )}
          </div>

          <hr className='border-gray-800 mb-10' />

          {/* --- DETAILS GRID --- */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8'>
             
             {/* 1. CONTACT INFO */}
             <div>
                 <p className='text-gray-500 uppercase tracking-widest text-xs font-bold mb-6 border-b border-gray-800 pb-2'>Contact Information</p>
                 <div className='flex flex-col gap-5'>
                    
                    {/* Email */}
                    <div>
                        <p className='text-xs text-gray-400 mb-1'>Email Address</p>
                        <p className='text-white text-lg'>{userData.email}</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <p className='text-xs text-gray-400 mb-1'>Phone Number</p>
                        { isEdit ? (
                            <input 
                                className='w-full bg-[#1A1A1A] border border-gray-700 text-white px-3 py-2 rounded outline-none focus:border-amber-500' 
                                type="text" 
                                value={userData.phone} 
                                onChange={e => setUserData(prev => ({...prev, phone: e.target.value}))}
                            />
                        ) : (
                            <p className='text-amber-500'>{userData.phone}</p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <p className='text-xs text-gray-400 mb-1'>Address</p>
                        { isEdit ? (
                            <div className='flex flex-col gap-2'>
                                <input 
                                    className='w-full bg-[#1A1A1A] border border-gray-700 text-white px-3 py-2 rounded outline-none focus:border-amber-500' 
                                    onChange={e => setUserData(prev => ({...prev, address: {...prev.address, line1: e.target.value}}))} 
                                    value={userData.address.line1} 
                                    type="text" 
                                />
                                <input 
                                    className='w-full bg-[#1A1A1A] border border-gray-700 text-white px-3 py-2 rounded outline-none focus:border-amber-500' 
                                    onChange={e => setUserData(prev => ({...prev, address: {...prev.address, line2: e.target.value}}))} 
                                    value={userData.address.line2} 
                                    type="text" 
                                />
                            </div>
                        ) : (
                            <p className='text-gray-300 leading-relaxed'>
                                {userData.address.line1} <br /> {userData.address.line2}
                            </p>
                        )}
                    </div>

                 </div>
             </div>

             {/* 2. BASIC INFO */}
             <div>
                 <p className='text-gray-500 uppercase tracking-widest text-xs font-bold mb-6 border-b border-gray-800 pb-2'>Basic Information</p>
                 <div className='flex flex-col gap-5'>
                    
                    {/* Gender */}
                    <div>
                        <p className='text-xs text-gray-400 mb-1'>Gender</p>
                        { isEdit ? (
                            <select 
                                className='w-full bg-[#1A1A1A] border border-gray-700 text-white px-3 py-2 rounded outline-none focus:border-amber-500' 
                                onChange={(e) => setUserData(prev => ({...prev, gender: e.target.value}))} 
                                value={userData.gender}
                            >
                               <option value="Male">Male</option>
                               <option value="Female">Female</option>
                            </select>
                        ) : (
                            <p className='text-gray-300'>{userData.gender}</p>
                        )}
                    </div>

                    {/* Birthday */}
                    <div>
                        <p className='text-xs text-gray-400 mb-1'>Birthday</p>
                        { isEdit ? (
                            <input 
                                className='w-full bg-[#1A1A1A] border border-gray-700 text-white px-3 py-2 rounded outline-none focus:border-amber-500' 
                                type="date" 
                                onChange={(e) => setUserData(prev => ({...prev, dob: e.target.value}))} 
                                value={userData.dob}
                            />
                        ) : (
                            <p className='text-gray-300'>{userData.dob}</p>
                        )}
                    </div>

                 </div>
             </div>

          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className='mt-12 flex justify-center'>
            { isEdit ? (
                <button 
                    onClick={()=> setIsEdit(false)} 
                    className='bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-all shadow-lg'
                >
                    Save Information
                </button>
            ) : (
                <button 
                    onClick={()=> setIsEdit(true)} 
                    className='bg-amber-500 text-black px-10 py-3 rounded-full font-bold hover:bg-amber-600 transition-all shadow-lg hover:shadow-amber-500/20'
                >
                    Edit Profile
                </button>
            )}
          </div>

      </div>
    </div>
  )
}

export default Profile