import type { NextApiRequest, NextApiResponse } from 'next';
import { bootstrapDataSpreadsheet } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const result = await bootstrapDataSpreadsheet(req, res);
    res.status(200).json(result);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error';
    const notConnected = detail.includes('Google not connected');
    res.status(notConnected ? 401 : 500).json({
      message: 'Failed to bootstrap spreadsheet',
      detail,
    });
  }
}
