import { Check, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { API_CONFIG } from '../services/busApi';
import { ApiHealthStatus, DataSourceMode, SimulatedApiMode } from '../types/bus';

interface ApiIntegrationViewProps {
  healthStatus: ApiHealthStatus | null;
  isCheckingHealth: boolean;
  onRefreshHealth: () => void;
  dataSource: DataSourceMode;
  onChangeDataSource: (mode: DataSourceMode) => void;
  simulatedMode: SimulatedApiMode;
  onChangeSimulatedMode: (mode: SimulatedApiMode) => void;
  onTestOnBoard: () => void;
}

const SERVERLESS_ENDPOINTS_NOTE = `# Project Root Serverless Endpoints:
GET /api/health
  -> Checks proxy readiness & whether LTA_ACCOUNT_KEY is set

GET /api/busarrival?BusStopCode=04121
GET /api/busarrival?BusStopCode=04121&ServiceNo=7
  -> Proxies https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival
  -> Injects header AccountKey: process.env.LTA_ACCOUNT_KEY server-side`;

const MODES: { id: SimulatedApiMode; label: string; description: string }[] = [
  {
    id: 'live-preview',
    label: 'Live Preview',
    description: 'Realistic simulated Singapore arrivals with 20s auto-refresh',
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
  healthStatus,
  isCheckingHealth,
  onRefreshHealth,
  dataSource,
  onChangeDataSource,
  simulatedMode,
  onChangeSimulatedMode,
  onTestOnBoard,
}: ApiIntegrationViewProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(SERVERLESS_ENDPOINTS_NOTE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
          LTA DataMall v3 Serverless Connection
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Serverless proxy routes at <span className="font-mono text-slate-700">/api/health</span> and{' '}
          <span className="font-mono text-slate-700">/api/busarrival</span> keep your{' '}
          <span className="font-mono text-slate-700">LTA_ACCOUNT_KEY</span> strictly on the server.
        </p>
      </div>

      {/* Live Health & Active Source Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Serverless Proxy Health
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add <span className="font-mono text-slate-700">LTA_ACCOUNT_KEY</span> to your environment secrets and click Check Health.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefreshHealth}
            disabled={isCheckingHealth}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-lg transition-colors self-start sm:self-auto whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Check /api/health</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Proxy Endpoint</p>
            <p className="mt-1 font-mono font-semibold text-slate-900">
              {healthStatus?.ok ? 'Online (/api/health)' : 'Unavailable'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">LTA_ACCOUNT_KEY</p>
            <p
              className={`mt-1 font-semibold ${
                healthStatus?.ltaConfigured ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {healthStatus?.ltaConfigured ? 'Configured on Server' : 'Not Configured Yet'}
            </p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Active Board Feed</p>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeDataSource('live')}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  dataSource === 'live'
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Live LTA v3
              </button>
              <button
                type="button"
                onClick={() => onChangeDataSource('preview')}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  dataSource === 'preview'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview State Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Preview Mode State Simulator
            </h2>
            <p className="text-xs text-slate-500">
              When Preview mode is active, test loading skeletons, empty stops, and error handling.
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
                onClick={() => {
                  onChangeDataSource('preview');
                  onChangeSimulatedMode(mode.id);
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  active && dataSource === 'preview'
                    ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{mode.label}</span>
                  {active && dataSource === 'preview' && (
                    <span className="text-xs font-semibold text-teal-700">Selected</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{mode.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Endpoint Specification Reference */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">
              Serverless Route Contract
            </h2>
            <p className="text-xs text-slate-500">
              Routes:{' '}
              <span className="font-mono text-slate-700">{API_CONFIG.healthEndpoint}</span> ·{' '}
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
                <span>Copy Reference</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-5 text-xs font-mono text-slate-800 bg-slate-50 overflow-x-auto leading-relaxed">
          <code>{SERVERLESS_ENDPOINTS_NOTE}</code>
        </pre>
      </div>
    </section>
  );
}
