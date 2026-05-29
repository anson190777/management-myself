import type { NextApiRequest, NextApiResponse } from 'next';
import { bootstrapDataSpreadsheetWithRow } from '../../../../src/server/google/sheetsClient';
import { appendSetCookieHeader } from '../../../../src/server/google/sessionCookies';
import { completeOAuthAndPersist } from '../../../../src/server/google/sessionTokens';

const OAUTH_STATE_COOKIE = 'mm_oauth_state';

const clearStateCookie = () =>
  `${OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const errorParam = typeof req.query.error === 'string' ? req.query.error : undefined;
  if (errorParam) {
    appendSetCookieHeader(res, clearStateCookie());
    res.redirect(302, `/house/rooms?google=error&reason=${encodeURIComponent(errorParam)}`);
    return;
  }

  const code = typeof req.query.code === 'string' ? req.query.code : undefined;
  const state = typeof req.query.state === 'string' ? req.query.state : undefined;
  const savedState = req.cookies[OAUTH_STATE_COOKIE];

  if (!code || !state || !savedState || state !== savedState) {
    appendSetCookieHeader(res, clearStateCookie());
    res.redirect(
      302,
      '/house/rooms?google=error&reason=invalid_oauth_state',
    );
    return;
  }

  try {
    const row = await completeOAuthAndPersist(code, res);
    // Clear oauth state without wiping session cookies set above
    // Xóa cookie state OAuth mà không ghi đè cookie session vừa set
    appendSetCookieHeader(res, clearStateCookie());
    try {
      await bootstrapDataSpreadsheetWithRow(row);
    } catch (bootstrapError) {
      console.warn('Spreadsheet bootstrap after OAuth failed:', bootstrapError);
    }
    res.redirect(
      302,
      `/house/rooms?google=connected&email=${encodeURIComponent(row.email)}`,
    );
  } catch (error) {
    appendSetCookieHeader(res, clearStateCookie());
    res.redirect(
      302,
      `/house/rooms?google=error&reason=${encodeURIComponent(
        error instanceof Error ? error.message : 'oauth_failed',
      )}`,
    );
  }
}
