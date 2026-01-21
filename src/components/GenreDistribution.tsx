import { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TimeRange } from '../types/spotify';
import { useSpotifyData } from '../contexts';
import { PIE_CHART_OUTER_RADIUS } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { ErrorMessage } from './ErrorBoundary';

interface GenreDistributionProps {
  timeRange: TimeRange;
}

const GENRE_COLORS = [
  '#1DB954',
  '#1ED760',
  '#2EBD59',
  '#1AA34A',
  '#158940',
  '#117A37',
  '#0D6B2E',
  '#095C25',
  '#05481C',
  '#023913',
];

interface GenreData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export default function GenreDistribution({ timeRange }: GenreDistributionProps) {
  const { fetchTopArtists, getArtists, loading, errors } = useSpotifyData();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await fetchTopArtists(timeRange);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to load genre data');
      }
    };
    loadData();
  }, [timeRange, fetchTopArtists]);

  const artists = getArtists(timeRange) || [];
  const isLoading = loading.artists && artists.length === 0;
  const error = localError || errors.artists;

  const genreData = useMemo<GenreData[]>(() => {
    const genreCount: Record<string, number> = {};
    artists.forEach((artist) => {
      artist.genres?.forEach((genre) => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    return Object.entries(genreCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [artists]);

  const totalValue = useMemo(
    () => genreData.reduce((sum, g) => sum + g.value, 0),
    [genreData]
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchTopArtists(timeRange)} />;
  if (genreData.length === 0) {
    return <div className="text-gray-400 text-center p-4">No genre data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Mobile View - List with Progress Bars */}
      <div className="card md:hidden">
        <h3 className="text-xl font-bold mb-4">Genre Distribution</h3>
        <div className="space-y-3" role="list" aria-label="Genre distribution list">
          {genreData.map((genre, index) => {
            const percentage = ((genre.value / totalValue) * 100).toFixed(1);
            return (
              <div key={genre.name} className="space-y-1" role="listitem">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: GENRE_COLORS[index % GENRE_COLORS.length] }}
                      aria-hidden="true"
                    />
                    <span className="font-medium capitalize">{genre.name}</span>
                  </div>
                  <span className="text-spotify-green font-semibold">{percentage}%</span>
                </div>
                <div
                  className="bg-gray-700 rounded-full h-2 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={parseFloat(percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${genre.name}: ${percentage}%`}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: GENRE_COLORS[index % GENRE_COLORS.length],
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop View - Pie Chart */}
      <div className="card hidden md:block">
        <h3 className="text-xl font-bold mb-4">Genre Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={genreData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(1)}%)`}
              outerRadius={PIE_CHART_OUTER_RADIUS + 20}
              fill="#8884d8"
              dataKey="value"
            >
              {genreData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0];
                  const rank = genreData.findIndex((g) => g.name === data.name) + 1;
                  return (
                    <div
                      className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg"
                      role="tooltip"
                    >
                      <p className="font-bold text-spotify-green">
                        #{rank} {data.name}
                      </p>
                      <p className="text-sm text-gray-300">Artists: {data.value}</p>
                      <p className="text-sm text-gray-300">
                        Percentage: {((data.payload.percent ?? 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Desktop Detail Grid */}
      <div
        className="hidden md:grid md:grid-cols-2 gap-4"
        role="list"
        aria-label="Genre details"
      >
        {genreData.map((genre, index) => {
          const percentage = ((genre.value / totalValue) * 100).toFixed(1);
          return (
            <div key={genre.name} className="card" role="listitem">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: GENRE_COLORS[index % GENRE_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="font-semibold capitalize">{genre.name}</h4>
                    <p className="text-sm text-gray-400">
                      {genre.value} artist{genre.value !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-spotify-green">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
