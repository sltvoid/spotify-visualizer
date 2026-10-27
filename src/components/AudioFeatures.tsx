import { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { TimeRange } from '../types/spotify';
import { useAudioFeatures } from '../hooks/useSpotify';
import { average } from '../utils/stats';
import {
  CHART_AXIS_STROKE,
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
} from '../constants';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const FEATURES = [
  { key: 'danceability', name: 'Danceability', description: 'How suitable a track is for dancing' },
  { key: 'energy', name: 'Energy', description: 'Intensity and activity level' },
  { key: 'valence', name: 'Valence', description: 'Musical positiveness (happy vs sad)' },
  { key: 'acousticness', name: 'Acousticness', description: 'Confidence the track is acoustic' },
  {
    key: 'instrumentalness',
    name: 'Instrumentalness',
    description: 'Predicts if track contains no vocals',
  },
  { key: 'liveness', name: 'Liveness', description: 'Presence of an audience' },
  { key: 'speechiness', name: 'Speechiness', description: 'Presence of spoken words' },
] as const;

export default function AudioFeatures({ timeRange }: { timeRange: TimeRange }) {
  const { data: features, isPending, isError, error, refetch } = useAudioFeatures(timeRange);

  // Average of each feature as a 0-100 percentage.
  const averages = useMemo(() => {
    if (!features?.length) return null;
    return FEATURES.map((feature) => ({
      ...feature,
      value: (average(features.map((f) => f[feature.key])) ?? 0) * 100,
    }));
  }, [features]);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (!averages) return <EmptyState>No audio feature data available</EmptyState>;

  return (
    <div className="space-y-6">
      <ChartCard title="Average Audio Features">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={averages.map(({ name, value }) => ({ feature: name, value }))}>
            <PolarGrid stroke={CHART_GRID_STROKE} />
            <PolarAngleAxis dataKey="feature" stroke={CHART_AXIS_STROKE} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={CHART_AXIS_STROKE} />
            <Radar
              name="Features"
              dataKey="value"
              stroke={CHART_COLORS.SPOTIFY_GREEN}
              fill={CHART_COLORS.SPOTIFY_GREEN}
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value) => `${Number(value).toFixed(1)}%`}
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Audio feature breakdown">
        {averages.map(({ key, name, description, value }) => (
          <li key={key} className="card">
            <div className="mb-2 flex items-start justify-between">
              <h4 className="font-semibold">{name}</h4>
              <span className="text-lg font-bold text-spotify-green">{value.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-gray-400">{description}</p>
            <div
              className="mt-3 h-2 rounded-full bg-gray-700"
              role="progressbar"
              aria-valuenow={Math.round(value)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={name}
            >
              <div
                className="h-2 rounded-full bg-spotify-green transition-all duration-500"
                style={{ width: `${value}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
