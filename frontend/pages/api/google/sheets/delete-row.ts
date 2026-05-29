import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteRowById } from '../../../../src/server/google/sheetsClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const sheetKey = typeof req.query.sheetKey === 'string' ? req.query.sheetKey : undefined;
  const sheetName = typeof req.query.sheetName === 'string' ? req.query.sheetName : undefined;
  const id = typeof req.query.id === 'string' ? req.query.id : undefined;

  if (!id) {
    res.status(400).json({ message: 'Missing query parameter: id' });
    return;
  }
  if (!sheetKey && !sheetName) {
    res.status(400).json({ message: 'Missing query parameter: sheetKey or sheetName' });
    return;
  }

  try {
    await deleteRowById(req, res, { sheetKey, sheetName, id });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete row',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
