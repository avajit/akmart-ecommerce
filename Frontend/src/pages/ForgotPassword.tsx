import React, { useState } from 'react';
import { useForgotPassword } from '../hooks/useAuth';
import InputField from '../components/common/InputField';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Email or Phone is required');
      return;
    }
    setError('');

    const isEmail = identifier.includes('@');
    const payload = isEmail 
      ? { email: identifier } 
      : { phoneNumber: identifier };

    forgotPassword(payload);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12 px-4 font-[Poppins] selection:bg-amber-500 selection:text-white">
      
      {/* Main Card with Glassmorphism */}
      <div className="flex bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-100 w-full max-w-5xl overflow-hidden relative">
          
        {/* Left Side: Premium Navy Panel */}
        <div className="hidden md:flex w-1/2 p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-col justify-center relative overflow-hidden">
            
          {/* Decorative Deep Glows (Subtle) */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-slate-800 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-8 right-0 w-72 h-72 bg-slate-700 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

          <div className="relative z-10">
            <img src="/src/assets/logo.png" alt="AKK Logo" className="h-12 w-auto mb-16 filter brightness-0 invert opacity-90" />
            
            <h2 className="text-4xl font-extrabold mt-8 leading-tight tracking-tight text-white">
              Recover your <br/><span className="text-amber-500">account access.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed font-light">
              Don't worry, it happens to the best of us. Let's get you back into your AKK account seamlessly.
            </p>
            
            <div className="mt-12 group inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl backdrop-blur-md shadow-lg border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-amber-500/10 hover:border-amber-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 group-hover:text-amber-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side: Recovery Form */}
        <div className="w-full md:w-1/2 p-10 sm:p-16 bg-white flex flex-col justify-center relative">
            
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <img src="/src/assets/logo.png" alt="AKK Logo" className="h-12 w-auto" />
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Forgot Password
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              Enter your email or phone number to receive a 6-digit reset code.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5 relative z-10">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <InputField
                label="Email or Phone Number"
                type="text"
                placeholder="john@example.com or 9800000000"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                error={error}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 w-full bg-slate-900 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none"
            >
              {isPending ? 'Sending Code...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-8 text-center md:text-left">
            <p className="text-sm text-slate-500">
              Remember your password?{' '}
              <Link to="/login" className="text-amber-500 hover:text-amber-600 font-semibold transition-colors">
                Back to Login
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
