import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../utils/auth';
import { Loader2 } from 'lucide-react';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const token = await handleCallback();
      if (token) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-spotify-green" size={48} />
        <p className="text-xl">Logging you in...</p>
      </div>
    </div>
  );
}
