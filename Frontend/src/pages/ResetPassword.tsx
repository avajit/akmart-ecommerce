import React, { useState } from 'react';
import { useResetPassword, useForgotPassword } from '../hooks/useAuth';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import InputField from '../components/common/InputField';
import { assets } from '../assets/frontend_assets/assets';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const identifier = location.state?.identifier || '';

  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();
  const { mutate: forgotPassword, isPending: isResending } = useForgotPassword();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || token.length !== 6) {
      setError('Please enter the 6-digit reset code');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');

    const isPhone = /^\d{10}$/.test(identifier);
    const payload = isPhone 
      ? { phoneNumber: identifier, token, newPassword }
      : { email: identifier, token, newPassword };

    resetPassword(payload);
  };

  const handleResend = () => {
    if (!identifier) return;
    const isPhone = /^\d{10}$/.test(identifier);
    const payload = isPhone 
      ? { phoneNumber: identifier }
      : { email: identifier };

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
              Secure your <br/><span className="text-orange-400">new password.</span>
            </h2>
            <p className="mt-3 text-gray-400 text-xs sm:text-sm leading-relaxed">
              Make sure your password is at least 8 characters long and contains letters, numbers, and symbols.
            </p>
            
            <div className="mt-8 inline-flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl border border-gray-800 text-orange-400">
              <FiCheckCircle className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800/80 text-[11px] text-gray-500">
            AkMart Safe Password Standard
          </div>
        </div>

        {/* Right Side: Reset Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-left">
            
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <Link to="/">
              <img src={assets.logo} alt="AkMart" className="h-9 w-auto object-contain filter invert" />
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Reset Password
            </h1>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">
              We sent a 6-digit code to <span className="font-semibold text-gray-200">{identifier || 'your account'}</span>
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left" autoComplete="off" noValidate>
            <InputField
              id="resetCode"
              name="token"
              label="6-Digit Reset Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={token}
              onChange={(e) => {
                setToken(e.target.value.replace(/\D/g, ''));
                if (error) setError('');
              }}
              error={error && token.length !== 6 ? error : ''}
              inputMode="numeric"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                id="newPassword"
                name="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 chars"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                error={error && newPassword.length < 8 ? error : ''}
                startIcon={<FiLock className="w-4 h-4" />}
                endAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-200 focus:outline-none p-1"
                  >
                    {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  </button>
                }
                required
              />

              <InputField
                id="confirmNewPassword"
                name="confirmNewPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                error={error && newPassword !== confirmPassword ? error : ''}
                startIcon={<FiLock className="w-4 h-4" />}
                endAction={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-200 focus:outline-none p-1"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  </button>
                }
                required
              />
            </div>

            <button
              type="submit"
              disabled={isResetting || isResending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 mt-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/25 transition-all duration-200 disabled:opacity-60 disabled:hover:bg-orange-500 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
            <button 
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : "Didn't get the code? Resend"}
            </button>

            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold hover:underline transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
