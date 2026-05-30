import type { NextApiRequest, NextApiResponse } from 'next';
import { listSpreadsheetTabs } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const sheetNames = await listSpreadsheetTabs(req, res);
    res.status(200).json({ sheetNames });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to list spreadsheet tabs',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
