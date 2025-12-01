import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';

const Login = () => {

  const [currentState, setCurrentState] = useState('Login'); // State to flip between Login/Signup
  const { setToken, navigate } = useContext(ShopContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    // --- SIMULATE AUTHENTICATION ---
    // In the Backend phase, this will be an API call to /api/user/login
    
    const fakeToken = "demo123token";
    setToken(fakeToken);
    localStorage.setItem('token', fakeToken);
    
    toast.success(currentState === 'Login' ? "Welcome Back!" : "Account Created Successfully!");
    navigate('/'); // Send user to Home Page
  }

  return (
    <div className='min-h-[80vh] flex items-center justify-center pt-10 px-4'>
        
        {/* --- MAIN CARD --- */}
        <form 
            onSubmit={onSubmitHandler} 
            className='bg-[#121212] border border-gray-800 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-8 sm:p-10 w-full max-w-md flex flex-col gap-6 animate-fade-in'
        >
            
            {/* --- HEADER --- */}
            <div className='flex flex-col items-center gap-2 mb-4'>
                <p className='text-3xl font-serif text-white tracking-wider animate-slide-up'>
                    {currentState}
                </p>
                <div className='w-12 h-1 bg-amber-500 rounded-full'></div>
            </div>

            {/* --- INPUTS --- */}
            <div className='flex flex-col gap-4'>
                
                {/* Name Field (Only for Sign Up) */}
                {currentState === 'Sign Up' && (
                    <div className='group'>
                        <input 
                            type="text" 
                            className='w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500' 
                            placeholder='Full Name' 
                            required 
                        />
                    </div>
                )}
                
                <div className='group'>
                    <input 
                        type="email" 
                        className='w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500' 
                        placeholder='Email Address' 
                        required 
                    />
                </div>

                <div className='group'>
                    <input 
                        type="password" 
                        className='w-full px-4 py-3 bg-[#1A1A1A] border border-gray-700 rounded-lg text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder-gray-500' 
                        placeholder='Password' 
                        required 
                    />
                </div>
            </div>

            {/* --- FORGOT & TOGGLE LINKS --- */}
            <div className='w-full flex justify-between text-sm text-gray-400 mt-[-5px]'>
                <p className='cursor-pointer hover:text-amber-500 transition-colors'>
                    Forgot password?
                </p>
                
                {currentState === 'Login' ? (
                    <p 
                        onClick={() => setCurrentState('Sign Up')} 
                        className='cursor-pointer hover:text-white transition-colors'
                    >
                        New here? <span className='text-amber-500 font-bold ml-1'>Create account</span>
                    </p>
                ) : (
                    <p 
                        onClick={() => setCurrentState('Login')} 
                        className='cursor-pointer hover:text-white transition-colors'
                    >
                        Already have an account? <span className='text-amber-500 font-bold ml-1'>Login</span>
                    </p>
                )}
            </div>

            {/* --- ACTION BUTTON --- */}
            <button className='bg-amber-500 text-black font-bold py-3.5 rounded-lg hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 mt-2 active:scale-95'>
                {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
            </button>

        </form>
    </div>
  )
}

export default Login