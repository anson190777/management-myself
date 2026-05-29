import type { NextApiRequest, NextApiResponse } from 'next';
import { appendRow } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { sheetKey, sheetName, row } = req.body ?? {};
  if (!row || typeof row !== 'object') {
    res.status(400).json({ message: 'Missing body field: row' });
    return;
  }
  if (!sheetKey && !sheetName) {
    res.status(400).json({ message: 'Missing body field: sheetKey or sheetName' });
    return;
  }

  try {
    const result = await appendRow(req, res, {
      sheetKey: typeof sheetKey === 'string' ? sheetKey : undefined,
      sheetName: typeof sheetName === 'string' ? sheetName : undefined,
      row,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to append row',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
