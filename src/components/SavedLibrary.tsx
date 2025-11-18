import { useState, useEffect } from 'react';
import { Music, Download } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { SavedTrack } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

export default function SavedLibrary() {
  const [tracks, setTracks] = useState<SavedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadLimit, setLoadLimit] = useState(100);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await spotifyService.getSavedTracks(loadLimit);
        setTracks(data);
      } catch (err) {
        setError('Failed to load your library');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [loadLimit]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  const totalDuration = tracks.reduce((sum, { track }) => sum + track.duration_ms, 0);
  const hours = Math.floor(totalDuration / 3600000);
  const minutes = Math.floor((totalDuration % 3600000) / 60000);

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportToCSV = () => {
    const csv = [
      ['Track', 'Artist', 'Album', 'Duration', 'Added Date'].join(','),
      ...tracks.map(({ track, added_at }) =>
        [
          `"${track.name}"`,
          `"${track.artists.map((a) => a.name).join(', ')}"`,
          `"${track.album.name}"`,
          formatDuration(track.duration_ms),
          formatDate(added_at),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spotify-library.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Total Tracks</p>
          <p className="text-3xl font-bold text-spotify-green">{tracks.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Total Duration</p>
          <p className="text-3xl font-bold">{hours}h {minutes}m</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Unique Artists</p>
          <p className="text-3xl font-bold">
            {new Set(tracks.flatMap(({ track }) => track.artists.map((a) => a.id))).size}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Unique Albums</p>
          <p className="text-3xl font-bold">
            {new Set(tracks.map(({ track }) => track.album.id)).size}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setLoadLimit(100)}
            className={`btn-secondary ${loadLimit === 100 ? 'bg-spotify-green' : ''}`}
          >
            100 Tracks
          </button>
          <button
            onClick={() => setLoadLimit(500)}
            className={`btn-secondary ${loadLimit === 500 ? 'bg-spotify-green' : ''}`}
          >
            500 Tracks
          </button>
          <button
            onClick={() => setLoadLimit(undefined as any)}
            className={`btn-secondary ${loadLimit === undefined ? 'bg-spotify-green' : ''}`}
          >
            All Tracks
          </button>
        </div>
        <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Track List */}
      <div className="space-y-2">
        {tracks.map(({ track, added_at }, index) => (
          <div key={`${track.id}-${index}`} className="card hover:bg-gray-700/50 transition-all">
            <div className="flex items-center gap-4">
              {track.album.images[2] ? (
                <img
                  src={track.album.images[2].url}
                  alt={track.album.name}
                  className="w-12 h-12 rounded"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center">
                  <Music size={20} className="text-gray-500" />
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

              <div className="text-sm text-gray-500">
                {formatDuration(track.duration_ms)}
              </div>

              <div className="text-xs text-gray-500 hidden lg:block">
                {formatDate(added_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
