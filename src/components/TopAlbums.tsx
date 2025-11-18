import { useState, useEffect } from 'react';
import { ExternalLink, Disc } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { spotifyService } from '../services/spotify';
import type { TimeRange, SpotifyAlbum } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface TopAlbumsProps {
  timeRange: TimeRange;
}

interface AlbumWithCount extends SpotifyAlbum {
  playCount: number;
}

export default function TopAlbums({ timeRange }: TopAlbumsProps) {
  const [albums, setAlbums] = useState<AlbumWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      setError(null);
      try {
        const tracks = await spotifyService.getTopTracks(timeRange, 50);

        // Count album occurrences
        const albumCounts = new Map<string, { album: SpotifyAlbum; count: number }>();

        tracks.forEach((track) => {
          const existing = albumCounts.get(track.album.id);
          if (existing) {
            existing.count++;
          } else {
            albumCounts.set(track.album.id, { album: track.album, count: 1 });
          }
        });

        // Convert to array and sort by count
        const sortedAlbums = Array.from(albumCounts.values())
          .sort((a, b) => b.count - a.count)
          .map(({ album, count }) => ({
            ...album,
            playCount: count,
          }))
          .slice(0, 20);

        setAlbums(sortedAlbums);
      } catch (err) {
        setError('Failed to load top albums');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  const chartData = albums.slice(0, 10).map((album) => ({
    name: album.name.length > 20 ? album.name.substring(0, 20) + '...' : album.name,
    tracks: album.playCount,
  }));

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Top Albums by Track Count</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" angle={-45} textAnchor="end" height={120} />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="tracks" fill="#1DB954" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Album Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {albums.map((album, index) => (
          <div key={album.id} className="card hover:bg-gray-700/50 transition-all">
            <div className="relative mb-4">
              <span className="absolute -top-2 -left-2 bg-spotify-green text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center z-10 shadow-lg ring-2 ring-gray-900">
                {index + 1}
              </span>
              {album.images[0] ? (
                <img
                  src={album.images[0].url}
                  alt={album.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
                  <Disc size={48} className="text-gray-500" />
                </div>
              )}
            </div>

            <h4 className="font-semibold truncate mb-1">{album.name}</h4>
            {album.artists && album.artists.length > 0 && (
              <p className="text-sm text-gray-400 truncate mb-2">
                {album.artists.map((a) => a.name).join(', ')}
              </p>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-400">
                {album.playCount} {album.playCount === 1 ? 'track' : 'tracks'} in top
              </span>
              <a
                href={album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-spotify-green transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </div>

            {album.release_date && (
              <p className="text-xs text-gray-500 mt-1">
                Released: {new Date(album.release_date).getFullYear()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
