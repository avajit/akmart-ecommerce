// These interfaces exactly mirror the Backend DTO responses.

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface UserDTO {
  id: string;
  email?: string;
  phoneNumber?: string;
  fullName: string;
  roleId: string;
  role?: string;
  roleName?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface LoginRequestDTO {
  email?: string;
  phoneNumber?: string;
  password?: string;
}

export interface RegisterRequestDTO {
  fullName: string;
  password: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
}

export interface VerifyAccountRequestDTO {
  identifier: string;
  token: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginResponseDTO {
  user: UserDTO;
  accessToken: string;
}
