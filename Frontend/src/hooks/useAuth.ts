import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/auth.service';
import { useAuthStore } from '../store/authStore';
import { ApiError } from '../utils/ApiError';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const resolvePostAuthRedirect = (roleName?: string, intendedPath?: string): string => {
  if (
    intendedPath &&
    typeof intendedPath === 'string' &&
    intendedPath !== '/login' &&
    intendedPath !== '/register' &&
    intendedPath !== '/verify'
  ) {
    return intendedPath;
  }
  const normalized = (roleName || '').toUpperCase();
  if (normalized === 'ADMIN') return '/admin/dashboard';
  if (normalized === 'SELLER') return '/seller/dashboard';
  return '/';
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (data: { email?: string; phoneNumber?: string; password?: string }) => 
      authService.login(data.email, data.phoneNumber, data.password),
    
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('Welcome back! Login successful.', { toastId: 'login-success' });
      const role = (data.user?.roleName || (data.user as any)?.role?.name || data.user?.role || '').toUpperCase();
      const intended = (location.state as any)?.from || new URLSearchParams(location.search).get('redirect') || undefined;
      navigate(resolvePostAuthRedirect(role, intended));
    },
    
    onError: (error: ApiError, variables) => {
      if (error.code === 'GOOGLE_ACCOUNT_NO_PASSWORD') {
        toast.info(error.message, { toastId: 'google-no-password', autoClose: 7000 });
        return;
      }
      if (error.code === 'UNVERIFIED_ACCOUNT') {
        toast.info(error.message || 'Account not verified yet. We have sent a new verification code!', {
          toastId: 'unverified-account-notice',
          autoClose: 5000,
        });
        const redirect = new URLSearchParams(location.search).get('redirect');
        navigate(`/verify${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`, {
          state: {
            email: variables.email,
            phoneNumber: variables.phoneNumber,
            from: redirect || (location.state as any)?.from
          },
        });
        return;
      }
      toast.error(error.message || 'Login failed', { toastId: 'login-error' });
    }
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (data: { fullName: string; password: string; email?: string; phoneNumber?: string; role?: string }) => 
      authService.register(data.fullName, data.password, data.email, data.phoneNumber, data.role),
    
    onSuccess: (_, variables) => {
      const id = variables.email || variables.phoneNumber || '';
      if (id) {
        sessionStorage.setItem('akmart_verify_identifier', id);
      }
      toast.success('Account created! Please enter the 6-digit verification code.', {
        toastId: 'register-success',
      });
      const redirect = new URLSearchParams(location.search).get('redirect');
      navigate(`/verify${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`, { 
        state: { 
          email: variables.email, 
          phoneNumber: variables.phoneNumber,
          from: redirect || (location.state as any)?.from
        } 
      });
    },
    
    onError: (error: ApiError, variables) => {
      if (error.code === 'GOOGLE_ACCOUNT_EXISTS') {
        toast.info(error.message, { toastId: 'google-account-exists', autoClose: 7000 });
        return;
      }
      // If user is already registered but unverified, backend sends new OTP and informs user
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('unverified') || msg.includes('not verified') || error.code === 'UNVERIFIED_ACCOUNT') {
        toast.info(error.message || 'Account is pending verification. Please enter the verification code.', {
          toastId: 'unverified-register-notice',
          autoClose: 5000,
        });
        navigate('/verify', { state: { email: variables.email, phoneNumber: variables.phoneNumber } });
        return;
      }
      toast.error(error.message || 'Registration failed', { toastId: 'register-error' });
    }
  });
};

export const useVerifyOTP = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (data: { identifier: string; token: string }) => 
      authService.verifyAccount(data.identifier, data.token),
    
    onSuccess: (data) => {
      sessionStorage.removeItem('akmart_verify_identifier');
      setAuth(data.user, data.accessToken);
      toast.success('Account verified successfully! You are now logged in.', {
        toastId: 'verify-success',
      });
      const role = (data.user?.roleName || (data.user as any)?.role?.name || data.user?.role || '').toUpperCase();
      const intended = (location.state as any)?.from || new URLSearchParams(location.search).get('redirect') || (role === 'SELLER' ? '/seller/onboarding' : undefined);
      navigate(resolvePostAuthRedirect(role, intended));
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Verification failed', { toastId: 'verify-error' });
    }
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: (identifier: string) => 
      authService.resendOTP(identifier),
    
    onSuccess: () => {
      toast.success('A fresh verification code has been dispatched to your email/phone!', {
        toastId: 'resend-success',
      });
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to resend code', { toastId: 'resend-error' });
    }
  });
};

export const useLogout = () => {
  const logoutState = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    
    onSuccess: () => {
      logoutState();
      queryClient.clear();
      toast.success('Logged out successfully', { toastId: 'logout-success' });
      navigate('/login');
    },
    
    onError: () => {
      // Even if server fails, force clear local state to prevent being stuck
      logoutState();
      queryClient.clear();
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
      toast.success('If an account exists, a 6-digit reset code has been sent!', {
        toastId: 'forgot-success',
      });
      const identifier = variables.email || variables.phoneNumber || '';
      if (identifier) {
        sessionStorage.setItem('akmart_reset_identifier', identifier);
      }
      navigate(`/reset-password?identifier=${encodeURIComponent(identifier)}`, { state: { identifier } });
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to send reset code', { toastId: 'forgot-error' });
    }
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string }) => 
      authService.resetPassword(data),
    
    onSuccess: (data) => {
      sessionStorage.removeItem('akmart_reset_identifier');
      if (data?.user && data?.accessToken) {
        setAuth(data.user, data.accessToken);
        toast.success('Password updated successfully! Welcome back.', {
          toastId: 'reset-success',
        });
        navigate('/');
      } else {
        toast.success('Password updated successfully! You can now log in.', {
          toastId: 'reset-success',
        });
        navigate('/login');
      }
    },
    
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to reset password', { toastId: 'reset-error' });
    }
  });
};

export const useGoogleSSO = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (idToken: string) => authService.googleSSO({ idToken }),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('Welcome! Signed in with Google.', { toastId: 'google-success' });
      const role = (data.user?.roleName || (data.user as any)?.role?.name || data.user?.role || '').toUpperCase();
      const intended = (location.state as any)?.from || new URLSearchParams(location.search).get('redirect') || undefined;
      navigate(resolvePostAuthRedirect(role, intended));
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Google Sign-In failed. Please try again.', { toastId: 'google-error' });
    },
  });
};
