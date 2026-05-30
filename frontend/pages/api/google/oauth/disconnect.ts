import type { NextApiRequest, NextApiResponse } from 'next';
import { clearGoogleSessionCookies } from '../../../../src/server/google/sessionCookies';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  clearGoogleSessionCookies(res);
  res.status(200).json({ connected: false });
}
