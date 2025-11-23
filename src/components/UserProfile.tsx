import { useState, useEffect } from 'react';
import { ExternalLink, User, LogOut } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { UserProfile as UserProfileType } from '../types/spotify';
import { logout } from '../utils/auth';
import LoadingSpinner from './LoadingSpinner';

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await spotifyService.getUserProfile();
        setProfile(data);
      } catch (err) {
        setError('Failed to load user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="card">
        <div className="text-red-400 text-center">{error || 'Profile not found'}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.images && profile.images[0] ? (
            <img
              src={profile.images[0].url}
              alt={profile.display_name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20">
              <User size={32} className="text-gray-400" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold">{profile.display_name}</h2>
            <p className="text-gray-400">{profile.email}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-400">
                <span className="font-semibold text-white">{profile.followers.total}</span> followers
              </span>
              <span className="text-gray-400">
                Country: <span className="font-semibold text-white">{profile.country}</span>
              </span>
              <span className="text-gray-400">
                Plan: <span className="font-semibold text-white capitalize">{profile.product}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={profile.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Profile
          </a>
          <button onClick={logout} className="btn-secondary flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
