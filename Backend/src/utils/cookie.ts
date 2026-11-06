import { env } from '../config/env';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'none' | 'strict';
  path: string;
  maxAge?: number;
}

/**
 * Returns cookie options for auth tokens.
 * When isRemembered is true: sets persistent cookie with maxAge (e.g. 7-30 days).
 * When isRemembered is false: sets session cookie (no maxAge/expires), which browsers discard on exit.
 */
export const getAuthCookieOptions = (isRemembered: boolean = true): CookieOptions => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/',
  };

  if (isRemembered) {
    options.maxAge = env.JWT_REFRESH_EXPIRES_IN_MS;
  }

  return options;
};

