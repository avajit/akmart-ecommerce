import { Router } from 'express';
import { register, login, refreshToken, logout, googleSSO, forgotPassword, resetPassword, verifyAccount, resendOTP, deleteAccount } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { authLimiter } from '../middlewares/rateLimiter';
import { requireAuth } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, googleSSOSchema, forgotPasswordSchema, resetPasswordSchema, verifyAccountSchema, resendOTPSchema } from '../validators/auth.validator';

const router = Router();

// 1. Account Management
router.post('/register', validateRequest(registerSchema), register);
router.post('/verify-account', validateRequest(verifyAccountSchema), verifyAccount);
router.post('/resend-otp', authLimiter, validateRequest(resendOTPSchema), resendOTP);
router.delete('/account', requireAuth, deleteAccount as any); // Soft deletes user and revokes sessions

// 2. Authentication
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/google', authLimiter, validateRequest(googleSSOSchema), googleSSO);
router.post('/refresh-token', refreshToken); // Uses HttpOnly cookie OR body
router.post('/logout', logout);

// 3. Password Recovery
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);

export default router;
