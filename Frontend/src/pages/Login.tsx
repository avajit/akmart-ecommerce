import React, { useState, useEffect } from 'react';
import { useLogin, useRegister, useGoogleSSO } from '../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import InputField from '../components/common/InputField';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiShoppingBag, FiBriefcase, FiTruck, FiShield, FiCreditCard } from 'react-icons/fi';
import { assets } from '../assets/frontend_assets/assets';

const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [tab, setTab] = useState<'login' | 'register'>(
    location.pathname === '/register' ? 'register' : 'login'
  );

  // If already authenticated, forward user to their intended destination or dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autologin = params.get('autologin');
    if (autologin) return; // Allow autologin to switch user session

    if (isAuthenticated) {
      const role = (user?.roleName || (user as any)?.role?.name || user?.role || '').toUpperCase();
      const intended = (location.state as any)?.from || new URLSearchParams(location.search).get('redirect') || undefined;
      if (intended && typeof intended === 'string' && !intended.startsWith('/login') && !intended.startsWith('/register') && !intended.startsWith('/verify')) {
        navigate(intended, { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'SELLER') {
        navigate('/seller/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, location, navigate]);

  useEffect(() => {
    if (location.pathname === '/register' && tab !== 'register') {
      setTab('register');
    } else if (location.pathname === '/login' && tab !== 'login') {
      setTab('login');
    }
  }, [location.pathname, tab]);

  // Seamless tab switch without re-mounting or jarring jumps
  const switchTab = (newTab: 'login' | 'register') => {
    if (newTab === tab) return;
    setErrors({});
    navigate(`${newTab === 'register' ? '/register' : '/login'}${location.search}`, { replace: true });
  };

  // Form State
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'CONSUMER' | 'SELLER'>(
    new URLSearchParams(location.search).get('role')?.toUpperCase() === 'SELLER' ? 'SELLER' : 'CONSUMER'
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UX visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordActive, setIsPasswordActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const { mutate: googleSSO, isPending: isGooglePending } = useGoogleSSO();

  // Auto-login query parameter for instant developer / QA role switching
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const autologin = params.get('autologin');
    if (autologin === 'seller') {
      login({ email: 'seller@techmart.com', password: 'Seller@123' });
    } else if (autologin === 'admin') {
      login({ email: 'admin@akmart.com', password: 'Admin@123' });
    } else if (autologin === 'consumer') {
      login({ email: 'consumer@akmart.com', password: 'Consumer@123' });
    }
  }, [location.search, login]);

  const isSubmitting = isLoginPending || isRegisterPending;

  const isPhoneNumber = (val: string) => {
    const cleaned = val.replace(/[\s-]/g, '');
    return /^(\+?977)?[9][678]\d{8}$/.test(cleaned) || /^\d{10}$/.test(cleaned);
  };

  const parseIdentifier = (value: string) => {
    const trimmed = value.trim();
    if (isPhoneNumber(trimmed)) {
      const digitsOnly = trimmed.replace(/\D/g, '').slice(-10);
      return { phoneNumber: digitsOnly };
    }
    return { email: trimmed.toLowerCase() };
  };

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-700' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-400' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-400' };
      default:
        return { score: 10, label: 'Very Weak', color: 'bg-red-500' };
    }
  };

  const pwdStrength = calculatePasswordStrength(password);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (tab === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        newErrors.name = 'Full name must be at least 2 characters';
      }
    }

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or mobile number is required';
    } else {
      const isPhone = isPhoneNumber(identifier);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
      if (!isPhone && !isEmail) {
        newErrors.identifier = 'Enter a valid email or 10-digit mobile number';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (tab === 'register' && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (tab === 'register') {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!agreedToTerms) {
        newErrors.terms = 'Please accept Terms & Privacy Policy';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const parsedId = parseIdentifier(identifier);

    if (tab === 'login') {
      login({ ...parsedId, password });
    } else {
      register({
        fullName: name.trim(),
        ...parsedId,
        password,
        role,
      });
    }
  };

  const handleGoogleSSO = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      googleSSO(tokenResponse.access_token);
    },
    onError: () => {
      toast.error('Google Sign-In was cancelled or failed.');
    },
    flow: 'implicit',
  });

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-6 px-4 font-sans selection:bg-orange-500 selection:text-white">
      {/* 2-Column Split Card with consistent height and stable layout */}
      <div className="flex bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden text-white">
        
        {/* Left Side: Brand Panel */}
        <div className="hidden md:flex w-5/12 p-8 sm:p-10 bg-[#0F0F0F] border-r border-gray-800/80 flex-col justify-between">
          <div>
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <img
                src={assets.logo}
                alt="AkMart"
                className="h-10 w-auto object-contain filter invert"
              />
            </Link>

            <h2 className="text-2xl sm:text-3xl font-extrabold mt-8 leading-tight tracking-tight text-white">
              Elevate your <br />
              <span className="text-orange-400">commerce experience.</span>
            </h2>
            <p className="mt-3 text-gray-400 text-xs sm:text-sm leading-relaxed">
              Connect with Nepal&apos;s trusted digital marketplace. Browse authentic brands or scale your store across Nepal.
            </p>

            <div className="mt-8 space-y-4 text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <FiTruck className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Express delivery across Nepal</span>
              </div>
              <div className="flex items-center gap-3">
                <FiShield className="w-4 h-4 text-orange-400 shrink-0" />
                <span>100% genuine & verified sellers</span>
              </div>
              <div className="flex items-center gap-3">
                <FiCreditCard className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Cash on Delivery & digital wallets</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800/80 text-[11px] text-gray-500">
            © {new Date().getFullYear()} AkMart Marketplace.
          </div>
        </div>

        {/* Right Side: Form Panel - Consistent height to prevent jarring jumps */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-start min-h-[620px]">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-6">
            <Link to="/">
              <img src={assets.logo} alt="AkMart" className="h-9 w-auto object-contain filter invert mb-1" />
            </Link>
          </div>

          {/* Top Segmented Switcher with smooth sliding pill */}
          <div className="relative flex p-1 bg-[#0D0D0D] border border-gray-800 rounded-xl mb-6 w-full" role="tablist">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-500 rounded-lg shadow-md transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
                tab === 'login' ? 'left-1' : 'left-[calc(50%+2px)]'
              }`}
            />
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              onClick={() => switchTab('login')}
              className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-bold text-center transition-colors duration-200 ${
                tab === 'login' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'register'}
              onClick={() => switchTab('register')}
              className={`relative z-10 flex-1 py-2.5 text-xs sm:text-sm font-bold text-center transition-colors duration-200 ${
                tab === 'register' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={() => handleGoogleSSO()}
            disabled={isGooglePending}
            className="w-full flex items-center justify-center gap-3 bg-[#1A1A1A] hover:bg-[#222222] border border-gray-800 text-white py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-60 focus:outline-none focus:border-orange-500"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>{isGooglePending ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink-0 mx-3 text-gray-500 text-[10px] uppercase tracking-widest font-semibold">
              or use credentials
            </span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          {/* Quick Demo Credentials for One-Click Testing */}
          {tab === 'login' && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                type="button"
                id="demo-seller-btn"
                onClick={() => {
                  setIdentifier('seller@techmart.com');
                  setPassword('Seller@123');
                  login({ email: 'seller@techmart.com', password: 'Seller@123' });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[11px] font-bold transition flex items-center gap-1"
              >
                Demo Seller
              </button>
              <button
                type="button"
                id="demo-admin-btn"
                onClick={() => {
                  setIdentifier('admin@akmart.com');
                  setPassword('Admin@123');
                  login({ email: 'admin@akmart.com', password: 'Admin@123' });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold transition flex items-center gap-1"
              >
                Demo Admin
              </button>
              <button
                type="button"
                id="demo-consumer-btn"
                onClick={() => {
                  setIdentifier('consumer@akmart.com');
                  setPassword('Consumer@123');
                  login({ email: 'consumer@akmart.com', password: 'Consumer@123' });
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1"
              >
                Demo Consumer
              </button>
            </div>
          )}

          {/* Form Container with fade-in animation for smoother state switching */}
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4 text-left" autoComplete="off" noValidate>
            <div className="space-y-4">
              {/* Account Type Selector: Register only */}
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  tab === 'register' ? 'max-h-24 opacity-100 mb-2' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <label className="block text-xs font-medium text-gray-400 mb-1.5">I want to register as:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#1A1A1A] border border-gray-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole('CONSUMER')}
                    className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                      role === 'CONSUMER'
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiShoppingBag className="w-3.5 h-3.5" />
                    <span>Shopper</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('SELLER')}
                    className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                      role === 'SELLER'
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiBriefcase className="w-3.5 h-3.5" />
                    <span>Seller / Merchant</span>
                  </button>
                </div>
              </div>

              {/* Full Name: Register only */}
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  tab === 'register' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <InputField
                  id="fullName"
                  name="user_fullname_field"
                  label="Full Name"
                  type="text"
                  placeholder="e.g. Aayush Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  error={tab === 'register' ? errors.name : undefined}
                  autoComplete="off"
                  startIcon={<FiUser className="w-4 h-4" />}
                  required={tab === 'register'}
                />
              </div>

              {/* Email or Phone Input (Always visible) */}
              <InputField
                id="identifier"
                name="user_identifier_field"
                label="Email or Mobile"
                type="text"
                placeholder="name@example.com or 98XXXXXXXX"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors({ ...errors, identifier: '' });
                }}
                error={errors.identifier}
                helperText={
                  identifier && isPhoneNumber(identifier)
                    ? 'Nepal mobile (+977)'
                    : undefined
                }
                autoComplete="off"
                inputMode={isPhoneNumber(identifier) ? 'tel' : 'email'}
                startIcon={<FiMail className="w-4 h-4" />}
                required
              />

              {/* Password Field */}
              <div>
                <InputField
                  id="authPassword"
                  name="user_key_field"
                  label="Password"
                  type={showPassword ? 'text' : isPasswordActive ? 'password' : 'text'}
                  style={!showPassword && !isPasswordActive ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
                  placeholder={tab === 'register' ? 'Min. 8 characters' : '••••••••'}
                  value={password}
                  onFocus={() => setIsPasswordActive(true)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  error={errors.password}
                  autoComplete="new-password"
                  startIcon={<FiLock className="w-4 h-4" />}
                  endAction={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-200 focus:outline-none p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                    </button>
                  }
                  required
                />

                {/* Password Strength Indicator */}
                <div
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    tab === 'register' && password ? 'max-h-12 opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 text-[11px]">Strength:</span>
                    <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                        style={{ width: `${pwdStrength.score}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-300 font-medium text-[11px]">{pwdStrength.label}</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password: Register only */}
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  tab === 'register' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <InputField
                  id="confirmPassword"
                  name="reg_confirm_pwd"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  error={tab === 'register' ? errors.confirmPassword : undefined}
                  autoComplete="new-password"
                  startIcon={<FiLock className="w-4 h-4" />}
                  endAction={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-200 focus:outline-none p-1"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                    </button>
                  }
                  required={tab === 'register'}
                />
              </div>

              {/* Login Extras: Remember Me & Forgot Password */}
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  tab === 'login' ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-[#1A1A1A] border-gray-800 text-orange-500 focus:ring-orange-500"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Register Extras: Account Type */}
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  tab === 'register' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CONSUMER')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 border rounded-xl text-xs font-semibold transition-all duration-200 ${
                      role === 'CONSUMER'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-gray-800 bg-[#1A1A1A] text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <FiShoppingBag className="w-3.5 h-3.5" />
                    <span>Buyer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('SELLER')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 border rounded-xl text-xs font-semibold transition-all duration-200 ${
                      role === 'SELLER'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-gray-800 bg-[#1A1A1A] text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <FiBriefcase className="w-3.5 h-3.5" />
                    <span>Supplier</span>
                  </button>
                </div>
              </div>

              {/* Register Extras: Terms */}
              <div
                className={`transition-all duration-200 ease-in-out overflow-hidden ${
                  tab === 'register' ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <label className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.terms) setErrors({ ...errors, terms: '' });
                    }}
                    className="w-3.5 h-3.5 mt-0.5 rounded bg-[#1A1A1A] border-gray-800 text-orange-500 focus:ring-orange-500"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="text-orange-400 hover:underline">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-orange-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {tab === 'register' && errors.terms && (
                  <p className="text-red-400 text-[11px] mt-1">{errors.terms}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 mt-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all duration-200 disabled:opacity-60 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Please wait...</span>
                </>
              ) : (
                <span>{tab === 'login' ? 'Sign In to AkMart' : 'Create Account'}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
