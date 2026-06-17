// src/pages/DashboardPage.tsx
// ============================================================
// Main dashboard page — pulls everything together:
//   - useDashboardStats hook for data
//   - Recharts for line charts
//   - Alert cards based on SAFE_RANGES thresholds
// ============================================================

import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, Thermometer, Droplets, FlaskConical } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAuth } from '../contexts/AuthContext';
import { SAFE_RANGES } from '../types';

// ── Helpers ───────────────────────────────────────────────────

function isOutOfRange(value: number | null | undefined, param: keyof typeof SAFE_RANGES): boolean {
  if (value == null) return false;
  const range = SAFE_RANGES[param];
  return value < range.min || value > range.max;
}

// ── Sub-components ────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: number | null | undefined;
  unit: string;
  icon: React.ReactNode;
  param: keyof typeof SAFE_RANGES;
}

function KpiCard({ label, value, unit, icon, param }: KpiCardProps) {
  const alert = isOutOfRange(value, param);
  return (
    <div
      className={`rounded-2xl p-5 flex items-center gap-4 border ${
        alert
          ? 'bg-red-950/40 border-red-500/50'
          : 'bg-slate-800/60 border-slate-700/50'
      }`}
    >
      <div className={`p-3 rounded-xl ${alert ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${alert ? 'text-red-400' : 'text-white'}`}>
          {value != null ? `${value.toFixed(2)} ${unit}` : '—'}
        </p>
        {alert && (
          <p className="flex items-center gap-1 text-xs text-red-400 mt-0.5">
            <AlertTriangle className="w-3 h-3" />
            Out of safe range
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading, error, refetch } = useDashboardStats({
    refetchIntervalMs: 60_000, // Auto-refresh every minute
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-slate-400">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const { latest, averages, chart } = stats ?? { latest: null, averages: {}, chart: [] };

  // Format chart data for Recharts
  const chartData = chart.map((entry) => ({
    ...entry,
    time: format(new Date(entry.measured_at), 'dd/MM HH:mm'),
  }));

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.username} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Here's how your aquarium is doing over the last 30 days.
        </p>
      </div>

      {/* KPI Cards */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Latest Reading
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard
            label="pH"
            value={latest?.ph}
            unit=""
            icon={<Droplets className="w-5 h-5" />}
            param="ph"
          />
          <KpiCard
            label="Ammonia"
            value={latest?.ammonia_ppm}
            unit="ppm"
            icon={<FlaskConical className="w-5 h-5" />}
            param="ammonia_ppm"
          />
          <KpiCard
            label="Nitrite"
            value={latest?.nitrite_ppm}
            unit="ppm"
            icon={<FlaskConical className="w-5 h-5" />}
            param="nitrite_ppm"
          />
          <KpiCard
            label="Nitrate"
            value={latest?.nitrate_ppm}
            unit="ppm"
            icon={<FlaskConical className="w-5 h-5" />}
            param="nitrate_ppm"
          />
          <KpiCard
            label="Temperature"
            value={latest?.temperature_c}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />}
            param="temperature_c"
          />
        </div>
      </section>

      {/* pH & Ammonia Chart */}
      <section className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-6">
          pH & Ammonia — 30 Day Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9',
              }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="ph"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              name="pH"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="ammonia_ppm"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              name="Ammonia (ppm)"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* 7-day Averages */}
      <section className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">7-Day Averages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          {(Object.keys(SAFE_RANGES) as Array<keyof typeof SAFE_RANGES>).map((key) => {
            const value = averages?.[key as keyof typeof averages];
            const alert = isOutOfRange(value, key);
            const { unit } = SAFE_RANGES[key];
            return (
              <div key={key}>
                <p className="text-xs text-slate-400 uppercase tracking-wider">
                  {key.replace('_ppm', '').replace('_c', '')}
                </p>
                <p className={`text-xl font-bold tabular-nums mt-1 ${alert ? 'text-red-400' : 'text-cyan-400'}`}>
                  {value != null ? `${(value as number).toFixed(2)}${unit}` : '-'}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
