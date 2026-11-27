import {
  BusArrivalResponse,
  BusLoad,
  BusOperator,
  BusServiceArrival,
  BusStop,
  BusType,
  NextBusSlot,
} from '../types/bus';

export const SINGAPORE_BUS_STOPS: BusStop[] = [
  {
    BusStopCode: '09048',
    RoadName: 'Orchard Rd',
    Description: 'Orchard Stn / Tang Plaza',
    Region: 'Central',
    Latitude: 1.3048,
    Longitude: 103.8318,
    Services: ['7', '14', '16', '36', '65', '77', '106', '111', '123', '174', '190', '502', '972'],
    mrtNearby: 'Orchard (NS22 / TE14)',
  },
  {
    BusStopCode: '09047',
    RoadName: 'Orchard Rd',
    Description: 'Lucky Plaza',
    Region: 'Central',
    Latitude: 1.3044,
    Longitude: 103.8339,
    Services: ['7', '14', '16', '65', '106', '111', '123', '175', '502'],
    mrtNearby: 'Orchard (NS22 / TE14)',
  },
  {
    BusStopCode: '04121',
    RoadName: 'Nth Bridge Rd',
    Description: 'City Hall Stn Exit B',
    Region: 'Central',
    Latitude: 1.2932,
    Longitude: 103.8521,
    Services: ['7', '32', '51', '61', '63', '80', '124', '145', '166', '174', '197', '851'],
    mrtNearby: 'City Hall (EW13 / NS25)',
  },
  {
    BusStopCode: '01113',
    RoadName: 'Victoria St',
    Description: 'Bugis Stn Exit A',
    Region: 'Central',
    Latitude: 1.3005,
    Longitude: 103.8559,
    Services: ['2', '7', '12', '32', '33', '51', '61', '63', '80', '130', '133', '175', '197'],
    mrtNearby: 'Bugis (EW12 / DT14)',
  },
  {
    BusStopCode: '03019',
    RoadName: 'Robinson Rd',
    Description: 'Raffles Place Stn / Robinson 77',
    Region: 'Central',
    Latitude: 1.2798,
    Longitude: 103.8501,
    Services: ['10', '70', '97', '100', '106', '107', '130', '131', '162', '196'],
    mrtNearby: 'Raffles Place (EW14 / NS26)',
  },
  {
    BusStopCode: '03509',
    RoadName: 'Bayfront Ave',
    Description: 'Marina Bay Sands Hotel',
    Region: 'Central',
    Latitude: 1.2836,
    Longitude: 103.8601,
    Services: ['97', '106', '133', '502', '518'],
    mrtNearby: 'Bayfront (CE1 / DT16)',
  },
  {
    BusStopCode: '14141',
    RoadName: 'Telok Blangah Rd',
    Description: 'HarbourFront Stn / VivoCity',
    Region: 'Central',
    Latitude: 1.2646,
    Longitude: 103.8225,
    Services: ['10', '30', '57', '61', '65', '80', '93', '97', '100', '143', '145', '166', '188'],
    mrtNearby: 'HarbourFront (NE1 / CC29)',
  },
  {
    BusStopCode: '05022',
    RoadName: 'Eu Tong Sen St',
    Description: 'Chinatown Stn Exit C',
    Region: 'Central',
    Latitude: 1.2845,
    Longitude: 103.8437,
    Services: ['2', '12', '33', '54', '61', '63', '80', '124', '143', '147', '190', '851', '970'],
    mrtNearby: 'Chinatown (NE4 / DT19)',
  },
  {
    BusStopCode: '52009',
    RoadName: 'Toa Payoh Central',
    Description: 'Toa Payoh Int',
    Region: 'Central',
    Latitude: 1.3324,
    Longitude: 103.8475,
    Services: ['8', '26', '28', '31', '57', '59', '73', '88', '90', '105', '139', '141', '143', '145', '155', '157', '163', '231', '232', '235', '238'],
    mrtNearby: 'Toa Payoh (NS19)',
  },
  {
    BusStopCode: '54009',
    RoadName: 'Ang Mo Kio Ave 8',
    Description: 'Ang Mo Kio Int',
    Region: 'North-East',
    Latitude: 1.3694,
    Longitude: 103.8492,
    Services: ['22', '24', '25', '73', '86', '130', '133', '135', '136', '138', '166', '169', '261', '262', '265', '268', '269'],
    mrtNearby: 'Ang Mo Kio (NS16)',
  },
  {
    BusStopCode: '66009',
    RoadName: 'Serangoon Central',
    Description: 'Serangoon Int',
    Region: 'North-East',
    Latitude: 1.3507,
    Longitude: 103.8732,
    Services: ['22', '43', '45', '53', '70', '81', '82', '100', '101', '103', '105', '109', '158', '315', '317'],
    mrtNearby: 'Serangoon (NE12 / CC13)',
  },
  {
    BusStopCode: '64009',
    RoadName: 'Hougang Central',
    Description: 'Hougang Central Int',
    Region: 'North-East',
    Latitude: 1.3712,
    Longitude: 103.8926,
    Services: ['51', '74', '112', '113', '147', '153', '161', '165', '325'],
    mrtNearby: 'Hougang (NE14)',
  },
  {
    BusStopCode: '65009',
    RoadName: 'Punggol Pl',
    Description: 'Punggol Temp Int',
    Region: 'North-East',
    Latitude: 1.4038,
    Longitude: 103.9022,
    Services: ['3', '34', '43', '50', '62', '82', '83', '84', '85', '119', '136', '381', '382', '386'],
    mrtNearby: 'Punggol (NE17 / PTC)',
  },
  {
    BusStopCode: '75009',
    RoadName: 'Tampines Central 1',
    Description: 'Tampines Int',
    Region: 'East',
    Latitude: 1.3539,
    Longitude: 103.9437,
    Services: ['3', '4', '8', '10', '19', '20', '22', '23', '27', '28', '29', '31', '34', '37', '38', '65', '67', '69', '72', '81', '291', '292', '293'],
    mrtNearby: 'Tampines (EW2 / DT32)',
  },
  {
    BusStopCode: '84009',
    RoadName: 'Bedok North Dr',
    Description: 'Bedok Int',
    Region: 'East',
    Latitude: 1.3248,
    Longitude: 103.9296,
    Services: ['7', '9', '14', '16', '17', '18', '25', '26', '30', '32', '33', '35', '38', '40', '66', '69', '87', '168', '196', '222', '225', '228', '229'],
    mrtNearby: 'Bedok (EW5)',
  },
  {
    BusStopCode: '77009',
    RoadName: 'Pasir Ris Central',
    Description: 'Pasir Ris Int',
    Region: 'East',
    Latitude: 1.3736,
    Longitude: 103.9491,
    Services: ['3', '5', '6', '12', '15', '17', '21', '58', '88', '89', '109', '354', '358', '359', '403'],
    mrtNearby: 'Pasir Ris (EW1)',
  },
  {
    BusStopCode: '81111',
    RoadName: 'Paya Lebar Rd',
    Description: 'Paya Lebar Stn Exit B',
    Region: 'East',
    Latitude: 1.3183,
    Longitude: 103.8926,
    Services: ['24', '28', '40', '43', '70', '76', '134', '135', '137', '154', '155'],
    mrtNearby: 'Paya Lebar (EW8 / CC9)',
  },
  {
    BusStopCode: '95029',
    RoadName: 'Airport Blvd',
    Description: 'Changi Airport Terminal 1',
    Region: 'East',
    Latitude: 1.3621,
    Longitude: 103.9901,
    Services: ['24', '27', '34', '36', '53', '110', '858'],
    mrtNearby: 'Changi Airport (CG2)',
  },
  {
    BusStopCode: '28009',
    RoadName: 'Jurong Gateway Rd',
    Description: 'Jurong East Int',
    Region: 'West',
    Latitude: 1.3331,
    Longitude: 103.7418,
    Services: ['41', '49', '51', '52', '66', '78', '79', '97', '98', '105', '143', '160', '176', '183', '197', '333', '334', '335', '506'],
    mrtNearby: 'Jurong East (EW24 / NS1)',
  },
  {
    BusStopCode: '22009',
    RoadName: 'Boon Lay Way',
    Description: 'Boon Lay Int',
    Region: 'West',
    Latitude: 1.3392,
    Longitude: 103.7056,
    Services: ['30', '79', '154', '157', '172', '174', '178', '179', '180', '181', '182', '187', '192', '193', '194', '198', '199', '240', '241', '242', '243', '246', '249', '251', '252'],
    mrtNearby: 'Boon Lay (EW27)',
  },
  {
    BusStopCode: '17171',
    RoadName: 'Commonwealth Ave West',
    Description: 'Clementi Stn',
    Region: 'West',
    Latitude: 1.3151,
    Longitude: 103.7652,
    Services: ['14', '52', '96', '105', '106', '147', '154', '165', '166', '175', '183', '184', '185', '189', '282', '284', '285'],
    mrtNearby: 'Clementi (EW23)',
  },
  {
    BusStopCode: '43009',
    RoadName: 'Bukit Batok Central',
    Description: 'Bukit Batok Int',
    Region: 'West',
    Latitude: 1.3491,
    Longitude: 103.7495,
    Services: ['61', '77', '106', '173', '177', '189', '852', '941', '945', '947', '990'],
    mrtNearby: 'Bukit Batok (NS2)',
  },
  {
    BusStopCode: '46009',
    RoadName: 'Woodlands Sq',
    Description: 'Woodlands Int',
    Region: 'North',
    Latitude: 1.4372,
    Longitude: 103.7865,
    Services: ['161', '168', '169', '178', '187', '856', '858', '900', '901', '902', '903', '904', '911', '912', '913', '925', '926', '950', '960', '961', '962', '963', '964', '965', '966', '969'],
    mrtNearby: 'Woodlands (NS9 / TE2)',
  },
  {
    BusStopCode: '59009',
    RoadName: 'Yishun Ave 2',
    Description: 'Yishun Int',
    Region: 'North',
    Latitude: 1.4287,
    Longitude: 103.8357,
    Services: ['39', '85', '103', '117', '169', '171', '800', '801', '803', '804', '805', '806', '807', '811', '812', '851', '852', '853', '854', '855', '856', '857', '858', '860'],
    mrtNearby: 'Yishun (NS13)',
  },
  {
    BusStopCode: '44009',
    RoadName: 'Choa Chu Kang Loop',
    Description: 'Choa Chu Kang Int',
    Region: 'North',
    Latitude: 1.3853,
    Longitude: 103.7443,
    Services: ['67', '172', '188', '190', '300', '301', '302', '307', '308', '925', '927', '974', '975', '976', '982E', '983'],
    mrtNearby: 'Choa Chu Kang (NS4 / BP1)',
  },
];

const SERVICE_META: Record<
  string,
  { operator: BusOperator; destination: string; freq: string; firstLast: string }
> = {
  '2': { operator: 'SBST', destination: 'Changi Village Ter', freq: '8–12 min', firstLast: '05:30 – 23:45' },
  '3': { operator: 'SBST', destination: 'Tampines / Pasir Ris Int', freq: '6–10 min', firstLast: '05:25 – 00:05' },
  '7': { operator: 'SBST', destination: 'Clementi Int', freq: '5–9 min', firstLast: '05:30 – 23:55' },
  '8': { operator: 'SBST', destination: 'Tampines Int', freq: '8–12 min', firstLast: '05:45 – 23:40' },
  '10': { operator: 'SBST', destination: 'Kent Ridge Ter', freq: '7–11 min', firstLast: '05:30 – 23:50' },
  '12': { operator: 'SBST', destination: 'New Bridge Rd Ter', freq: '9–14 min', firstLast: '05:40 – 23:35' },
  '14': { operator: 'SBST', destination: 'Bedok / Clementi Int', freq: '6–10 min', firstLast: '05:30 – 23:50' },
  '16': { operator: 'SBST', destination: 'Bukit Merah Int', freq: '7–12 min', firstLast: '05:35 – 23:55' },
  '24': { operator: 'SBST', destination: 'Changi Airport Ter 1/2/3', freq: '10–14 min', firstLast: '05:30 – 23:30' },
  '27': { operator: 'SBST', destination: 'Hougang Central Int', freq: '8–12 min', firstLast: '05:20 – 23:50' },
  '28': { operator: 'SBST', destination: 'Toa Payoh Int', freq: '8–13 min', firstLast: '05:30 – 23:45' },
  '30': { operator: 'SBST', destination: 'Boon Lay Int', freq: '7–11 min', firstLast: '05:30 – 23:55' },
  '32': { operator: 'SBST', destination: 'Buona Vista Ter', freq: '9–13 min', firstLast: '05:45 – 23:40' },
  '34': { operator: 'SBST', destination: 'Punggol Temp Int', freq: '8–12 min', firstLast: '05:30 – 23:50' },
  '36': { operator: 'SBST', destination: 'Changi Airport Ter 1/2/3', freq: '9–13 min', firstLast: '06:00 – 23:58' },
  '43': { operator: 'SBST', destination: 'Upper East Coast Ter', freq: '7–12 min', firstLast: '05:30 – 23:45' },
  '51': { operator: 'SBST', destination: 'Jurong East Int', freq: '8–12 min', firstLast: '05:30 – 23:50' },
  '52': { operator: 'SBST', destination: 'Bishan Int', freq: '7–11 min', firstLast: '05:30 – 23:45' },
  '53': { operator: 'SBST', destination: 'Bishan Int', freq: '8–12 min', firstLast: '05:25 – 23:50' },
  '57': { operator: 'SBST', destination: 'Bishan Int', freq: '7–10 min', firstLast: '05:40 – 23:50' },
  '61': { operator: 'SMRT', destination: 'Bukit Batok Int', freq: '8–12 min', firstLast: '05:35 – 23:45' },
  '63': { operator: 'SBST', destination: 'Eunos Int', freq: '8–13 min', firstLast: '05:40 – 23:40' },
  '65': { operator: 'SBST', destination: 'HarbourFront Int', freq: '6–10 min', firstLast: '05:30 – 23:55' },
  '66': { operator: 'TTS', destination: 'Bedok Int', freq: '9–14 min', firstLast: '05:30 – 23:30' },
  '67': { operator: 'SMRT', destination: 'Choa Chu Kang Int', freq: '7–11 min', firstLast: '05:35 – 23:55' },
  '70': { operator: 'SBST', destination: 'Shenton Way Ter', freq: '8–12 min', firstLast: '05:45 – 23:30' },
  '77': { operator: 'TTS', destination: 'Marina Centre Ter', freq: '8–13 min', firstLast: '05:45 – 23:45' },
  '80': { operator: 'SBST', destination: 'Sengkang Int', freq: '7–11 min', firstLast: '05:30 – 23:55' },
  '88': { operator: 'SBST', destination: 'Pasir Ris Int', freq: '8–12 min', firstLast: '05:35 – 23:45' },
  '97': { operator: 'TTS', destination: 'Marina Centre Ter', freq: '6–10 min', firstLast: '05:30 – 23:55' },
  '100': { operator: 'SBST', destination: 'Ghim Moh Ter', freq: '8–13 min', firstLast: '05:40 – 23:40' },
  '105': { operator: 'SBST', destination: 'Serangoon Int', freq: '7–11 min', firstLast: '05:30 – 23:50' },
  '106': { operator: 'TTS', destination: 'Shenton Way Ter', freq: '6–10 min', firstLast: '05:35 – 23:55' },
  '111': { operator: 'SBST', destination: 'Ghim Moh Ter (Loop)', freq: '10–14 min', firstLast: '06:00 – 23:45' },
  '123': { operator: 'SBST', destination: 'Beach Station (Sentosa)', freq: '10–15 min', firstLast: '06:00 – 23:45' },
  '130': { operator: 'SBST', destination: 'Shenton Way Ter', freq: '9–13 min', firstLast: '05:45 – 23:35' },
  '133': { operator: 'SBST', destination: 'Shenton Way Ter', freq: '8–12 min', firstLast: '05:40 – 23:45' },
  '143': { operator: 'TTS', destination: 'Jurong East Int', freq: '8–12 min', firstLast: '05:35 – 23:50' },
  '145': { operator: 'SBST', destination: 'Buona Vista Ter', freq: '8–12 min', firstLast: '05:35 – 23:45' },
  '147': { operator: 'SBST', destination: 'Clementi Int', freq: '7–11 min', firstLast: '05:30 – 23:55' },
  '154': { operator: 'SBST', destination: 'Eunos Int', freq: '8–12 min', firstLast: '05:30 – 23:50' },
  '161': { operator: 'SBST', destination: 'Woodlands Int', freq: '8–12 min', firstLast: '05:30 – 23:50' },
  '166': { operator: 'SBST', destination: 'HarbourFront Int', freq: '8–12 min', firstLast: '05:30 – 23:45' },
  '168': { operator: 'SBST', destination: 'Bedok Int', freq: '6–10 min', firstLast: '05:30 – 23:55' },
  '169': { operator: 'SMRT', destination: 'Ang Mo Kio Int', freq: '7–11 min', firstLast: '05:30 – 23:50' },
  '174': { operator: 'SBST', destination: 'New Bridge Rd Ter', freq: '8–12 min', firstLast: '05:30 – 23:50' },
  '175': { operator: 'SBST', destination: 'Geylang Lor 1 Ter', freq: '9–14 min', firstLast: '05:45 – 23:35' },
  '179': { operator: 'SBST', destination: 'NTU Campus (Loop)', freq: '4–8 min', firstLast: '06:00 – 00:00' },
  '188': { operator: 'SMRT', destination: 'HarbourFront Int', freq: '9–13 min', firstLast: '05:30 – 23:45' },
  '190': { operator: 'SMRT', destination: 'Choa Chu Kang Int', freq: '5–9 min', firstLast: '05:30 – 00:10' },
  '196': { operator: 'SBST', destination: 'Clementi Int', freq: '7–11 min', firstLast: '05:30 – 23:50' },
  '197': { operator: 'SBST', destination: 'Jurong East Int', freq: '8–12 min', firstLast: '05:35 – 23:45' },
  '502': { operator: 'SBST', destination: 'Marina Centre Ter', freq: '12–16 min', firstLast: '05:45 – 23:30' },
  '518': { operator: 'SBST', destination: 'Bayfront Ave (Loop)', freq: '12–16 min', firstLast: '05:50 – 23:20' },
  '851': { operator: 'SMRT', destination: 'Bukit Merah Int', freq: '8–12 min', firstLast: '05:35 – 23:45' },
  '858': { operator: 'TTS', destination: 'Changi Airport (Loop)', freq: '7–11 min', firstLast: '05:15 – 23:55' },
  '900': { operator: 'SMRT', destination: 'Woodlands Ave 6 (Loop)', freq: '6–10 min', firstLast: '05:25 – 00:15' },
  '960': { operator: 'SMRT', destination: 'Marina Centre Ter', freq: '8–12 min', firstLast: '05:30 – 23:50' },
  '970': { operator: 'SMRT', destination: 'Shenton Way Ter', freq: '9–13 min', firstLast: '05:35 – 23:40' },
  '972': { operator: 'SMRT', destination: 'Bt Panjang (Loop)', freq: '6–10 min', firstLast: '05:40 – 00:05' },
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function inferOperator(serviceNo: string): BusOperator {
  if (SERVICE_META[serviceNo]) return SERVICE_META[serviceNo].operator;
  const num = parseInt(serviceNo, 10);
  if (num >= 800 && num < 995) return 'SMRT';
  if (num >= 350 && num < 360) return 'GAS';
  if (num >= 170 && num < 190) return 'TTS';
  return 'SBST';
}

function buildNextBusSlot(
  minutesFromNow: number,
  seed: number,
  stopCode: string,
  nowMs: number
): NextBusSlot {
  const loads: BusLoad[] = ['SEA', 'SEA', 'SDA', 'SDA', 'LSD'];
  const types: BusType[] = ['DD', 'DD', 'SD', 'SD', 'BD'];
  const load = loads[Math.floor(seededRandom(seed + 1) * loads.length)];
  const type = types[Math.floor(seededRandom(seed + 2) * types.length)];
  const arrivalTime = new Date(nowMs + minutesFromNow * 60_000).toISOString();

  return {
    OriginCode: stopCode,
    DestinationCode: '75009',
    EstimatedArrival: arrivalTime,
    Monitored: 1,
    Latitude: '1.3048',
    Longitude: '103.8318',
    VisitNumber: '1',
    Load: load,
    Feature: 'WAB',
    Type: type,
  };
}

/**
 * Generates deterministic-yet-live-feeling Singapore bus arrivals for preview mode.
 * When you connect LTA DataMall BusArrivalv2 API, replace this call in src/services/busApi.ts.
 */
export function generateSimulatedArrivals(stop: BusStop, nowMs: number = Date.now()): BusArrivalResponse {
  // Subtle time bucket (every 20s) so refreshes visibly advance or cycle smoothly
  const timeBucket = Math.floor(nowMs / 20_000);
  const stopSeed = parseInt(stop.BusStopCode, 10) || 10000;

  const services: BusServiceArrival[] = stop.Services.map((serviceNo, index) => {
    const svcSeed = stopSeed + index * 37 + parseInt(serviceNo, 10) * 13;
    // Cycle arrival phase so buses count down naturally and wrap around
    const cycle1 = 1 + Math.floor(seededRandom(svcSeed + 10) * 10);
    const min1 = Math.max(0, (cycle1 - (timeBucket % (cycle1 + 4)) + (cycle1 + 4)) % (cycle1 + 4));
    const gap1 = 5 + Math.floor(seededRandom(svcSeed + 20) * 7);
    const gap2 = 6 + Math.floor(seededRandom(svcSeed + 30) * 9);

    const min2 = min1 + gap1;
    const min3 = min2 + gap2;

    const meta = SERVICE_META[serviceNo];

    return {
      ServiceNo: serviceNo,
      Operator: inferOperator(serviceNo),
      NextBus: buildNextBusSlot(min1, svcSeed + timeBucket, stop.BusStopCode, nowMs),
      NextBus2: buildNextBusSlot(min2, svcSeed + timeBucket + 5, stop.BusStopCode, nowMs),
      NextBus3: buildNextBusSlot(min3, svcSeed + timeBucket + 11, stop.BusStopCode, nowMs),
      destinationName: meta?.destination ?? `${stop.Region} Regional Loop`,
      frequencyRange: meta?.freq ?? '8–14 min',
      firstLastBus: meta?.firstLast ?? '05:30 – 23:45',
    };
  });

  // Sort numerically (with letter suffixes like 982E handled cleanly)
  services.sort((a, b) => {
    const numA = parseInt(a.ServiceNo, 10);
    const numB = parseInt(b.ServiceNo, 10);
    if (numA !== numB) return numA - numB;
    return a.ServiceNo.localeCompare(b.ServiceNo);
  });

  return {
    BusStopCode: stop.BusStopCode,
    Services: services,
    updatedAt: new Date(nowMs).toISOString(),
    isPreviewData: true,
  };
}
