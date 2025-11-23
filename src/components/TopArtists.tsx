import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { SpotifyArtist, TimeRange } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface TopArtistsProps {
  timeRange: TimeRange;
}

export default function TopArtists({ timeRange }: TopArtistsProps) {
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await spotifyService.getTopArtists(timeRange, 20);
        setArtists(data);
      } catch (err) {
        setError('Failed to load top artists');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  const chartData = artists.slice(0, 10).map((artist, index) => ({
    name: artist.name.length > 15 ? artist.name.substring(0, 15) + '...' : artist.name,
    popularity: artist.popularity || 0,
    rank: index + 1,
  }));

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Popularity Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="popularity" fill="#1DB954" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Artist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {artists.map((artist, index) => (
          <div key={artist.id} className="card transition-all duration-300">
            <div className="flex items-start gap-2.5 md:gap-4">
              <div className="relative shrink-0">
                <span className="absolute -top-1.5 -left-1.5 md:-top-2 md:-left-2 bg-gradient-to-br from-spotify-green to-spotify-green-light text-white text-xs font-bold rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center z-10 shadow-glow-green ring-2 ring-white/20">
                  {index + 1}
                </span>
                {artist.images && artist.images[0] ? (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-white/10 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/10">
                    <span className="text-xl md:text-2xl">🎵</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm md:text-base truncate leading-tight">{artist.name}</h4>
                {artist.genres && artist.genres.length > 0 && (
                  <p className="text-xs md:text-sm text-gray-400 truncate mt-0.5">
                    {artist.genres.slice(0, 2).join(', ')}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                  <div className="flex-1 bg-white/10 rounded-full h-1.5 md:h-2 overflow-hidden backdrop-blur-sm">
                    <div
                      className="bg-gradient-to-r from-spotify-green to-spotify-green-light h-full rounded-full shadow-glow-green transition-all duration-500"
                      style={{ width: `${artist.popularity}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">{artist.popularity}</span>
                </div>
              </div>
              <a
                href={artist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-spotify-green transition-colors shrink-0"
              >
                <ExternalLink size={14} className="md:w-4 md:h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
