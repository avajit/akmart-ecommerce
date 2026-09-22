import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import { authService } from '../api/auth.service';
import { toast } from 'react-toastify';

const Profile = () => {

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: "",
    image: assets.profile_icon, 
    email: "",
    phone: "",
    role: "",
  });

  const fetchProfile = async () => {
    try {
      const me = await authService.getMe();
      setUserData({
        name: me.fullName,
        image: me.avatarUrl || assets.profile_icon,
        email: me.email || "",
        phone: me.phoneNumber || "",
        role: me.role?.name || "User",
      });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await authService.updateMe({ fullName: userData.name });
      toast.success("Profile updated");
      setIsEdit(false);
      fetchProfile();
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div className='py-20 text-center text-white'>Loading profile...</div>;

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
              <p className='text-gray-500 font-bold uppercase tracking-widest text-sm'>{userData.role}</p>
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
                        <p className='text-white text-lg'>{userData.email || 'N/A'}</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <p className='text-xs text-gray-400 mb-1'>Phone Number</p>
                        <p className='text-white text-lg'>{userData.phone || 'N/A'}</p>
                    </div>
                 </div>
             </div>

          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className='mt-12 flex justify-center'>
            { isEdit ? (
                <button 
                    onClick={handleSave} 
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