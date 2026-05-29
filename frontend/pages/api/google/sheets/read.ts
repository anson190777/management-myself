import type { NextApiRequest, NextApiResponse } from 'next';
import { readSheet } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const sheetKey = typeof req.query.sheetKey === 'string' ? req.query.sheetKey : undefined;
  const sheetName = typeof req.query.sheetName === 'string' ? req.query.sheetName : undefined;

  if (!sheetKey && !sheetName) {
    res.status(400).json({ message: 'Missing query parameter: sheetKey or sheetName' });
    return;
  }

  try {
    const data = await readSheet(req, res, { sheetKey, sheetName });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to read Google Sheet',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
