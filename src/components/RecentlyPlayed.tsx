import { ExternalLink, Music, Clock } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { RecentlyPlayedTrack } from '../types/spotify';
import { useDataFetch } from '../hooks';
import { formatRelativeTime } from '../utils/formatters';
import { DEFAULT_LIMIT } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { ErrorMessage } from './ErrorBoundary';

export default function RecentlyPlayed() {
  const { data, loading, error, refetch } = useDataFetch<RecentlyPlayedTrack[]>(
    async () => {
      const response = await spotifyService.getRecentlyPlayed(DEFAULT_LIMIT);
      return response.items;
    },
    []
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center p-4">No recently played tracks</div>;
  }

  return (
    <div className="space-y-3" role="list" aria-label="Recently played tracks">
      {data.map((item, index) => (
        <div
          key={`${item.track.id}-${index}`}
          className="card hover:bg-gray-700/50 transition-all duration-200"
          role="listitem"
        >
          <div className="flex items-center gap-4">
            {item.track.album.images[0] ? (
              <img
                src={item.track.album.images[0].url}
                alt={`Album cover for ${item.track.album.name}`}
                className="w-14 h-14 rounded object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className="w-14 h-14 rounded bg-gray-700 flex items-center justify-center"
                aria-label="No album cover available"
              >
                <Music className="text-gray-500" size={20} aria-hidden="true" />
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
                  <Clock size={12} aria-hidden="true" />
                  <time dateTime={item.played_at}>{formatRelativeTime(item.played_at)}</time>
                </div>
              </div>

              <a
                href={item.track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-spotify-green transition-colors"
                aria-label={`Open ${item.track.name} on Spotify (opens in new tab)`}
              >
                <ExternalLink size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
