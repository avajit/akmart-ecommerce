import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import { assets } from '../assets/frontend_assets/assets';
import { authService } from '../api/auth.service';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiShield, FiCheckCircle, FiCalendar, FiEdit2, FiSave, FiX } from 'react-icons/fi';

const Profile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    roleDescription: '',
    isEmailVerified: false,
    isPhoneVerified: false,
    createdAt: '',
    avatarUrl: '',
  });

  const fetchProfile = async () => {
    try {
      const me = await authService.getMe();
      setUserData({
        fullName: me.fullName || '',
        email: me.email || '',
        phoneNumber: me.phoneNumber || '',
        role: me.role?.name || 'CONSUMER',
        roleDescription: me.role?.description || 'Standard customer account',
        isEmailVerified: !!me.isEmailVerified,
        isPhoneVerified: !!me.isPhoneVerified,
        createdAt: me.createdAt ? new Date(me.createdAt).toLocaleDateString() : 'N/A',
        avatarUrl: me.avatarUrl || '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!userData.fullName.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await authService.updateMe({
        fullName: userData.fullName.trim(),
        phoneNumber: userData.phoneNumber.trim() || null,
        avatarUrl: userData.avatarUrl.trim() || null,
      });
      toast.success('Profile updated successfully!');
      setIsEdit(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='py-28 text-center text-gray-400 text-lg flex items-center justify-center gap-3'>
        <div className='w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin'></div>
        Loading your profile...
      </div>
    );
  }

  return (
    <div className='border-t border-gray-800 pt-6 sm:pt-10 pb-28 md:pb-16 px-4 sm:px-6 max-w-4xl mx-auto'>
      
      {/* --- TITLE HEADER --- */}
      <div className='text-2xl mb-8 text-center sm:text-left'>
        <Title text1={'ACCOUNT'} text2={'SETTINGS'} />
      </div>

      {/* --- PROFILE CARD CONTAINER --- */}
      <div className='bg-[#141414] border border-gray-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden'>
        
        {/* Top Header Banner */}
        <div className='flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-800'>
          <div className='flex items-center gap-5'>
            <div className='relative'>
              <img 
                src={userData.avatarUrl || assets.profile_icon} 
                alt="Profile Avatar" 
                className='w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-orange-500/30 shadow-lg'
              />
              <span className='absolute bottom-0 right-0 bg-orange-500 text-white p-1 rounded-full text-xs shadow'>
                <FiShield className='w-3.5 h-3.5' />
              </span>
            </div>

            <div>
              <h2 className='text-2xl font-bold text-white capitalize'>
                {userData.fullName || 'Valued User'}
              </h2>
              <p className='text-orange-400 text-xs font-semibold tracking-wider uppercase mt-1 flex items-center gap-1.5'>
                <span>{userData.role}</span>
                <span className='text-gray-500'>•</span>
                <span className='text-gray-400 font-normal'>{userData.roleDescription}</span>
              </p>
              <p className='text-gray-500 text-xs mt-1 flex items-center gap-1'>
                <FiCalendar className='w-3.5 h-3.5' /> Member since {userData.createdAt}
              </p>
            </div>
          </div>

          <div>
            {!isEdit ? (
              <button 
                onClick={() => setIsEdit(true)}
                className='flex items-center gap-2 bg-[#222222] hover:bg-orange-500 hover:text-white text-gray-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm border border-gray-700'
              >
                <FiEdit2 className='w-4 h-4' /> Edit Profile
              </button>
            ) : (
              <div className='flex items-center gap-3'>
                <button 
                  onClick={() => setIsEdit(false)}
                  disabled={saving}
                  className='flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors'
                >
                  <FiX className='w-4 h-4' /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className='flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-orange-500/20'
                >
                  <FiSave className='w-4 h-4' /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- INFORMATION FORM / DISPLAY --- */}
        <div className='pt-8 grid grid-cols-1 md:grid-cols-2 gap-8'>
          
          {/* Full Name */}
          <div className='space-y-2'>
            <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5'>
              <FiUser className='text-orange-500 w-3.5 h-3.5' /> Full Name
            </label>
            {isEdit ? (
              <input 
                type="text" 
                value={userData.fullName}
                onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                className='w-full bg-[#1F1F1F] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors'
                placeholder="Enter your full name"
              />
            ) : (
              <p className='text-white text-base bg-[#1A1A1A] border border-gray-800/80 rounded-xl px-4 py-3'>
                {userData.fullName || 'Not provided'}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className='space-y-2'>
            <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between'>
              <span className='flex items-center gap-1.5'>
                <FiMail className='text-orange-500 w-3.5 h-3.5' /> Email Address
              </span>
              {userData.isEmailVerified && (
                <span className='text-green-400 text-[11px] flex items-center gap-1 font-normal'>
                  <FiCheckCircle className='w-3 h-3' /> Verified
                </span>
              )}
            </label>
            <input 
              type="email" 
              disabled={true}
              value={userData.email}
              className='w-full bg-[#1A1A1A]/60 border border-gray-800 rounded-xl px-4 py-3 text-gray-400 text-sm cursor-not-allowed select-none'
            />
            <p className='text-[11px] text-gray-500 pl-1'>Email cannot be changed directly for security reasons.</p>
          </div>

          {/* Phone Number */}
          <div className='space-y-2'>
            <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between'>
              <span className='flex items-center gap-1.5'>
                <FiPhone className='text-orange-500 w-3.5 h-3.5' /> Phone Number
              </span>
              {userData.isPhoneVerified && (
                <span className='text-green-400 text-[11px] flex items-center gap-1 font-normal'>
                  <FiCheckCircle className='w-3 h-3' /> Verified
                </span>
              )}
            </label>
            {isEdit ? (
              <input 
                type="text" 
                value={userData.phoneNumber}
                onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})}
                className='w-full bg-[#1F1F1F] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors'
                placeholder="Enter phone number"
              />
            ) : (
              <p className='text-white text-base bg-[#1A1A1A] border border-gray-800/80 rounded-xl px-4 py-3'>
                {userData.phoneNumber || 'Not provided'}
              </p>
            )}
          </div>

          {/* Avatar URL / Profile Picture */}
          {isEdit && (
            <div className='space-y-2'>
              <label className='text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5'>
                <FiUser className='text-orange-500 w-3.5 h-3.5' /> Avatar Image URL
              </label>
              <input 
                type="text" 
                value={userData.avatarUrl}
                onChange={(e) => setUserData({...userData, avatarUrl: e.target.value})}
                className='w-full bg-[#1F1F1F] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors'
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Profile;
