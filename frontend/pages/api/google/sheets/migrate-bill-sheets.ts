import type { NextApiRequest, NextApiResponse } from 'next';
import { migrateLegacyBillSheets } from '../../../../src/server/google/migrateBillSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const result = await migrateLegacyBillSheets(req, res);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to migrate bill sheets',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
