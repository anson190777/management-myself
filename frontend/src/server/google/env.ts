import { GOOGLE_DATA_SPREADSHEET_ID } from '../../config/googleSheets.config';

const requireEnv = (key: string): string => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const getGoogleServerEnv = () => ({
  clientId: requireEnv('NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID'),
  clientSecret: requireEnv('GOOGLE_OAUTH_CLIENT_SECRET'),
  redirectUri:
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ??
    'http://localhost:3000/api/google/oauth/callback',
  dataSpreadsheetId:
    process.env.GOOGLE_DATA_SPREADSHEET_ID?.trim() ??
    process.env.NEXT_PUBLIC_GOOGLE_DATA_SPREADSHEET_ID?.trim() ??
    process.env.GOOGLE_TOKEN_REGISTRY_SPREADSHEET_ID?.trim() ??
    process.env.NEXT_PUBLIC_GOOGLE_TOKEN_REGISTRY_SPREADSHEET_ID?.trim() ??
    GOOGLE_DATA_SPREADSHEET_ID,
});
