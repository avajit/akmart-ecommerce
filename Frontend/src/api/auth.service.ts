import apiClient from './client';
import { 
  LoginRequestDTO, 
  RegisterRequestDTO, 
  VerifyAccountRequestDTO 
} from '../../../Backend/src/validators/auth.validator'; // Wait, sharing types from backend directly might be tricky in a monorepo without workspaces. 
// Instead, I'll use the types defined in frontend.

import { LoginResponseDTO, ApiResponse } from '../types/api.types';

export const authService = {
  login: async (email?: string, phoneNumber?: string, password?: string): Promise<LoginResponseDTO> => {
    const response = await apiClient.post<ApiResponse<LoginResponseDTO>>('/auth/login', { 
      email, 
      phoneNumber, 
      password 
    });
    return response.data.data;
  },

  register: async (fullName: string, password: string, email?: string, phoneNumber?: string, role?: string): Promise<void> => {
    await apiClient.post('/auth/register', { 
      fullName, 
      password, 
      email, 
      phoneNumber,
      role
    });
  },

  verifyAccount: async (identifier: string, token: string): Promise<LoginResponseDTO> => {
    const response = await apiClient.post<ApiResponse<LoginResponseDTO>>('/auth/verify-account', { 
      identifier, 
      token 
    });
    return response.data.data;
  },

  resendOTP: async (identifier: string): Promise<void> => {
    await apiClient.post('/auth/resend-otp', { identifier });
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  forgotPassword: async (data: { email?: string; phoneNumber?: string }): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: { token: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  googleSSO: async (data: { idToken: string }): Promise<LoginResponseDTO> => {
    const response = await apiClient.post<ApiResponse<LoginResponseDTO>>('/auth/google', data);
    return response.data.data;
  },
};
