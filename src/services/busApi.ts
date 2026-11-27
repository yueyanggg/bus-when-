import { generateSimulatedArrivals, SINGAPORE_BUS_STOPS } from '../data/singaporeStops';
import {
  ApiHealthStatus,
  BusArrivalResponse,
  BusStop,
  DataSourceMode,
  SimulatedApiMode,
} from '../types/bus';

export const API_CONFIG = {
  arrivalsEndpoint: '/api/busarrival',
  healthEndpoint: '/api/health',
};

export class BusApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'BusApiError';
    this.code = code;
    this.status = status;
  }
}

export function getStopByCode(busStopCode: string): BusStop | undefined {
  const normalized = busStopCode.trim();
  return SINGAPORE_BUS_STOPS.find((stop) => stop.BusStopCode === normalized);
}

export function searchBusStops(query: string): BusStop[] {
  const q = query.trim().toLowerCase();
  if (!q) return SINGAPORE_BUS_STOPS;

  return SINGAPORE_BUS_STOPS.filter((stop) => {
    const codeMatch = stop.BusStopCode.includes(q);
    const descMatch = stop.Description.toLowerCase().includes(q);
    const roadMatch = stop.RoadName.toLowerCase().includes(q);
    const mrtMatch = stop.mrtNearby?.toLowerCase().includes(q) ?? false;
    const serviceMatch = stop.Services.some((svc) => svc.toLowerCase() === q);
    return codeMatch || descMatch || roadMatch || mrtMatch || serviceMatch;
  });
}

export async function fetchApiHealth(): Promise<ApiHealthStatus> {
  const res = await fetch(API_CONFIG.healthEndpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new BusApiError(`Health check failed (HTTP ${res.status})`, 'HEALTH_CHECK_FAILED', res.status);
  }

  return (await res.json()) as ApiHealthStatus;
}

export interface FetchArrivalsOptions {
  dataSource: DataSourceMode;
  simulatedMode?: SimulatedApiMode;
  serviceNo?: string;
}

export async function fetchBusArrivals(
  busStopCode: string,
  options: FetchArrivalsOptions = { dataSource: 'live', simulatedMode: 'live-preview' }
): Promise<BusArrivalResponse> {
  const normalized = busStopCode.trim();
  const { dataSource, simulatedMode = 'live-preview', serviceNo } = options;

  if (dataSource === 'live') {
    const params = new URLSearchParams({ BusStopCode: normalized });
    if (serviceNo?.trim()) {
      params.set('ServiceNo', serviceNo.trim());
    }

    const res = await fetch(`${API_CONFIG.arrivalsEndpoint}?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      let errorMsg = `Transit API returned HTTP ${res.status}`;
      let errorCode: string | undefined;
      try {
        const errBody = (await res.json()) as { error?: string; code?: string };
        if (errBody.error) errorMsg = errBody.error;
        if (errBody.code) errorCode = errBody.code;
      } catch {
        // Fallback to HTTP status message
      }
      throw new BusApiError(errorMsg, errorCode, res.status);
    }

    const payload = (await res.json()) as BusArrivalResponse;
    return {
      BusStopCode: payload.BusStopCode ?? normalized,
      Services: Array.isArray(payload.Services) ? payload.Services : [],
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
      isPreviewData: false,
    };
  }

  // Preview mode simulation for UI resilience testing or when LTA_ACCOUNT_KEY is not yet added
  const delayMs = simulatedMode === 'slow-network' ? 950 : 180;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (simulatedMode === 'api-error') {
    throw new BusApiError(
      'Simulated error: Unable to reach transit arrival feed.',
      'SIMULATED_ERROR',
      502
    );
  }

  if (simulatedMode === 'empty-stop') {
    return {
      BusStopCode: normalized,
      Services: [],
      updatedAt: new Date().toISOString(),
      isPreviewData: true,
    };
  }

  const matchedStop = getStopByCode(normalized);
  if (matchedStop) {
    const result = generateSimulatedArrivals(matchedStop);
    if (serviceNo?.trim()) {
      result.Services = result.Services.filter(
        (s) => s.ServiceNo.toLowerCase() === serviceNo.trim().toLowerCase()
      );
    }
    return result;
  }

  if (/^\d{5}$/.test(normalized)) {
    const fallbackPreviewStop: BusStop = {
      BusStopCode: normalized,
      RoadName: 'Custom Bus Stop Preview',
      Description: `Bus Stop ${normalized}`,
      Region: 'Central',
      Latitude: 1.3521,
      Longitude: 103.8198,
      Services: ['12', '51', '65', '106', '174'],
    };
    return generateSimulatedArrivals(fallbackPreviewStop);
  }

  throw new BusApiError(
    'Enter a valid 5-digit Singapore bus stop code (e.g. 04121).',
    'INVALID_BUS_STOP_CODE',
    400
  );
}
