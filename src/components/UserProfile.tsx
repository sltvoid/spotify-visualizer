import { ExternalLink, LogOut, User } from 'lucide-react';
import { useCurrentUser } from '../hooks/useSpotify';
import { logout } from '../utils/auth';
import CoverImage from './CoverImage';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-gray-400">
      {label} <span className="font-semibold text-white capitalize">{value}</span>
    </span>
  );
}

export default function UserProfile() {
  const { data: user, isPending, isError, error, refetch } = useCurrentUser();

  if (isPending) {
    return (
      <div className="card">
        <LoadingSpinner label="Loading profile" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card">
        <ErrorMessage error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const name = user.display_name || user.id;

  return (
    <section className="card" aria-label="User profile">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <CoverImage
            images={user.images}
            alt={`Profile photo of ${name}`}
            size={64}
            className="h-16 w-16 rounded-full shadow-lg ring-2 ring-white/20"
            fallbackIcon={User}
          />

          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            {/* Spotify only returns these fields to apps with extended API access. */}
            {user.email && <p className="text-gray-400">{user.email}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {user.followers && (
                <ProfileDetail label="Followers:" value={user.followers.total.toLocaleString()} />
              )}
              {user.country && <ProfileDetail label="Country:" value={user.country} />}
              {user.product && <ProfileDetail label="Plan:" value={user.product} />}
            </div>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <a
            href={user.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex flex-1 items-center justify-center gap-2 sm:flex-initial"
          >
            <ExternalLink size={16} aria-hidden="true" />
            <span>Profile</span>
            <span className="sr-only">(opens in new tab)</span>
          </a>
          <button
            type="button"
            onClick={logout}
            className="btn-secondary flex flex-1 items-center justify-center gap-2 sm:flex-initial"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </section>
  );
}
