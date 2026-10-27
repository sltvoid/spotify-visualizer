import { useMemo, useState } from 'react';
import { Disc, Download } from 'lucide-react';
import { useSavedAlbums } from '../hooks/useSpotify';
import { createCSV, downloadFile, formatDate, joinArtistNames } from '../utils/formatters';
import { getReleaseYear, summarizeSavedAlbums } from '../utils/stats';
import CoverImage from './CoverImage';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import LoadLimitPicker from './LoadLimitPicker';
import SpotifyLink from './SpotifyLink';
import StatCard from './StatCard';

export default function SavedAlbums() {
  const [loadLimit, setLoadLimit] = useState<number | undefined>(100);
  const {
    data: saved,
    isPending,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useSavedAlbums(loadLimit);

  const summary = useMemo(() => (saved ? summarizeSavedAlbums(saved) : null), [saved]);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (saved.length === 0 || !summary) return <EmptyState>No saved albums found</EmptyState>;

  const handleExportCSV = () => {
    const headers = ['Album', 'Artist', 'Release Date', 'Tracks', 'Added Date'];
    const rows = saved.map(({ album, added_at }) => [
      album.name,
      joinArtistNames(album.artists),
      album.release_date,
      String(album.total_tracks),
      formatDate(added_at),
    ]);
    downloadFile(createCSV(headers, rows), 'spotify-albums.csv', 'text/csv');
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-4" aria-label="Album statistics">
        <StatCard label="Saved Albums" value={saved.length.toLocaleString()} highlight />
        <StatCard label="Total Tracks" value={summary.totalTracks.toLocaleString()} />
        <StatCard label="Unique Artists" value={summary.uniqueArtists.toLocaleString()} />
        <StatCard label="Top Decade" value={summary.topDecade ?? 'N/A'} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <LoadLimitPicker
          value={loadLimit}
          onChange={setLoadLimit}
          noun="Albums"
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

      <ul
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        aria-label="Saved albums"
      >
        {saved.map(({ album, added_at }) => {
          const year = getReleaseYear(album.release_date);
          return (
            <li key={album.id} className="card p-4 transition-all hover:bg-gray-700/50">
              <CoverImage
                images={album.images}
                alt={`Album cover for ${album.name}`}
                size={220}
                className="mb-3 aspect-square w-full rounded-lg"
                fallbackIcon={Disc}
              />
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <h4 className="truncate font-semibold">{album.name}</h4>
                  <p className="truncate text-sm text-gray-400">{joinArtistNames(album.artists)}</p>
                </div>
                <SpotifyLink href={album.external_urls.spotify} label={album.name} size={16} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {[year, `${album.total_tracks} tracks`].filter(Boolean).join(' · ')}
              </p>
              <p className="text-xs text-gray-500">
                Saved <time dateTime={added_at}>{formatDate(added_at)}</time>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
