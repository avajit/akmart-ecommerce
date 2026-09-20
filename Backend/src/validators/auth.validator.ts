import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['CONSUMER', 'SELLER']).default('CONSUMER'),
  }).refine((data) => data.email || data.phoneNumber, {
    message: 'Either email or phone number must be provided',
    path: ['email'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional(),
    password: z.string().min(1, 'Password is required'),
  }).refine((data) => data.email || data.phoneNumber, {
    message: 'Either email or phone number must be provided for login',
    path: ['email'],
  }),
});

export const googleSSOSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'Google ID Token is required'),
    deviceInfo: z.string().optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional(),
  }).refine((data) => data.email || data.phoneNumber, {
    message: 'Either email or phone number must be provided for password reset',
    path: ['email'],
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const verifyAccountSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or Phone is required'),
    token: z.string().length(6, 'Verification code must be exactly 6 digits'),
  }),
});

export const resendOTPSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or Phone is required'),
  }),
});

// REQUEST DTOs (Inferred directly from Zod, preventing any drift)
export type RegisterRequestDTO = z.infer<typeof registerSchema>['body'];
export type LoginRequestDTO = z.infer<typeof loginSchema>['body'];
export type GoogleSSORequestDTO = z.infer<typeof googleSSOSchema>['body'];
export type ForgotPasswordRequestDTO = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordRequestDTO = z.infer<typeof resetPasswordSchema>['body'];
export type VerifyAccountRequestDTO = z.infer<typeof verifyAccountSchema>['body'];
export type ResendOTPRequestDTO = z.infer<typeof resendOTPSchema>['body'];
