import { generateSimulatedArrivals, SINGAPORE_BUS_STOPS } from '../data/singaporeStops';
import { BusArrivalResponse, BusStop, SimulatedApiMode } from '../types/bus';

/**
 * Frontend API Adapter Layer
 * -----------------------------------------------------------------------------
 * Currently runs against local preview data (`generateSimulatedArrivals`) so the
 * frontend works out-of-the-box. When ready to connect your LTA DataMall proxy:
 *
 *   1. Set `API_CONFIG.useLiveEndpoint = true`
 *   2. Point `API_CONFIG.arrivalsEndpoint` to your backend proxy route
 *      (e.g. `/api/lta/bus-arrival`) so your LTA AccountKey stays server-side.
 */
export const API_CONFIG = {
  useLiveEndpoint: false,
  arrivalsEndpoint: '/api/lta/bus-arrival',
  stopsEndpoint: '/api/lta/bus-stops',
};

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

export async function fetchBusArrivals(
  busStopCode: string,
  simulatedMode: SimulatedApiMode = 'live-preview'
): Promise<BusArrivalResponse> {
  const normalized = busStopCode.trim();

  if (API_CONFIG.useLiveEndpoint) {
    const res = await fetch(`${API_CONFIG.arrivalsEndpoint}?BusStopCode=${encodeURIComponent(normalized)}`);
    if (!res.ok) {
      throw new Error(`Transit API returned HTTP ${res.status}`);
    }
    const payload = await res.json();
    return {
      BusStopCode: payload.BusStopCode ?? normalized,
      Services: payload.Services ?? [],
      updatedAt: new Date().toISOString(),
      isPreviewData: false,
    };
  }

  // Simulated latency for testing loading & error states
  const delayMs = simulatedMode === 'slow-network' ? 950 : 180;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (simulatedMode === 'api-error') {
    throw new Error('Unable to reach transit arrival feed. Check backend connection or retry.');
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
    return generateSimulatedArrivals(matchedStop);
  }

  // Allow previewing arbitrary valid 5-digit Singapore stop codes so the user can test search UX
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

  throw new Error('Enter a valid 5-digit Singapore bus stop code (e.g. 09048).');
}
