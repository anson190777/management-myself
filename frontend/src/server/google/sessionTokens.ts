import type { NextApiRequest, NextApiResponse } from 'next';
import type { OAuthTokenRow } from '../../types/googleSheets';
import {
  authClientFromTokenRow,
  exchangeCodeForTokens,
  isTokenExpiringSoon,
  refreshTokenRow,
} from './oauth';
import { getGoogleSessionFromRequest, setGoogleSessionCookies } from './sessionCookies';

export const completeOAuthAndPersist = async (
  code: string,
  res: NextApiResponse,
): Promise<OAuthTokenRow> => {
  const { row } = await exchangeCodeForTokens(code);
  setGoogleSessionCookies(res, row);
  return row;
};

export const getValidSessionTokens = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<OAuthTokenRow> => {
  const session = getGoogleSessionFromRequest(req);
  if (!session) {
    throw new Error('Google not connected. Use Connect Google first.');
  }

  if (!isTokenExpiringSoon(session.expiresAt)) {
    return session;
  }

  const refreshed = await refreshTokenRow(session);
  setGoogleSessionCookies(res, refreshed);
  return refreshed;
};

export const getAuthenticatedClient = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const row = await getValidSessionTokens(req, res);
  return authClientFromTokenRow(row);
};
