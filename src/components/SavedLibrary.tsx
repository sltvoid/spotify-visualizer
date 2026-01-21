import { useState } from 'react';
import { Music, Download } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { SavedTrack } from '../types/spotify';
import { useDataFetch } from '../hooks';
import { formatDuration, formatDate, createCSV, downloadFile } from '../utils/formatters';
import { LOAD_LIMIT_OPTIONS } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { ErrorMessage } from './ErrorBoundary';

type LoadLimitValue = number | undefined;

export default function SavedLibrary() {
  const [loadLimit, setLoadLimit] = useState<LoadLimitValue>(100);

  const { data: tracks, loading, error, refetch } = useDataFetch<SavedTrack[]>(
    () => spotifyService.getSavedTracks(loadLimit),
    [loadLimit]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!tracks || tracks.length === 0) {
    return <div className="text-gray-400 text-center p-4">No saved tracks found</div>;
  }

  const totalDuration = tracks.reduce((sum, { track }) => sum + track.duration_ms, 0);
  const hours = Math.floor(totalDuration / 3600000);
  const minutes = Math.floor((totalDuration % 3600000) / 60000);
  const uniqueArtists = new Set(tracks.flatMap(({ track }) => track.artists.map((a) => a.id)));
  const uniqueAlbums = new Set(tracks.map(({ track }) => track.album.id));

  const handleExportCSV = () => {
    const headers = ['Track', 'Artist', 'Album', 'Duration', 'Added Date'];
    const rows = tracks.map(({ track, added_at }) => [
      track.name,
      track.artists.map((a) => a.name).join(', '),
      track.album.name,
      formatDuration(track.duration_ms),
      formatDate(added_at),
    ]);

    const csv = createCSV(headers, rows);
    downloadFile(csv, 'spotify-library.csv', 'text/csv');
  };

  const handleLimitChange = (value: LoadLimitValue) => {
    setLoadLimit(value);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        role="region"
        aria-label="Library statistics"
      >
        <div className="card">
          <p className="text-gray-400 text-sm">Total Tracks</p>
          <p className="text-3xl font-bold text-spotify-green">{tracks.length.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Total Duration</p>
          <p className="text-3xl font-bold">
            {hours}h {minutes}m
          </p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Unique Artists</p>
          <p className="text-3xl font-bold">{uniqueArtists.size.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Unique Albums</p>
          <p className="text-3xl font-bold">{uniqueAlbums.size.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Track limit selection">
          {LOAD_LIMIT_OPTIONS.map((option) => (
            <button
              key={option.label}
              onClick={() => handleLimitChange(option.value)}
              className={`btn-secondary ${loadLimit === option.value ? 'bg-spotify-green' : ''}`}
              aria-pressed={loadLimit === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-secondary flex items-center gap-2"
          aria-label="Export library to CSV file"
        >
          <Download size={16} aria-hidden="true" />
          Export CSV
        </button>
      </div>

      {/* Track List */}
      <div className="space-y-2" role="list" aria-label="Saved tracks">
        {tracks.map(({ track, added_at }, index) => (
          <div
            key={`${track.id}-${index}`}
            className="card hover:bg-gray-700/50 transition-all"
            role="listitem"
          >
            <div className="flex items-center gap-4">
              {track.album.images[2] ? (
                <img
                  src={track.album.images[2].url}
                  alt={`Album cover for ${track.album.name}`}
                  className="w-12 h-12 rounded"
                  loading="lazy"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center"
                  aria-label="No album cover available"
                >
                  <Music size={20} className="text-gray-500" aria-hidden="true" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.name}</h4>
                <p className="text-sm text-gray-400 truncate">
                  {track.artists.map((a) => a.name).join(', ')}
                </p>
              </div>

              <div className="hidden md:block text-sm text-gray-400 truncate max-w-xs">
                {track.album.name}
              </div>

              <div className="text-sm text-gray-500" aria-label={`Duration: ${formatDuration(track.duration_ms)}`}>
                {formatDuration(track.duration_ms)}
              </div>

              <div className="text-xs text-gray-500 hidden lg:block">
                <time dateTime={added_at}>{formatDate(added_at)}</time>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
