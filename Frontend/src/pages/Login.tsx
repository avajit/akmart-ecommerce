import React, { useState } from 'react';
import { useLogin, useRegister, useGoogleSSO } from '../hooks/useAuth';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import InputField from '../components/common/InputField';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [currentState, setCurrentState] = useState<'Login' | 'Sign Up'>('Login');

  // Form State
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Handles BOTH email and phone
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'supplier'>('buyer');

  // Mutations
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();
  const { mutate: googleSSO, isPending: isGooglePending } = useGoogleSSO();

  const isSubmitting = isLoginPending || isRegisterPending;

  // Helper to determine if the input is a phone number (10 digits) or an email
  const parseIdentifier = (value: string) => {
    const isPhone = /^\d{10}$/.test(value);
    return isPhone ? { phoneNumber: value } : { email: value };
  };

  const onSubmitHandler = (event: React.FormEvent) => {
    event.preventDefault();
    
    const parsedId = parseIdentifier(identifier);

    if (currentState === 'Login') {
      login({ ...parsedId, password });
    } else {
      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      
      const backendRole = role === 'buyer' ? 'CONSUMER' : 'SELLER';
      register({ fullName: name, ...parsedId, password, role: backendRole });
    }
  };

  const handleGoogleSSO = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Exchange the OAuth access_token for an id_token from Google's userinfo endpoint
      // Then send the access_token to our backend to verify
      // NOTE: For implicit flow, we receive access_token, not id_token.
      // Our backend's verifyIdToken accepts access_token when used with OAuth2Client
      googleSSO(tokenResponse.access_token);
    },
    onError: () => {
      toast.error('Google Sign-In was cancelled or failed.');
    },
    flow: 'implicit',
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 py-12 px-4 font-[Poppins] selection:bg-amber-500 selection:text-white">
        
        {/* Main Card with Glassmorphism */}
        <div className="flex bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-100 w-full max-w-5xl overflow-hidden relative">
            
            {/* Left Side: Premium Navy Panel (Option A) */}
            <div className="hidden md:flex w-1/2 p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex-col justify-center relative overflow-hidden">
                
                {/* Decorative Deep Glows (Subtle) */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-slate-800 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-8 right-0 w-72 h-72 bg-slate-700 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative z-10">
                    <img src="/src/assets/logo.png" alt="AKK Logo" className="h-12 w-auto mb-16 filter brightness-0 invert opacity-90" />
                    
                    <h2 className="text-4xl font-extrabold mt-8 leading-tight tracking-tight text-white">
                        Elevate your <br/><span className="text-amber-500">commerce experience.</span>
                    </h2>
                    <p className="mt-6 text-lg text-slate-300 leading-relaxed font-light">
                        Join AKK and get seamlessly connected to premium suppliers across the globe.
                    </p>
                    
                    <div className="mt-12 group inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl backdrop-blur-md shadow-lg border border-white/10 transition-all duration-300 hover:scale-105 hover:bg-amber-500/10 hover:border-amber-500/30 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 group-hover:text-amber-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right Side: Authentication Form */}
            <div className="w-full md:w-1/2 p-10 sm:p-16 bg-white flex flex-col justify-center relative">
                
                {/* Mobile Logo */}
                <div className="md:hidden flex justify-center mb-8">
                    <img src="/src/assets/logo.png" alt="AKK Logo" className="h-12 w-auto" />
                </div>

                <div className="text-center md:text-left mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {currentState === 'Login' ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        {currentState === 'Login' ? 'Please enter your details to sign in.' : 'Join us to start shopping seamlessly.'}
                    </p>
                </div>
                
                <form onSubmit={onSubmitHandler} className="flex flex-col gap-5 relative z-10">
                    
                    {currentState === 'Sign Up' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <InputField 
                                label="Full Name"
                                type="text"
                                placeholder="e.g. John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <InputField 
                            label="Email Address or Phone Number"
                            type="text" 
                            placeholder="hello@example.com or 98XXXXXXXX"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <InputField 
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {currentState === 'Login' && (
                            <div className="flex justify-end mt-1.5">
                                <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                                    Forgot your password?
                                </Link>
                            </div>
                        )}
                    </div>

                    {currentState === 'Sign Up' && (
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 mt-2">
                            <label className="block text-slate-700 text-sm font-semibold mb-3">I want to join as a</label>
                            <div className="flex items-center gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all duration-300 ${role === 'buyer' ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="role" 
                                        value="buyer" 
                                        checked={role === 'buyer'}
                                        onChange={() => setRole('buyer')}
                                        className="sr-only"
                                    />
                                    <span className={`font-semibold ${role === 'buyer' ? 'text-slate-900' : 'text-slate-500'}`}>Buyer</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all duration-300 ${role === 'supplier' ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="role" 
                                        value="supplier" 
                                        checked={role === 'supplier'}
                                        onChange={() => setRole('supplier')}
                                        className="sr-only"
                                    />
                                    <span className={`font-semibold ${role === 'supplier' ? 'text-slate-900' : 'text-slate-500'}`}>Supplier</span>
                                </label>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 text-white py-4 mt-4 rounded-xl text-lg font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 active:scale-[0.98]"
                    >
                        {isSubmitting ? 'Authenticating...' : (currentState === 'Login' ? 'Sign In' : 'Create Account')}
                    </button>
                    
                    {/* Google SSO Button */}
                    <div className="relative flex items-center my-6">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">or continue with</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button 
                        type="button"
                        onClick={() => handleGoogleSSO()}
                        disabled={isGooglePending}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl text-md font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow disabled:opacity-70"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {isGooglePending ? 'Signing in...' : 'Google'}
                    </button>

                    {/* Role hint for Google SSO */}
                    {currentState === 'Sign Up' && (
                        <p className="text-xs text-center text-slate-400 mt-2">
                            Google accounts are created as <span className="font-semibold text-slate-500">Buyer</span> accounts by default.
                            Want to sell? <span className="text-amber-500 font-semibold">Register with email above</span> and choose Supplier.
                        </p>
                    )}

                    <p className="text-sm text-gray-500 mt-6 text-center font-medium">
                        {currentState === 'Sign Up' ? 'Already registered? ' : "Don't have an account? "}
                        <span 
                            onClick={() => setCurrentState(currentState === 'Login' ? 'Sign Up' : 'Login')} 
                            className="text-indigo-600 font-bold cursor-pointer hover:text-indigo-800 transition-colors"
                        >
                            {currentState === 'Sign Up' ? 'Sign In' : 'Sign Up'}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login;
