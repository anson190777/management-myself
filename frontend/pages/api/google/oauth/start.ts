import type { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { buildGoogleAuthUrl } from '../../../../src/server/google/oauth';

const OAUTH_STATE_COOKIE = 'mm_oauth_state';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const state = randomBytes(16).toString('hex');
  const authUrl = buildGoogleAuthUrl(state);

  res.setHeader(
    'Set-Cookie',
    `${OAUTH_STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
  );
  res.redirect(302, authUrl);
}
