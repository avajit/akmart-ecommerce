import React, { useState, useEffect } from 'react';
import { useVerifyOTP, useResendOTP } from '../hooks/useAuth';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../assets/frontend_assets/assets';
import { FiShield } from 'react-icons/fi';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
  const phoneNumber = location.state?.phoneNumber;
  const identifier = email || phoneNumber;

  const { mutate: verifyOTP, isPending } = useVerifyOTP();
  const { mutate: resendOTP, isPending: isResending } = useResendOTP();

  useEffect(() => {
    if (!identifier) {
      toast.warn('No pending verification found. Please sign in or register.');
      navigate('/login');
    }
  }, [identifier, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const onSubmitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    verifyOTP({ identifier, token: otp });
  };

  const handleResend = () => {
    if (timer > 0) return;
    const payload = email ? { email } : { phoneNumber };
    resendOTP(payload, {
      onSuccess: () => {
        setTimer(60);
      },
    });
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
              Secure your <br/><span className="text-orange-400">AkMart account.</span>
            </h2>
            <p className="mt-3 text-gray-400 text-xs sm:text-sm leading-relaxed">
              Two-factor security ensures your orders, payments, and account data remain completely protected.
            </p>
            <div className="mt-8 inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl border border-gray-800 text-orange-400">
              <FiShield className="h-5 w-5" />
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800/80 text-[11px] text-gray-500">
            AkMart Safe Commerce Standard
          </div>
        </div>

        {/* Right Side: Verification Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-left">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <Link to="/">
              <img src={assets.logo} alt="AkMart" className="h-9 w-auto object-contain filter invert" />
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verify Account
            </h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm leading-relaxed">
              We&apos;ve sent a 6-digit verification code to <br/>
              <span className="font-bold text-gray-200">{identifier}</span>
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4 text-left" noValidate>
            <div>
              <label htmlFor="otpCode" className="block text-gray-300 text-xs font-semibold uppercase tracking-wider mb-2">
                6-Digit Security Code
              </label>
              <input 
                id="otpCode"
                name="otp"
                type="text" 
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full p-3.5 text-center tracking-[0.5em] text-2xl font-extrabold bg-[#1A1A1A] border border-gray-800 rounded-xl text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all duration-200 placeholder:text-gray-600 placeholder:tracking-widest" 
                placeholder="••••••" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending || otp.length < 6}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 mt-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/25 transition-all duration-200 disabled:opacity-50 disabled:hover:bg-orange-500 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify & Activate Account</span>
              )}
            </button>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-3 gap-3 text-xs">
              <Link 
                to="/login"
                className="font-medium text-gray-400 hover:text-white transition-colors"
              >
                &larr; Back to Sign In
              </Link>
              
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || isResending}
                className="font-bold text-orange-400 hover:text-orange-300 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
