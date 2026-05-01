import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? 'http://localhost:3000';

async function readBody(req: NextApiRequest): Promise<string | undefined> {
  if (!req.body) {
    return undefined;
  }
  return typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : '';
  const url = new URL(`${BACKEND_API_BASE_URL.replace(/\/$/, '')}/${path}`);

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === 'path') {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
      return;
    }
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  });

  const headers: Record<string, string> = {};
  if (req.headers.authorization) {
    headers.authorization = req.headers.authorization;
  }
  if (req.headers['content-type']) {
    headers['content-type'] = req.headers['content-type'];
  }

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method ?? '')
        ? undefined
        : await readBody(req),
    });

    const raw = await response.text();
    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json');
      res.send(raw ? JSON.parse(raw) : null);
      return;
    }
    res.send(raw);
  } catch (error) {
    res.status(502).json({
      message: 'API proxy error',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
