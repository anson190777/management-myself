import type { NextApiRequest, NextApiResponse } from 'next';
import type { OAuthTokenRow } from '../../types/googleSheets';

export const GOOGLE_SESSION_COOKIE = {
  email: 'mm_google_email',
  refreshToken: 'mm_google_refresh',
  accessToken: 'mm_google_access',
  expiresAt: 'mm_google_expires_at',
} as const;

const cookieOptions = (maxAgeSeconds: number) =>
  [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

export const setGoogleSessionCookies = (res: NextApiResponse, row: OAuthTokenRow) => {
  const thirtyDays = 60 * 60 * 24 * 30;
  const accessMaxAge = Math.max(
    60,
    Math.floor((new Date(row.expiresAt).getTime() - Date.now()) / 1000),
  );

  res.setHeader('Set-Cookie', [
    `${GOOGLE_SESSION_COOKIE.email}=${encodeURIComponent(row.email)}; ${cookieOptions(thirtyDays)}`,
    `${GOOGLE_SESSION_COOKIE.refreshToken}=${encodeURIComponent(row.refreshToken)}; ${cookieOptions(thirtyDays)}`,
    `${GOOGLE_SESSION_COOKIE.accessToken}=${encodeURIComponent(row.accessToken)}; ${cookieOptions(accessMaxAge)}`,
    `${GOOGLE_SESSION_COOKIE.expiresAt}=${encodeURIComponent(row.expiresAt)}; ${cookieOptions(thirtyDays)}`,
  ]);
};

export const clearGoogleSessionCookies = (res: NextApiResponse) => {
  const expired = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  res.setHeader('Set-Cookie', [
    `${GOOGLE_SESSION_COOKIE.email}=; ${expired}`,
    `${GOOGLE_SESSION_COOKIE.refreshToken}=; ${expired}`,
    `${GOOGLE_SESSION_COOKIE.accessToken}=; ${expired}`,
    `${GOOGLE_SESSION_COOKIE.expiresAt}=; ${expired}`,
  ]);
};

/** Append cookies without replacing prior Set-Cookie headers / Gắn thêm cookie, không ghi đè header cũ */
export const appendSetCookieHeader = (
  res: NextApiResponse,
  cookies: string | string[],
): void => {
  const existing = res.getHeader('Set-Cookie');
  const current = Array.isArray(existing)
    ? [...existing]
    : existing
      ? [String(existing)]
      : [];
  const next = Array.isArray(cookies) ? cookies : [cookies];
  res.setHeader('Set-Cookie', [...current, ...next]);
};

const readCookie = (req: NextApiRequest, name: string): string | undefined => {
  const raw = req.cookies[name];
  if (!raw) {
    return undefined;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export const getGoogleSessionFromRequest = (
  req: NextApiRequest,
): OAuthTokenRow | null => {
  const email = readCookie(req, GOOGLE_SESSION_COOKIE.email);
  const refreshToken = readCookie(req, GOOGLE_SESSION_COOKIE.refreshToken);
  const accessToken = readCookie(req, GOOGLE_SESSION_COOKIE.accessToken);
  const expiresAt = readCookie(req, GOOGLE_SESSION_COOKIE.expiresAt);

  if (!email || !refreshToken || !accessToken || !expiresAt) {
    return null;
  }

  return {
    email,
    refreshToken,
    accessToken,
    expiresAt,
    updatedAt: new Date().toISOString(),
  };
};
