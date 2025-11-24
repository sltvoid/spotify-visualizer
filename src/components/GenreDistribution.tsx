import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { spotifyService } from '../services/spotify';
import type { TimeRange } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface GenreDistributionProps {
  timeRange: TimeRange;
}

const COLORS = [
  '#1DB954', // Spotify green
  '#1ED760', // Light green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

export default function GenreDistribution({ timeRange }: GenreDistributionProps) {
  const [genreData, setGenreData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true);
      setError(null);
      try {
        const artists = await spotifyService.getTopArtists(timeRange, 50);

        // Count genre occurrences
        const genreCount: { [key: string]: number } = {};
        artists.forEach((artist) => {
          artist.genres?.forEach((genre) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        });

        // Convert to array and sort
        const sortedGenres = Object.entries(genreCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        setGenreData(sortedGenres);
      } catch (err) {
        setError('Failed to load genre distribution');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;
  if (genreData.length === 0) return <div className="text-gray-400 text-center p-4">No genre data available</div>;

  const totalValue = genreData.reduce((sum, g) => sum + g.value, 0);

  return (
    <div className="space-y-6">
      {/* Mobile View - List with Progress Bars */}
      <div className="card md:hidden">
        <h3 className="text-xl font-bold mb-4">Genre Distribution</h3>
        <div className="space-y-3">
          {genreData.map((genre, index) => (
            <div key={genre.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium capitalize">{genre.name}</span>
                </div>
                <span className="text-spotify-green font-semibold">
                  {((genre.value / totalValue) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                    width: `${(genre.value / totalValue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
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
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {genreData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0];
                  const rank = genreData.findIndex(g => g.name === data.name) + 1;
                  return (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                      <p className="font-bold text-spotify-green">#{rank} {data.name}</p>
                      <p className="text-sm text-gray-300">Artists: {data.value}</p>
                      <p className="text-sm text-gray-300">Percentage: {((data.payload.percent ?? 0) * 100).toFixed(1)}%</p>
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
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        {genreData.map((genre, index) => (
          <div key={genre.name} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <h4 className="font-semibold capitalize">{genre.name}</h4>
                  <p className="text-sm text-gray-400">{genre.value} artists</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-spotify-green">
                  {((genre.value / genreData.reduce((sum, g) => sum + g.value, 0)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
