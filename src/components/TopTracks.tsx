import { useState, useEffect } from 'react';
import { ExternalLink, Music } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { SpotifyTrack, TimeRange } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface TopTracksProps {
  timeRange: TimeRange;
}

export default function TopTracks({ timeRange }: TopTracksProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await spotifyService.getTopTracks(timeRange, 50);
        setTracks(data);
      } catch (err) {
        setError('Failed to load top tracks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className="card hover:bg-gray-700/50 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-500 w-8 text-center">
              {index + 1}
            </span>

            {track.album.images[0] ? (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-16 h-16 rounded object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded bg-gray-700 flex items-center justify-center">
                <Music className="text-gray-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{track.name}</h4>
              <p className="text-sm text-gray-400 truncate">
                {track.artists.map((a) => a.name).join(', ')}
              </p>
              <p className="text-xs text-gray-500 truncate mt-1">
                {track.album.name}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-500">Popularity</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-spotify-green h-2 rounded-full"
                      style={{ width: `${track.popularity}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{track.popularity}</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-500">Duration</div>
                <div className="text-sm font-medium">
                  {formatDuration(track.duration_ms)}
                </div>
              </div>
            </div>

            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-spotify-green transition-colors"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
