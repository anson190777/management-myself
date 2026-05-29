import type { GoogleOAuthStatus, GoogleSheetsReadResponse } from '../types/googleSheets';

// Google routes live in Next.js API — must not use axios /api proxy (NestJS backend)
const googleApiFetch = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      detail?: string;
      message?: string;
    };
    throw new Error(body.detail ?? body.message ?? `Google API failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getGoogleOAuthStatus = async (): Promise<GoogleOAuthStatus> =>
  googleApiFetch<GoogleOAuthStatus>('/api/google/oauth/status', {
    cache: 'no-store',
  });

export const disconnectGoogle = async (): Promise<void> => {
  await googleApiFetch('/api/google/oauth/disconnect', { method: 'POST' });
};

export const startGoogleOAuth = (): void => {
  window.location.href = '/api/google/oauth/start';
};

export const readGoogleSheet = async (
  sheetKey: string,
): Promise<GoogleSheetsReadResponse> => {
  const search = new URLSearchParams({ sheetKey });
  return googleApiFetch<GoogleSheetsReadResponse>(
    `/api/google/sheets/read?${search.toString()}`,
  );
};
