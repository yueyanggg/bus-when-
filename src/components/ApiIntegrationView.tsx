import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { API_CONFIG } from '../services/busApi';
import { SimulatedApiMode } from '../types/bus';

interface ApiIntegrationViewProps {
  simulatedMode: SimulatedApiMode;
  onChangeSimulatedMode: (mode: SimulatedApiMode) => void;
  onTestOnBoard: () => void;
}

const ADAPTER_SNIPPET = `// src/services/busApi.ts
export const API_CONFIG = {
  useLiveEndpoint: true,
  arrivalsEndpoint: '/api/lta/bus-arrival',
};

// Backend Express proxy example (keeps LTA AccountKey server-side):
// GET /api/lta/bus-arrival?BusStopCode=09048
// -> https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=09048
// Header: { AccountKey: process.env.LTA_ACCOUNT_KEY }`;

const MODES: { id: SimulatedApiMode; label: string; description: string }[] = [
  {
    id: 'live-preview',
    label: 'Live Preview',
    description: 'Realistic simulated Singapore arrivals with 30s auto-refresh',
  },
  {
    id: 'slow-network',
    label: 'Slow Network',
    description: 'Adds 950ms latency to preview skeleton loading states',
  },
  {
    id: 'empty-stop',
    label: 'Empty / End of Service',
    description: 'Simulates an inactive stop with zero arriving buses',
  },
  {
    id: 'api-error',
    label: 'API Error',
    description: 'Simulates an unreachable feed to verify error & retry UI',
  },
];

export function ApiIntegrationView({
  simulatedMode,
  onChangeSimulatedMode,
  onTestOnBoard,
}: ApiIntegrationViewProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(ADAPTER_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
          API Connection & Preview States
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          This frontend is structured around the LTA DataMall Bus Arrival schema. Switch preview modes below to test UI states, or plug in your backend proxy when ready.
        </p>
      </div>

      {/* Preview State Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Frontend State Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Test loading skeletons, empty-stop states, and API error handling before connecting live data.
            </p>
          </div>
          <button
            type="button"
            onClick={onTestOnBoard}
            className="px-4 py-2 min-h-[38px] text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            Open Arrival Board
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MODES.map((mode) => {
            const active = simulatedMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeSimulatedMode(mode.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  active
                    ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{mode.label}</span>
                  {active && (
                    <span className="text-xs font-semibold text-teal-700">Selected</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{mode.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Adapter Contract Reference */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">
              LTA DataMall Adapter Endpoint
            </h2>
            <p className="text-xs text-slate-500">
              Current endpoint target:{' '}
              <span className="font-mono text-slate-700">{API_CONFIG.arrivalsEndpoint}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-5 text-xs font-mono text-slate-800 bg-slate-50 overflow-x-auto leading-relaxed">
          <code>{ADAPTER_SNIPPET}</code>
        </pre>

        <div className="px-5 py-4 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
          <p>
            <span className="font-semibold text-slate-800">Expected response fields:</span>{' '}
            <span className="font-mono">BusStopCode</span>, <span className="font-mono">Services[]</span> with{' '}
            <span className="font-mono">ServiceNo</span>, <span className="font-mono">Operator</span>, and{' '}
            <span className="font-mono">NextBus / NextBus2 / NextBus3</span> containing{' '}
            <span className="font-mono">EstimatedArrival</span>, <span className="font-mono">Load</span> (SEA/SDA/LSD),{' '}
            <span className="font-mono">Type</span> (SD/DD/BD), and <span className="font-mono">Feature</span> (WAB).
          </p>
        </div>
      </div>
    </section>
  );
}
