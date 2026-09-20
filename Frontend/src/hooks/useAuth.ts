import { useMutation } from '@tanstack/react-query';
import { authService } from '../api/auth.service';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../utils/ApiError';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email?: string; phoneNumber?: string; password?: string }) => 
      authService.login(data.email, data.phoneNumber, data.password),
    
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('Login successful!');
      navigate('/');
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Login failed');
    }
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { fullName: string; password: string; email?: string; phoneNumber?: string; role?: string }) => 
      authService.register(data.fullName, data.password, data.email, data.phoneNumber, data.role),
    
    onSuccess: (_, variables) => {
      toast.success('Registration successful! Please check your email/phone for the OTP.');
      navigate('/verify', { state: { email: variables.email, phoneNumber: variables.phoneNumber } });
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Registration failed');
    }
  });
};

export const useVerifyOTP = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { identifier: string; token: string }) => 
      authService.verifyAccount(data.identifier, data.token),
    
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('Account verified! You are now logged in.');
      navigate('/');
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Verification failed');
    }
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: (identifier: string) => 
      authService.resendOTP(identifier),
    
    onSuccess: () => {
      toast.success('A new verification code has been sent!');
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to resend code');
    }
  });
};

export const useLogout = () => {
  const logoutState = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    
    onSuccess: () => {
      logoutState();
      toast.success('Logged out successfully');
      navigate('/login');
    },
    
    onError: (error: ApiError) => {
      // Even if server fails, force clear local state to prevent being stuck
      logoutState();
      navigate('/login');
    }
  });
};

export const useForgotPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { email?: string; phoneNumber?: string }) => 
      authService.forgotPassword(data),
    
    onSuccess: (_, variables) => {
      toast.success('If an account exists, a 6-digit reset code has been sent!');
      const identifier = variables.email || variables.phoneNumber || '';
      navigate(`/reset-password`, { state: { identifier } });
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to send reset code');
    }
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) => 
      authService.resetPassword(data),
    
    onSuccess: () => {
      toast.success('Password reset successfully! Please login with your new password.');
      navigate('/login');
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to reset password');
    }
  });
};

export const useGoogleSSO = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (idToken: string) => authService.googleSSO({ idToken }),
    onSuccess: (data) => {
      // setAuth(user, accessToken) — same order as useLogin and useVerifyOTP
      // setAuth internally handles localStorage.setItem('accessToken', ...) — no duplication needed
      setAuth(data.user, data.accessToken);
      toast.success('Welcome! Signed in with Google.');
      navigate('/');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Google Sign-In failed. Please try again.');
    },
  });
};
