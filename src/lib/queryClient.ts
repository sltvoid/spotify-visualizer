import { QueryCache, QueryClient } from '@tanstack/react-query';
import { SpotifyAPIError } from '../services/spotify';
import { logout } from '../utils/auth';

const MAX_RETRIES = 2;
// Retrying these won't help: the user must log in again or lacks access.
const NON_RETRYABLE_STATUSES = new Set([400, 401, 403, 404]);

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof SpotifyAPIError && error.status === 401) {
        logout();
      }
    },
  }),
  defaultOptions: {
    queries: {
      // Listening stats change slowly; avoid hammering Spotify's rate limits.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (
          error instanceof SpotifyAPIError &&
          error.status !== undefined &&
          NON_RETRYABLE_STATUSES.has(error.status)
        ) {
          return false;
        }
        return failureCount < MAX_RETRIES;
      },
      retryDelay: (attempt, error) =>
        error instanceof SpotifyAPIError && error.retryAfter
          ? error.retryAfter * 1000
          : Math.min(1000 * 2 ** attempt, 30_000),
    },
  },
});
