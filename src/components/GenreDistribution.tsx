import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { spotifyService } from '../services/spotify';
import type { TimeRange } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface GenreDistributionProps {
  timeRange: TimeRange;
}

const COLORS = [
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

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Genre Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={genreData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {genreData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
