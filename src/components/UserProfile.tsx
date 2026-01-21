import { useEffect } from 'react';
import { ExternalLink, User, LogOut } from 'lucide-react';
import { useSpotifyData } from '../contexts';
import { logout } from '../utils/auth';
import LoadingSpinner from './LoadingSpinner';
import { ErrorMessage } from './ErrorBoundary';

export default function UserProfile() {
  const { userProfile, fetchUserProfile, loading, errors } = useSpotifyData();

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading.profile) {
    return (
      <div className="card">
        <LoadingSpinner />
      </div>
    );
  }

  if (errors.profile || !userProfile) {
    return (
      <div className="card">
        <ErrorMessage
          message={errors.profile || 'Failed to load profile'}
          onRetry={fetchUserProfile}
        />
      </div>
    );
  }

  return (
    <div className="card" role="region" aria-label="User profile">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {userProfile.images && userProfile.images[0] ? (
            <img
              src={userProfile.images[0].url}
              alt={`Profile photo of ${userProfile.display_name}`}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white/20 shadow-lg"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20"
              aria-label="No profile photo"
            >
              <User size={32} className="text-gray-400" aria-hidden="true" />
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold">{userProfile.display_name}</h2>
            <p className="text-gray-400">{userProfile.email}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
              <span className="text-gray-400">
                <span className="font-semibold text-white">
                  {userProfile.followers.total.toLocaleString()}
                </span>{' '}
                followers
              </span>
              <span className="text-gray-400">
                Country:{' '}
                <span className="font-semibold text-white">{userProfile.country}</span>
              </span>
              <span className="text-gray-400">
                Plan:{' '}
                <span className="font-semibold text-white capitalize">
                  {userProfile.product}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <a
            href={userProfile.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            aria-label="Open Spotify profile (opens in new tab)"
          >
            <ExternalLink size={16} aria-hidden="true" />
            <span>Profile</span>
          </a>
          <button
            onClick={logout}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            aria-label="Log out of your account"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
