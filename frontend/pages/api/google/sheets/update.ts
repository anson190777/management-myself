import type { NextApiRequest, NextApiResponse } from 'next';
import { updateRowById } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { sheetKey, sheetName, id, row } = req.body ?? {};
  if (!id || typeof id !== 'string') {
    res.status(400).json({ message: 'Missing body field: id' });
    return;
  }
  if (!row || typeof row !== 'object') {
    res.status(400).json({ message: 'Missing body field: row' });
    return;
  }
  if (!sheetKey && !sheetName) {
    res.status(400).json({ message: 'Missing body field: sheetKey or sheetName' });
    return;
  }

  try {
    await updateRowById(req, res, {
      sheetKey: typeof sheetKey === 'string' ? sheetKey : undefined,
      sheetName: typeof sheetName === 'string' ? sheetName : undefined,
      id,
      row,
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update row',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
