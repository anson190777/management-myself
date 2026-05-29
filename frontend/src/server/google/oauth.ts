import { google } from 'googleapis';
import { GOOGLE_SHEETS_SCOPES } from '../../config/googleSheets.config';
import type { OAuthTokenRow } from '../../types/googleSheets';
import { getGoogleServerEnv } from './env';

export const createOAuth2Client = () => {
  const env = getGoogleServerEnv();
  return new google.auth.OAuth2(env.clientId, env.clientSecret, env.redirectUri);
};

export const buildGoogleAuthUrl = (state: string): string => {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [...GOOGLE_SHEETS_SCOPES],
    state,
  });
};

export const exchangeCodeForTokens = async (code: string) => {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const profile = await oauth2.userinfo.get();
  const email = profile.data.email?.trim();

  if (!email) {
    throw new Error('Google account has no email');
  }
  if (!tokens.access_token) {
    throw new Error('Google did not return an access token');
  }
  if (!tokens.refresh_token) {
    throw new Error(
      'Google did not return a refresh token. Revoke app access in Google Account and connect again.',
    );
  }

  const expiresAt = tokens.expiry_date
    ? new Date(tokens.expiry_date).toISOString()
    : new Date(Date.now() + 3600 * 1000).toISOString();

  const row: OAuthTokenRow = {
    email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt,
    updatedAt: new Date().toISOString(),
  };

  return { client, row };
};

export const authClientFromTokenRow = (row: OAuthTokenRow) => {
  const client = createOAuth2Client();
  client.setCredentials({
    access_token: row.accessToken,
    refresh_token: row.refreshToken,
    expiry_date: new Date(row.expiresAt).getTime(),
  });
  return client;
};

export const refreshTokenRow = async (row: OAuthTokenRow): Promise<OAuthTokenRow> => {
  const client = authClientFromTokenRow(row);
  const { credentials } = await client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error('Failed to refresh Google access token');
  }

  return {
    email: row.email,
    accessToken: credentials.access_token,
    refreshToken: credentials.refresh_token ?? row.refreshToken,
    expiresAt: credentials.expiry_date
      ? new Date(credentials.expiry_date).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const isTokenExpiringSoon = (expiresAt: string, bufferMs = 5 * 60 * 1000): boolean => {
  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) {
    return true;
  }
  return expiresMs - Date.now() <= bufferMs;
};
