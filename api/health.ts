import process from 'node:process';

export interface ServerlessRequest {
  method?: string;
  query?: Record<string, unknown>;
  url?: string;
}

export interface ServerlessResponse {
  status(code: number): ServerlessResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  const ltaConfigured = Boolean(process.env.LTA_ACCOUNT_KEY?.trim());

  res.status(200).json({
    ok: true,
    service: 'bussg-lta-proxy',
    ltaConfigured,
    endpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
    timestamp: new Date().toISOString(),
  });
}
