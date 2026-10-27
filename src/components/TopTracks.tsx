import { Music } from 'lucide-react';
import type { TimeRange } from '../types/spotify';
import { useTopTracks } from '../hooks/useSpotify';
import { formatDuration, joinArtistNames } from '../utils/formatters';
import CoverImage from './CoverImage';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SpotifyLink from './SpotifyLink';

export default function TopTracks({ timeRange }: { timeRange: TimeRange }) {
  const { data: tracks, isPending, isError, error, refetch } = useTopTracks(timeRange);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (tracks.length === 0) return <EmptyState>No top tracks yet</EmptyState>;

  return (
    <ol className="space-y-4" aria-label="Top tracks">
      {tracks.map((track, index) => (
        <li key={track.id} className="card transition-all duration-200 hover:bg-gray-700/50">
          <div className="flex items-center gap-4">
            <span className="w-8 text-center text-2xl font-bold text-gray-400" aria-hidden="true">
              {index + 1}
            </span>

            <CoverImage
              images={track.album.images}
              alt={`Album cover for ${track.album.name}`}
              size={64}
              className="h-16 w-16 rounded"
              fallbackIcon={Music}
            />

            <div className="min-w-0 flex-1">
              <h4 className="truncate font-semibold">{track.name}</h4>
              <p className="truncate text-sm text-gray-400">{joinArtistNames(track.artists)}</p>
              <p className="mt-1 truncate text-xs text-gray-400">{track.album.name}</p>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              {/* Not returned to Development Mode apps since February 2026. */}
              {track.popularity !== undefined && (
                <div className="text-center">
                  <div className="text-xs text-gray-400">Popularity</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-gray-700" aria-hidden="true">
                      <div
                        className="h-2 rounded-full bg-spotify-green"
                        style={{ width: `${track.popularity}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{track.popularity}</span>
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="text-xs text-gray-400">Duration</div>
                <div className="text-sm font-medium">{formatDuration(track.duration_ms)}</div>
              </div>
            </div>

            <SpotifyLink href={track.external_urls.spotify} label={track.name} size={20} />
          </div>
        </li>
      ))}
    </ol>
  );
}
