import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TimeRange } from '../types/spotify';
import { useTopArtists } from '../hooks/useSpotify';
import { GREEN_PALETTE, PIE_CHART_OUTER_RADIUS } from '../constants';
import { getTopGenres, percentOf } from '../utils/stats';
import ChartCard from './ChartCard';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface GenreDistributionProps {
  timeRange: TimeRange;
  /** Compact top-5 list for the overview tab. */
  preview?: boolean;
}

const colorAt = (index: number) => GREEN_PALETTE[index % GREEN_PALETTE.length];

function Swatch({ index, size = 'h-3 w-3' }: { index: number; size?: string }) {
  return (
    <span
      className={`${size} shrink-0 rounded-full`}
      style={{ backgroundColor: colorAt(index) }}
      aria-hidden="true"
    />
  );
}

export default function GenreDistribution({ timeRange, preview = false }: GenreDistributionProps) {
  const { data: artists, isPending, isError, error, refetch } = useTopArtists(timeRange);

  const genres = useMemo(() => {
    const top = getTopGenres(artists ?? []);
    const total = top.reduce((sum, g) => sum + g.value, 0);
    return top.map((g, index) => ({
      ...g,
      rank: index + 1,
      percent: percentOf(g.value, total).toFixed(1),
    }));
  }, [artists]);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (genres.length === 0) return <EmptyState>No genre data available</EmptyState>;

  if (preview) {
    return (
      <ol className="space-y-3" aria-label="Top genres preview">
        {genres.slice(0, 5).map((genre, index) => (
          <li
            key={genre.name}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
          >
            <Swatch index={index} />
            <span className="flex-1 truncate font-medium capitalize">{genre.name}</span>
            <span className="shrink-0 text-sm font-semibold text-spotify-green">
              {genre.percent}%
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile: list with progress bars */}
      <div className="md:hidden">
        <ChartCard title="Genre Distribution">
          <ol className="space-y-3">
            {genres.map((genre, index) => (
              <li key={genre.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Swatch index={index} />
                    <span className="font-medium capitalize">{genre.name}</span>
                  </div>
                  <span className="font-semibold text-spotify-green">{genre.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-700" aria-hidden="true">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: colorAt(index), width: `${genre.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </ChartCard>
      </div>

      {/* Desktop: pie chart */}
      <div className="hidden md:block">
        <ChartCard title="Genre Distribution">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={genres}
                cx="50%"
                cy="50%"
                labelLine
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`}
                outerRadius={PIE_CHART_OUTER_RADIUS + 20}
                dataKey="value"
                nameKey="name"
              >
                {genres.map((genre, index) => (
                  <Cell key={genre.name} fill={colorAt(index)} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  const genre = active ? payload?.[0]?.payload : undefined;
                  if (!genre) return null;
                  return (
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-lg">
                      <p className="font-bold text-spotify-green">
                        #{genre.rank} {genre.name}
                      </p>
                      <p className="text-sm text-gray-300">Artists: {genre.value}</p>
                      <p className="text-sm text-gray-300">Share: {genre.percent}%</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Desktop: detail grid */}
      <ol className="hidden gap-4 md:grid md:grid-cols-2" aria-label="Genre details">
        {genres.map((genre, index) => (
          <li key={genre.name} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Swatch index={index} size="h-4 w-4" />
                <div>
                  <h4 className="font-semibold capitalize">{genre.name}</h4>
                  <p className="text-sm text-gray-400">
                    {genre.value} artist{genre.value !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-spotify-green">{genre.percent}%</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
