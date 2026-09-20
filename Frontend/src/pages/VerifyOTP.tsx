import React, { useState, useEffect } from 'react';
import { useVerifyOTP, useResendOTP } from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: verifyOTP, isPending } = useVerifyOTP();
  const { mutate: resendOTP, isPending: isResending } = useResendOTP();
  
  const [timer, setTimer] = useState(60);
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('No email found. Please login or register.');
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (timer > 0 || isResending) return;
    resendOTP(email);
    setTimer(60);
  };

  const onSubmitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) {
      toast.error("OTP must be exactly 6 digits.");
      return;
    }
    
    verifyOTP({ identifier: email, token: otp });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12 px-4 font-[Poppins] selection:bg-amber-500 selection:text-white">
        
        {/* Main Card with Glassmorphism */}
        <div className="flex bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-100 w-full max-w-5xl overflow-hidden relative">
            
            {/* Left Side: Premium Navy Panel (Consistent with Login) */}
            <div className="hidden md:flex w-1/2 p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-72 h-72 bg-slate-800 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-8 right-0 w-72 h-72 bg-slate-700 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative z-10">
                    <img src="/src/assets/logo.png" alt="AKK Logo" className="h-12 w-auto mb-16 filter brightness-0 invert opacity-90" />
                    <h2 className="text-4xl font-extrabold mt-8 leading-tight tracking-tight text-white">
                        Secure your <br/><span className="text-amber-500">account.</span>
                    </h2>
                    <p className="mt-6 text-lg text-slate-300 leading-relaxed font-light">
                        We use strict security measures to ensure your data and identity remain safe.
                    </p>
                </div>
            </div>

            {/* Right Side: Verification Form */}
            <div className="w-full md:w-1/2 p-10 sm:p-16 bg-white flex flex-col justify-center relative">
                
                <div className="md:hidden flex justify-center mb-8">
                    <img src="/src/assets/logo.png" alt="AKK Logo" className="h-12 w-auto" />
                </div>

                <div className="text-center md:text-left mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Verify Account
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium leading-relaxed">
                        We've sent a 6-digit one-time password to <br/>
                        <span className="font-bold text-slate-900">{email}</span>
                    </p>
                </div>

                <form onSubmit={onSubmitHandler} className="flex flex-col gap-6 relative z-10">
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <label className="block text-slate-700 text-sm font-semibold mb-1.5 transition-colors">
                            Verification Code
                        </label>
                        <input 
                            type="text" 
                            maxLength={6}
                            className="w-full p-4 text-center tracking-[0.75em] text-3xl font-extrabold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm placeholder-slate-300" 
                            placeholder="••••••" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numbers only
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full bg-slate-900 text-white py-4 mt-2 rounded-xl text-lg font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        {isPending ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="flex flex-col sm:flex-row justify-between items-center mt-2 animate-in fade-in slide-in-from-bottom-5 duration-500 gap-4">
                        <p 
                            className="text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-900 transition-colors inline-block border-b border-transparent hover:border-slate-900"
                            onClick={() => navigate('/login')}
                        >
                            &larr; Back to Login
                        </p>
                        
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={timer > 0 || isResending}
                            className="text-sm font-bold text-amber-600 cursor-pointer hover:text-amber-700 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                            {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default VerifyOTP;
