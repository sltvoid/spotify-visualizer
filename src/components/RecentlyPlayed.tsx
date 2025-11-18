import { useState, useEffect } from 'react';
import { ExternalLink, Music, Clock } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { RecentlyPlayedTrack } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

export default function RecentlyPlayed() {
  const [tracks, setTracks] = useState<RecentlyPlayedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await spotifyService.getRecentlyPlayed(50);
        setTracks(data.items);
      } catch (err) {
        setError('Failed to load recently played tracks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  const formatPlayedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {tracks.map((item, index) => (
        <div
          key={`${item.track.id}-${index}`}
          className="card hover:bg-gray-700/50 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            {item.track.album.images[0] ? (
              <img
                src={item.track.album.images[0].url}
                alt={item.track.album.name}
                className="w-14 h-14 rounded object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded bg-gray-700 flex items-center justify-center">
                <Music className="text-gray-500" size={20} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{item.track.name}</h4>
              <p className="text-sm text-gray-400 truncate">
                {item.track.artists.map((a) => a.name).join(', ')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {formatPlayedAt(item.played_at)}
                </div>
              </div>

              <a
                href={item.track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-spotify-green transition-colors"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
