export type BusOperator = 'SBST' | 'SMRT' | 'TTS' | 'GAS';

export type BusLoad = 'SEA' | 'SDA' | 'LSD' | '';

export type BusType = 'SD' | 'DD' | 'BD' | '';

export type BusFeature = 'WAB' | '';

export type BusStopRegion = 'Central' | 'East' | 'West' | 'North' | 'North-East';

export interface NextBusSlot {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string; // ISO 8601 timestamp string
  Monitored: number; // 1 = live GPS, 0 = schedule-based
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: BusLoad;
  Feature: BusFeature;
  Type: BusType;
}

export interface BusServiceArrival {
  ServiceNo: string;
  Operator: BusOperator;
  NextBus: NextBusSlot;
  NextBus2: NextBusSlot;
  NextBus3: NextBusSlot;
  destinationName?: string;
  frequencyRange?: string;
  firstLastBus?: string;
}

export interface BusArrivalResponse {
  BusStopCode: string;
  Services: BusServiceArrival[];
  updatedAt: string;
  isPreviewData?: boolean;
}

export interface BusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Region: BusStopRegion;
  Latitude: number;
  Longitude: number;
  Services: string[];
  mrtNearby?: string;
}

export interface FavoriteStop {
  BusStopCode: string;
  customLabel?: string;
  pinnedServices: string[];
  addedAt: number;
}

export type AppView = 'arrivals' | 'favourites' | 'directory' | 'api';

export type DataSourceMode = 'live' | 'preview';

export type SimulatedApiMode = 'live-preview' | 'slow-network' | 'empty-stop' | 'api-error';

export interface ApiHealthStatus {
  ok: boolean;
  service?: string;
  ltaConfigured: boolean;
  endpoint?: string;
  timestamp: string;
}
