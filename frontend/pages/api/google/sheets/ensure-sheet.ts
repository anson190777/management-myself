import type { NextApiRequest, NextApiResponse } from 'next';
import { ensureSheetWithHeaders } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { sheetName } = req.body ?? {};
  if (!sheetName || typeof sheetName !== 'string') {
    res.status(400).json({ message: 'Missing body field: sheetName' });
    return;
  }

  try {
    const result = await ensureSheetWithHeaders(req, res, { sheetName });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to ensure sheet',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
