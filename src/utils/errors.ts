import { SpotifyAPIError } from '../services/spotify';

/** Turns any thrown value into a message that is safe to show users. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (
    error instanceof SpotifyAPIError &&
    error.status === 403 &&
    error.endpoint.includes('audio-features')
  ) {
    return 'Spotify no longer provides audio features to apps created after November 27, 2024 (or apps in Development Mode). This section needs an app with extended API access.';
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
