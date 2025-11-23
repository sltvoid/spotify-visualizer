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
    <div className="space-y-3">
      {tracks.map((track, index) => (
        <div
          key={track.id}
          className="card transition-all duration-200"
        >
          <div className="flex items-start gap-2.5 md:items-center md:gap-4">
            <span className="text-base md:text-2xl font-bold text-gray-500 w-5 md:w-8 text-center shrink-0 mt-1 md:mt-0">
              {index + 1}
            </span>

            {track.album.images[0] ? (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover shrink-0 shadow-md ring-1 ring-white/10"
              />
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Music className="text-gray-500" size={20} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm md:text-base truncate leading-tight">{track.name}</h4>
              <p className="text-xs md:text-sm text-gray-400 truncate mt-0.5">
                {track.artists.map((a) => a.name).join(', ')}
              </p>
              <p className="text-xs text-gray-500 truncate mt-0.5 hidden md:block">
                {track.album.name}
              </p>

              {/* Mobile: Show duration and popularity inline */}
              <div className="flex items-center gap-2 mt-1 md:hidden text-xs text-gray-400">
                <span>{formatDuration(track.duration_ms)}</span>
                <span>•</span>
                <span>{track.popularity}%</span>
              </div>
            </div>

            {/* Desktop: Show full stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Popularity</div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-spotify-green to-spotify-green-light h-2 rounded-full transition-all duration-500"
                      style={{ width: `${track.popularity}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{track.popularity}</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Duration</div>
                <div className="text-sm font-medium">
                  {formatDuration(track.duration_ms)}
                </div>
              </div>
            </div>

            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-spotify-green transition-colors shrink-0 mt-1 md:mt-0"
            >
              <ExternalLink size={16} className="md:w-5 md:h-5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
