import { Clock, Music } from 'lucide-react';
import { useRecentlyPlayed } from '../hooks/useSpotify';
import { formatRelativeTime, joinArtistNames } from '../utils/formatters';
import CoverImage from './CoverImage';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SpotifyLink from './SpotifyLink';

export default function RecentlyPlayed() {
  const { data: items, isPending, isError, error, refetch } = useRecentlyPlayed();

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (items.length === 0) return <EmptyState>No recently played tracks</EmptyState>;

  return (
    <ul className="space-y-3" aria-label="Recently played tracks">
      {items.map(({ track, played_at }) => (
        <li
          key={`${track.id}-${played_at}`}
          className="card transition-all duration-200 hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-4">
            <CoverImage
              images={track.album.images}
              alt={`Album cover for ${track.album.name}`}
              size={56}
              className="h-14 w-14 rounded"
              fallbackIcon={Music}
            />

            <div className="min-w-0 flex-1">
              <h4 className="truncate font-medium">{track.name}</h4>
              <p className="truncate text-sm text-gray-400">{joinArtistNames(track.artists)}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-1 text-xs text-gray-400 sm:flex">
                <Clock size={12} aria-hidden="true" />
                <time dateTime={played_at}>{formatRelativeTime(played_at)}</time>
              </div>
              <SpotifyLink href={track.external_urls.spotify} label={track.name} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
