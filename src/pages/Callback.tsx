import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { handleCallback } from '../utils/auth';

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    handleCallback().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate(`/?error=${encodeURIComponent(result.error)}`, { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center" role="status">
      <div className="text-center">
        <LoaderCircle
          className="mx-auto mb-4 animate-spin text-spotify-green"
          size={48}
          aria-hidden="true"
        />
        <p className="text-xl">Logging you in...</p>
      </div>
    </div>
  );
}
