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

const LTA_BUS_ARRIVAL_V3_URL =
  'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';
const BUS_STOP_CODE_REGEX = /^\d{5}$/;
const SERVICE_NO_REGEX = /^[0-9A-Za-z]{1,6}$/;
const UPSTREAM_TIMEOUT_MS = 8000;

function getQueryParam(req: ServerlessRequest, key: string): string {
  const fromQuery = req.query?.[key];
  if (typeof fromQuery === 'string') {
    return fromQuery.trim();
  }
  if (Array.isArray(fromQuery) && typeof fromQuery[0] === 'string') {
    return fromQuery[0].trim();
  }
  if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      return (parsed.searchParams.get(key) ?? '').trim();
    } catch {
      return '';
    }
  }
  return '';
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

  const busStopCode = getQueryParam(req, 'BusStopCode');
  const serviceNo = getQueryParam(req, 'ServiceNo');

  if (!BUS_STOP_CODE_REGEX.test(busStopCode)) {
    res.status(400).json({
      error: 'Invalid or missing BusStopCode. Expected a 5-digit Singapore bus stop code (e.g. 04121).',
      code: 'INVALID_BUS_STOP_CODE',
    });
    return;
  }

  if (serviceNo && !SERVICE_NO_REGEX.test(serviceNo)) {
    res.status(400).json({
      error: 'Invalid ServiceNo format.',
      code: 'INVALID_SERVICE_NO',
    });
    return;
  }

  const accountKey = process.env.LTA_ACCOUNT_KEY?.trim();
  if (!accountKey) {
    res.status(503).json({
      error: 'LTA_ACCOUNT_KEY is not configured on the server. Add it to your environment secrets and retry.',
      code: 'MISSING_API_KEY',
    });
    return;
  }

  const upstreamUrl = new URL(LTA_BUS_ARRIVAL_V3_URL);
  upstreamUrl.searchParams.set('BusStopCode', busStopCode);
  if (serviceNo) {
    upstreamUrl.searchParams.set('ServiceNo', serviceNo);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        AccountKey: accountKey,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!upstreamRes.ok) {
      if (upstreamRes.status === 401 || upstreamRes.status === 403) {
        res.status(502).json({
          error: 'LTA DataMall rejected the AccountKey. Verify your LTA_ACCOUNT_KEY secret.',
          code: 'UPSTREAM_AUTH_ERROR',
        });
        return;
      }
      if (upstreamRes.status === 429) {
        res.status(429).json({
          error: 'LTA DataMall rate limit reached. Please retry in a few seconds.',
          code: 'UPSTREAM_RATE_LIMIT',
        });
        return;
      }
      res.status(502).json({
        error: `LTA DataMall returned HTTP ${upstreamRes.status}.`,
        code: 'UPSTREAM_ERROR',
      });
      return;
    }

    const payload = (await upstreamRes.json()) as {
      BusStopCode?: string;
      Services?: unknown[];
    };

    res.status(200).json({
      BusStopCode: payload.BusStopCode ?? busStopCode,
      Services: Array.isArray(payload.Services) ? payload.Services : [],
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    res.status(isTimeout ? 504 : 502).json({
      error: isTimeout
        ? 'LTA DataMall request timed out.'
        : 'Failed to connect to LTA DataMall service.',
      code: isTimeout ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_NETWORK_ERROR',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
