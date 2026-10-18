import React, { useState } from 'react';
import { useForgotPassword } from '../hooks/useAuth';
import InputField from '../components/common/InputField';
import { Link } from 'react-router-dom';
import { assets } from '../assets/frontend_assets/assets';
import { FiMail, FiLock } from 'react-icons/fi';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please enter your email or mobile number');
      return;
    }
    setError('');

    const isPhone = /^\d{10}$/.test(identifier);
    const payload = isPhone ? { phoneNumber: identifier } : { email: identifier };

    forgotPassword(payload);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-6 px-4 font-sans selection:bg-orange-500 selection:text-white">
      <div className="flex bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden text-white">
          
        {/* Left Side: Brand Panel */}
        <div className="hidden md:flex w-5/12 p-8 sm:p-10 bg-[#0F0F0F] border-r border-gray-800/80 flex-col justify-between">
          <div>
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <img src={assets.logo} alt="AkMart" className="h-10 w-auto object-contain filter invert" />
            </Link>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-8 leading-tight tracking-tight text-white">
              Recover your <br/><span className="text-orange-400">account access.</span>
            </h2>
            <p className="mt-3 text-gray-400 text-xs sm:text-sm leading-relaxed">
              Don&apos;t worry, it happens to the best of us. Let&apos;s get you back into your AkMart account securely.
            </p>
            
            <div className="mt-8 inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl border border-gray-800 text-orange-400">
              <FiLock className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800/80 text-[11px] text-gray-500">
            AkMart Security & Account Recovery
          </div>
        </div>

        {/* Right Side: Recovery Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <Link to="/">
              <img src={assets.logo} alt="AkMart" className="h-9 w-auto object-contain filter invert" />
            </Link>
          </div>

          <div className="text-left mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Forgot Password
            </h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">
              Enter your registered email or mobile number to receive a 6-digit reset code.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left" autoComplete="off" noValidate>
            <InputField
              id="identifier"
              name="recovery_identifier"
              label="Email Address or Mobile Number"
              type="text"
              placeholder="name@example.com or 98XXXXXXXX"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (error) setError('');
              }}
              error={error}
              startIcon={<FiMail className="w-4 h-4" />}
              autoComplete="off"
              required
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 mt-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/25 transition-all duration-200 disabled:opacity-60 disabled:hover:bg-orange-500 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Sending Code...</span>
                </>
              ) : (
                <span>Send Reset Code</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Remembered your password?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold hover:underline transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
