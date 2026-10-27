import { useMemo, useState } from 'react';
import { Download, Music } from 'lucide-react';
import { useSavedTracks } from '../hooks/useSpotify';
import {
  createCSV,
  downloadFile,
  formatDate,
  formatDuration,
  formatHoursMinutes,
  joinArtistNames,
} from '../utils/formatters';
import CoverImage from './CoverImage';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import LoadLimitPicker from './LoadLimitPicker';
import StatCard from './StatCard';

export default function SavedTracks() {
  const [loadLimit, setLoadLimit] = useState<number | undefined>(100);
  const {
    data: tracks,
    isPending,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useSavedTracks(loadLimit);

  const summary = useMemo(() => {
    if (!tracks) return null;
    return {
      totalDuration: tracks.reduce((sum, { track }) => sum + track.duration_ms, 0),
      uniqueArtists: new Set(tracks.flatMap(({ track }) => track.artists.map((a) => a.id))).size,
      uniqueAlbums: new Set(tracks.map(({ track }) => track.album.id)).size,
    };
  }, [tracks]);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (tracks.length === 0 || !summary) return <EmptyState>No saved tracks found</EmptyState>;

  const handleExportCSV = () => {
    const headers = ['Track', 'Artist', 'Album', 'Duration', 'Added Date'];
    const rows = tracks.map(({ track, added_at }) => [
      track.name,
      joinArtistNames(track.artists),
      track.album.name,
      formatDuration(track.duration_ms),
      formatDate(added_at),
    ]);
    downloadFile(createCSV(headers, rows), 'spotify-library.csv', 'text/csv');
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4" aria-label="Library statistics">
        <StatCard label="Total Tracks" value={tracks.length.toLocaleString()} highlight />
        <StatCard label="Total Duration" value={formatHoursMinutes(summary.totalDuration)} />
        <StatCard label="Unique Artists" value={summary.uniqueArtists.toLocaleString()} />
        <StatCard label="Unique Albums" value={summary.uniqueAlbums.toLocaleString()} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <LoadLimitPicker
          value={loadLimit}
          onChange={setLoadLimit}
          noun="Tracks"
          loading={isPlaceholderData}
        />
        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-secondary flex items-center gap-2"
          disabled={isPlaceholderData}
        >
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      <ul className="space-y-2" aria-label="Saved tracks">
        {tracks.map(({ track, added_at }, index) => (
          <li key={`${track.id}-${index}`} className="card transition-all hover:bg-gray-700/50">
            <div className="flex items-center gap-4">
              <CoverImage
                images={track.album.images}
                alt={`Album cover for ${track.album.name}`}
                size={48}
                className="h-12 w-12 rounded"
                fallbackIcon={Music}
              />

              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium">{track.name}</h4>
                <p className="truncate text-sm text-gray-400">{joinArtistNames(track.artists)}</p>
              </div>

              <div className="hidden max-w-xs truncate text-sm text-gray-400 md:block">
                {track.album.name}
              </div>

              <div className="text-sm text-gray-500">{formatDuration(track.duration_ms)}</div>

              <div className="hidden text-xs text-gray-500 lg:block">
                <time dateTime={added_at}>{formatDate(added_at)}</time>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
