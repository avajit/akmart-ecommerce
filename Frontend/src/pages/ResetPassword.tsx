import React, { useState } from 'react';
import { useResetPassword, useForgotPassword } from '../hooks/useAuth';
import InputField from '../components/common/InputField';
import { useLocation, Navigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const location = useLocation();
  const identifier = location.state?.identifier;

  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();
  const { mutate: forgotPassword, isPending: isResending } = useForgotPassword();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // If no identifier was passed from the previous screen, send them back
  if (!identifier) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (token.length !== 6) {
      setError('Reset code must be exactly 6 digits');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    resetPassword({
      token,
      newPassword,
    });
  };

  const handleResend = () => {
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
              Secure your <br/><span className="text-amber-500">new password.</span>
            </h2>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed font-light">
              Make sure it's at least 8 characters long and something you haven't used recently.
            </p>
            
            <div className="mt-12 group inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl backdrop-blur-md shadow-lg border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-amber-500/10 hover:border-amber-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 group-hover:text-amber-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Side: Reset Form */}
        <div className="w-full md:w-1/2 p-10 sm:p-16 bg-white flex flex-col justify-center relative">
            
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <img src="/src/assets/logo.png" alt="AKK Logo" className="h-12 w-auto" />
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Reset Password
            </h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              We sent a 6-digit code to <span className="font-semibold text-slate-700">{identifier}</span>
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4 relative z-10">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <InputField
                label="6-Digit Reset Code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                error={error && token.length !== 6 ? error : ''}
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <InputField
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={error && newPassword.length < 8 ? error : ''}
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InputField
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={error && newPassword !== confirmPassword ? error : ''}
              />
            </div>

            <button
              type="submit"
              disabled={isResetting || isResending}
              className="mt-4 w-full bg-slate-900 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-none"
            >
              {isResetting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : "Didn't get the code? Resend"}
            </button>

            <Link to="/login" className="text-sm text-amber-500 hover:text-amber-600 font-semibold transition-colors">
              Back to Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
