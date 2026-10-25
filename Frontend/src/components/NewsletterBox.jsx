import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiCheck } from 'react-icons/fi';

const NewsletterBox = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (!email) return;
    toast.success("🎉 Thank you for subscribing! Check your inbox for your 20% discount voucher.");
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="text-center pb-16 pt-10 px-4 sm:px-6 font-poppins">
      <div className="max-w-2xl mx-auto bg-[#141414] border border-gray-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
          <FiMail className="w-6 h-6" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
          Subscribe & Get <span className="text-orange-500">20% Off</span>
        </h3>
        <p className="text-gray-400 mt-2 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Join Nepal&apos;s fastest growing shopping community for weekly flash sales, coupon codes, and new arrival alerts.
        </p>

        {subscribed ? (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
            <FiCheck className="w-4 h-4" />
            <span>You&apos;re subscribed! Welcome to AkMart VIP.</span>
          </div>
        ) : (
          <form 
            onSubmit={onSubmitHandler} 
            className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto mt-6"
          >
            <input 
              className="w-full sm:flex-1 bg-black border border-gray-800 focus:border-orange-500 text-white placeholder-gray-500 text-xs sm:text-sm px-4 py-3.5 rounded-xl outline-none transition-colors" 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-7 py-3.5 uppercase tracking-wider rounded-xl transition shadow-lg shadow-orange-500/20 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewsletterBox;