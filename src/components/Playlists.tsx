import { useState, useEffect } from 'react';
import { ExternalLink, List, Lock, Users } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { Playlist } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await spotifyService.getPlaylists(50);
        setPlaylists(data);
      } catch (err) {
        setError('Failed to load playlists');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  const totalTracks = playlists.reduce((sum, p) => sum + p.tracks.total, 0);
  const publicPlaylists = playlists.filter((p) => p.public).length;
  const privatePlaylists = playlists.filter((p) => !p.public).length;
  const collaborativePlaylists = playlists.filter((p) => p.collaborative).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Total Playlists</p>
          <p className="text-3xl font-bold text-spotify-green">{playlists.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Total Tracks</p>
          <p className="text-3xl font-bold">{totalTracks}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Public / Private</p>
          <p className="text-3xl font-bold">{publicPlaylists} / {privatePlaylists}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Collaborative</p>
          <p className="text-3xl font-bold">{collaborativePlaylists}</p>
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="card hover:bg-gray-700/50 transition-all">
            {playlist.images && playlist.images[0] ? (
              <img
                src={playlist.images[0].url}
                alt={playlist.name}
                className="w-full aspect-square object-cover rounded-lg mb-4"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <List size={48} className="text-gray-500" />
              </div>
            )}

            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold flex-1 line-clamp-2">{playlist.name}</h4>
              <a
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-spotify-green transition-colors flex-shrink-0"
              >
                <ExternalLink size={18} />
              </a>
            </div>

            {playlist.description && (
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                {playlist.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{playlist.tracks.total} tracks</span>
              {!playlist.public && (
                <span className="flex items-center gap-1">
                  <Lock size={14} />
                  Private
                </span>
              )}
              {playlist.collaborative && (
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  Collab
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              By {playlist.owner.display_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
