import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteSheetTab } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const sheetName = typeof req.query.sheetName === 'string' ? req.query.sheetName : undefined;
  if (!sheetName) {
    res.status(400).json({ message: 'Missing query parameter: sheetName' });
    return;
  }

  try {
    await deleteSheetTab(req, res, sheetName);
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete sheet tab',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
