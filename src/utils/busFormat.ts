import { BusLoad, BusOperator, BusType } from '../types/bus';

export function getMinutesUntilArrival(estimatedIso: string, nowMs: number = Date.now()): number | null {
  if (!estimatedIso) return null;
  const targetMs = Date.parse(estimatedIso);
  if (Number.isNaN(targetMs)) return null;
  const diffMin = Math.floor((targetMs - nowMs) / 60_000);
  return Math.max(0, diffMin);
}

export function formatArrivalLabel(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes <= 1) return 'Arr';
  return `${minutes}`;
}

export function formatSgtClock(isoString: string): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore',
  });
}

export function getLoadMeta(load: BusLoad): {
  label: string;
  shortLabel: string;
  textClass: string;
  barClass: string;
  barWidth: string;
} {
  switch (load) {
    case 'SEA':
      return {
        label: 'Seats Available',
        shortLabel: 'Seats',
        textClass: 'text-emerald-700',
        barClass: 'bg-emerald-600',
        barWidth: 'w-1/3',
      };
    case 'SDA':
      return {
        label: 'Standing Available',
        shortLabel: 'Standing',
        textClass: 'text-amber-700',
        barClass: 'bg-amber-500',
        barWidth: 'w-2/3',
      };
    case 'LSD':
      return {
        label: 'Limited Standing',
        shortLabel: 'Crowded',
        textClass: 'text-rose-700',
        barClass: 'bg-rose-600',
        barWidth: 'w-full',
      };
    default:
      return {
        label: 'Unavailable',
        shortLabel: 'N/A',
        textClass: 'text-slate-400',
        barClass: 'bg-slate-300',
        barWidth: 'w-0',
      };
  }
}

export function getBusTypeLabel(type: BusType): { code: string; full: string } {
  switch (type) {
    case 'DD':
      return { code: 'DD', full: 'Double Deck' };
    case 'BD':
      return { code: 'BD', full: 'Bendy Bus' };
    case 'SD':
      return { code: 'SD', full: 'Single Deck' };
    default:
      return { code: '—', full: 'Standard' };
  }
}

export function getOperatorFullName(operator: BusOperator): string {
  switch (operator) {
    case 'SBST':
      return 'SBS Transit';
    case 'SMRT':
      return 'SMRT Buses';
    case 'TTS':
      return 'Tower Transit';
    case 'GAS':
      return 'Go-Ahead Singapore';
  }
}
