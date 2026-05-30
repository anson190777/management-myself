import type { NextApiRequest, NextApiResponse } from 'next';
import { getGoogleSessionFromRequest } from '../../../../src/server/google/sessionCookies';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store, private');

  const session = getGoogleSessionFromRequest(req);
  if (!session) {
    res.status(200).json({ connected: false });
    return;
  }

  res.status(200).json({
    connected: true,
    email: session.email,
  });
}
