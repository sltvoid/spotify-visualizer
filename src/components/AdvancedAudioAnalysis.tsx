import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AudioFeatures, TimeRange } from '../types/spotify';
import { useAudioFeatures } from '../hooks/useSpotify';
import { average, rankBy } from '../utils/stats';
import {
  CHART_AXIS_STROKE,
  CHART_BAR_CURSOR,
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_HEIGHT,
  CHART_TOOLTIP_PROPS,
  GREEN_PALETTE,
  PIE_CHART_OUTER_RADIUS,
} from '../constants';
import { formatCount } from '../utils/formatters';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import StatCard from './StatCard';

// Pitch classes in Spotify's `key` order (0 = C), which is also musical order.
const KEY_NAMES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];

const tracksLabel = (value: unknown) => formatCount(Number(value), 'track');

const TEMPO_RANGES = [
  { name: '< 80 BPM (Slow)', min: 0, max: 80 },
  { name: '80-100 BPM', min: 80, max: 100 },
  { name: '100-120 BPM', min: 100, max: 120 },
  { name: '120-140 BPM', min: 120, max: 140 },
  { name: '140-160 BPM', min: 140, max: 160 },
  { name: '> 160 BPM (Fast)', min: 160, max: Infinity },
];

function analyze(features: AudioFeatures[]) {
  const major = features.filter((f) => f.mode === 1).length;
  const minor = features.filter((f) => f.mode === 0).length;
  // Every key in musical order (C to B), including ones with no tracks.
  const keys = KEY_NAMES.map((name, key) => ({
    name,
    value: features.filter((f) => f.key === key).length,
  }));
  const topKey = keys.reduce((best, key) => (key.value > best.value ? key : best));

  return {
    keys,
    mostCommonKey: topKey.value > 0 ? topKey.name : null,
    modes: [
      { name: 'Major', value: major },
      { name: 'Minor', value: minor },
    ],
    preferredMode: major >= minor ? 'Major' : 'Minor',
    tempos: TEMPO_RANGES.map(({ name, min, max }) => ({
      name,
      count: features.filter((f) => f.tempo >= min && f.tempo < max).length,
    })),
    timeSignatures: rankBy(features, (f) => `${f.time_signature}/4`),
    avgTempo: average(features.map((f) => f.tempo)) ?? 0,
    avgLoudness: average(features.map((f) => f.loudness)) ?? 0,
  };
}

export default function AdvancedAudioAnalysis({ timeRange }: { timeRange: TimeRange }) {
  const { data: features, isPending, isError, error, refetch } = useAudioFeatures(timeRange);
  const stats = useMemo(() => (features?.length ? analyze(features) : null), [features]);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (!stats) return <EmptyState>No audio analysis data available</EmptyState>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Average Tempo" value={`${stats.avgTempo.toFixed(1)} BPM`} highlight />
        <StatCard label="Average Loudness" value={`${stats.avgLoudness.toFixed(1)} dB`} />
        <StatCard label="Most Common Key" value={stats.mostCommonKey ?? 'N/A'} />
        <StatCard label="Mode Preference" value={stats.preferredMode} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Musical Key Distribution">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={stats.keys}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              {/* Axis shows the sharp name only; the tooltip shows both spellings. */}
              <XAxis
                dataKey="name"
                stroke={CHART_AXIS_STROKE}
                interval={0}
                tickFormatter={(name: string) => name.split('/')[0]}
              />
              <YAxis stroke={CHART_AXIS_STROKE} allowDecimals={false} />
              <Tooltip {...CHART_TOOLTIP_PROPS} cursor={CHART_BAR_CURSOR} />
              <Bar
                dataKey="value"
                name="Tracks"
                fill={CHART_COLORS.SPOTIFY_GREEN}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Major vs Minor Keys">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={stats.modes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={PIE_CHART_OUTER_RADIUS}
                dataKey="value"
              >
                {stats.modes.map((mode, index) => (
                  <Cell
                    key={mode.name}
                    fill={index === 0 ? CHART_COLORS.SPOTIFY_GREEN : CHART_COLORS.MUTED}
                  />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_PROPS} formatter={tracksLabel} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tempo Distribution">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={stats.tempos}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              <XAxis
                dataKey="name"
                stroke={CHART_AXIS_STROKE}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke={CHART_AXIS_STROKE} allowDecimals={false} />
              <Tooltip {...CHART_TOOLTIP_PROPS} cursor={CHART_BAR_CURSOR} />
              <Bar
                dataKey="count"
                name="Tracks"
                fill={CHART_COLORS.SPOTIFY_GREEN}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Time Signature">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={stats.timeSignatures}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={PIE_CHART_OUTER_RADIUS}
                dataKey="value"
              >
                {stats.timeSignatures.map((sig, index) => (
                  <Cell key={sig.name} fill={GREEN_PALETTE[index % GREEN_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_PROPS} formatter={tracksLabel} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
