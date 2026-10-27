import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { AlertTriangle, Music } from 'lucide-react';
import { getAuthUrl, isAuthConfigured } from '../utils/auth';

const FEATURES = [
  'Top Artists, Tracks & Albums',
  'Listening Insights',
  'Genre Distribution',
  'Recently Played & Playlists',
  'Multiple Time Ranges',
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const configError = isAuthConfigured()
    ? null
    : 'This app is missing its Spotify Client ID. Set VITE_SPOTIFY_CLIENT_ID and rebuild.';
  const error = configError ?? loginError ?? searchParams.get('error');

  const handleLogin = async () => {
    setIsRedirecting(true);
    try {
      window.location.assign(await getAuthUrl());
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Could not start login.');
      setIsRedirecting(false);
    }
  };

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="animate-float rounded-full bg-linear-to-br from-spotify-green to-spotify-green-light p-6 shadow-glow-green-strong">
            <Music size={64} className="text-white drop-shadow-lg" aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-4 bg-linear-to-r from-spotify-green via-green-400 to-spotify-green-light bg-clip-text text-5xl font-bold text-transparent drop-shadow-lg">
          Stats for Spotify
        </h1>

        <p className="mb-8 text-lg text-gray-300">
          Discover your music insights and visualize your listening habits
        </p>

        <section className="card mb-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Features</h2>
          <ul className="space-y-3 text-left text-gray-200">
            {FEATURES.map((feature) => (
              <li key={feature} className="group flex items-center gap-3">
                <span
                  className="text-xl text-spotify-green transition-transform duration-200 group-hover:scale-125"
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="transition-colors duration-200 group-hover:text-white">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {error && (
          <div
            className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left text-red-300"
            role="alert"
          >
            <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={Boolean(configError) || isRedirecting}
          className="btn-primary w-full text-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRedirecting ? 'Redirecting to Spotify...' : 'Login with Spotify'}
        </button>

        <p className="mt-4 text-sm text-gray-400">
          We only read your listening data. We never change anything in your account.
        </p>
      </div>
    </main>
  );
}
