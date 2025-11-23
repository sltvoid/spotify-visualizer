import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { spotifyService } from '../services/spotify';
import type { TimeRange } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';
import { useIsMobile } from '../hooks/useIsMobile';

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
  const isMobile = useIsMobile();

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

  // Custom label renderer - only show on desktop
  const renderLabel = !isMobile
    ? (props: any) => {
        const { name, percent } = props;
        const percentValue = ((percent ?? 0) * 100).toFixed(0);
        return `${name?.length > 12 ? name.substring(0, 12) + '...' : name} (${percentValue}%)`;
      }
    : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="card">
        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Genre Distribution</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 240 : 400}>
          <PieChart>
            <Pie
              data={genreData}
              cx="50%"
              cy="50%"
              labelLine={!isMobile}
              label={renderLabel}
              outerRadius={isMobile ? 65 : 120}
              innerRadius={isMobile ? 35 : 0}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={isMobile ? 2 : 0}
            >
              {genreData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.95)',
                border: '1px solid rgba(55, 65, 81, 0.8)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
              }}
            />
            {!isMobile && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Genre List - More prominent on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {genreData.map((genre, index) => (
          <div key={genre.name} className="card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full shrink-0 ring-2 ring-white/20"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold capitalize text-sm md:text-base truncate">{genre.name}</h4>
                  <p className="text-xs md:text-sm text-gray-400">{genre.value} artists</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base md:text-lg font-bold bg-gradient-to-r from-spotify-green to-spotify-green-light bg-clip-text text-transparent">
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
