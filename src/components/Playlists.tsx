import { List, Lock, Users } from 'lucide-react';
import type { Playlist } from '../types/spotify';
import { usePlaylists } from '../hooks/useSpotify';
import { decodeHtmlEntities } from '../utils/formatters';
import CoverImage from './CoverImage';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SpotifyLink from './SpotifyLink';
import StatCard from './StatCard';

/** Track count; Spotify renamed `tracks` to `items` in February 2026. */
function trackCount(playlist: Playlist): number {
  return playlist.items?.total ?? playlist.tracks?.total ?? 0;
}

export default function Playlists() {
  const { data: playlists, isPending, isError, error, refetch } = usePlaylists();

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (playlists.length === 0) return <EmptyState>No playlists found</EmptyState>;

  const totalTracks = playlists.reduce((sum, p) => sum + trackCount(p), 0);
  const publicCount = playlists.filter((p) => p.public).length;
  const collaborativeCount = playlists.filter((p) => p.collaborative).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Playlists" value={playlists.length} highlight />
        <StatCard label="Total Tracks" value={totalTracks.toLocaleString()} />
        <StatCard
          label="Public / Private"
          value={`${publicCount} / ${playlists.length - publicCount}`}
        />
        <StatCard label="Collaborative" value={collaborativeCount} />
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Playlists">
        {playlists.map((playlist) => (
          <li key={playlist.id} className="card transition-all hover:bg-gray-700/50">
            <CoverImage
              images={playlist.images}
              alt={`Cover for ${playlist.name}`}
              size={300}
              className="mb-4 aspect-square w-full rounded-lg"
              fallbackIcon={List}
            />

            <div className="mb-2 flex items-start justify-between gap-2">
              <h4 className="line-clamp-2 flex-1 font-semibold">{playlist.name}</h4>
              <SpotifyLink href={playlist.external_urls.spotify} label={playlist.name} />
            </div>

            {playlist.description && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-400">
                {decodeHtmlEntities(playlist.description)}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{trackCount(playlist).toLocaleString()} tracks</span>
              {!playlist.public && (
                <span className="flex items-center gap-1">
                  <Lock size={14} aria-hidden="true" />
                  Private
                </span>
              )}
              {playlist.collaborative && (
                <span className="flex items-center gap-1">
                  <Users size={14} aria-hidden="true" />
                  Collab
                </span>
              )}
            </div>

            {playlist.owner.display_name && (
              <p className="mt-2 text-xs text-gray-400">By {playlist.owner.display_name}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
