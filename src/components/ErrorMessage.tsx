import { AlertTriangle, Info } from 'lucide-react';
import { SpotifyAPIError } from '../services/spotify';
import { getErrorMessage, isAudioFeaturesUnavailable } from '../utils/errors';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
}

/** Inline error for a single section. */
export default function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  // Spotify withholding audio features is an expected limitation, not a failure: show it neutrally.
  if (isAudioFeaturesUnavailable(error)) {
    return (
      <div className="card text-center" role="status">
        <Info className="mx-auto mb-2 h-8 w-8 text-gray-400" aria-hidden="true" />
        <h3 className="mb-1 font-semibold">Audio features aren't available for this app</h3>
        <p className="mx-auto max-w-xl text-sm text-gray-400">{getErrorMessage(error)}</p>
      </div>
    );
  }

  const isPermanent = error instanceof SpotifyAPIError && error.status === 403;

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center" role="alert">
      <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-400" aria-hidden="true" />
      <p className="mb-3 text-red-300">{getErrorMessage(error)}</p>
      {onRetry && !isPermanent && (
        <button type="button" onClick={onRetry} className="btn-secondary text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}
