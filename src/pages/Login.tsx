import { Music } from 'lucide-react';
import { getAuthUrl } from '../utils/auth';

export default function Login() {
  const handleLogin = async () => {
    const authUrl = await getAuthUrl();
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-spotify-green to-spotify-green-light p-6 rounded-full shadow-glow-green-strong animate-float">
            <Music size={64} className="text-white drop-shadow-lg" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-spotify-green via-green-400 to-spotify-green-light bg-clip-text text-transparent drop-shadow-lg">
          Spotify Stats
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          Discover your music insights and visualize your listening habits
        </p>

        <div className="card mb-6 backdrop-blur-glass hover:shadow-glass-hover transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-white">Features</h2>
          <ul className="text-left space-y-3 text-gray-200">
            <li className="flex items-center gap-3 group">
              <span className="text-spotify-green text-xl group-hover:scale-125 transition-transform duration-200">•</span>
              <span className="group-hover:text-white transition-colors duration-200">Top Artists, Tracks & Albums</span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="text-spotify-green text-xl group-hover:scale-125 transition-transform duration-200">•</span>
              <span className="group-hover:text-white transition-colors duration-200">Audio Features Analysis</span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="text-spotify-green text-xl group-hover:scale-125 transition-transform duration-200">•</span>
              <span className="group-hover:text-white transition-colors duration-200">Genre Distribution</span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="text-spotify-green text-xl group-hover:scale-125 transition-transform duration-200">•</span>
              <span className="group-hover:text-white transition-colors duration-200">Listening History Timeline</span>
            </li>
            <li className="flex items-center gap-3 group">
              <span className="text-spotify-green text-xl group-hover:scale-125 transition-transform duration-200">•</span>
              <span className="group-hover:text-white transition-colors duration-200">Multiple Time Ranges</span>
            </li>
          </ul>
        </div>

        <button onClick={handleLogin} className="btn-primary w-full text-lg">
          Login with Spotify
        </button>

        <p className="text-gray-400 text-sm mt-4">
          We only access your listening data. We don't modify anything.
        </p>
      </div>
    </div>
  );
}
