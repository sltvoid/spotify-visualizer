import { Music } from 'lucide-react';
import { getAuthUrl } from '../utils/auth';

export default function Login() {
  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-spotify-green p-6 rounded-full">
            <Music size={64} className="text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
          Spotify Stats
        </h1>

        <p className="text-gray-400 text-lg mb-8">
          Discover your music insights and visualize your listening habits
        </p>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="text-left space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-spotify-green">•</span>
              Top Artists, Tracks & Albums
            </li>
            <li className="flex items-center gap-2">
              <span className="text-spotify-green">•</span>
              Audio Features Analysis
            </li>
            <li className="flex items-center gap-2">
              <span className="text-spotify-green">•</span>
              Genre Distribution
            </li>
            <li className="flex items-center gap-2">
              <span className="text-spotify-green">•</span>
              Listening History Timeline
            </li>
            <li className="flex items-center gap-2">
              <span className="text-spotify-green">•</span>
              Multiple Time Ranges
            </li>
          </ul>
        </div>

        <button onClick={handleLogin} className="btn-primary w-full text-lg">
          Login with Spotify
        </button>

        <p className="text-gray-500 text-sm mt-4">
          We only access your listening data. We don't modify anything.
        </p>
      </div>
    </div>
  );
}
