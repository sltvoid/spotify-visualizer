import type {
  AudioFeatures,
  CursorPaging,
  Paging,
  Playlist,
  RecentlyPlayedTrack,
  SavedTrack,
  SpotifyArtist,
  SpotifyTrack,
  TimeRange,
  UserProfile,
} from '../types/spotify';
import {
  AUDIO_FEATURES_BATCH_SIZE,
  PAGE_SIZE,
  SPOTIFY_API_BASE,
  TOP_ITEMS_LIMIT,
} from '../constants';
import { getValidAccessToken } from '../utils/auth';

/** Error from the Spotify Web API, with the HTTP status when there is one. */
export class SpotifyAPIError extends Error {
  readonly status?: number;
  readonly endpoint: string;
  /** Seconds to wait before retrying (from the Retry-After header on 429s). */
  readonly retryAfter?: number;

  constructor(message: string, endpoint: string, status?: number, retryAfter?: number) {
    super(message);
    this.name = 'SpotifyAPIError';
    this.endpoint = endpoint;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function messageForStatus(status: number): string {
  switch (status) {
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'Spotify denied access to this data. Your app may not have access to this endpoint.';
    case 404:
      return 'This data could not be found on Spotify.';
    case 429:
      return 'Spotify is rate limiting requests. Please wait a moment and try again.';
    default:
      return status >= 500
        ? 'Spotify is having trouble right now. Please try again later.'
        : `Spotify request failed (HTTP ${status}).`;
  }
}

type QueryParams = Record<string, string | number | undefined>;

/** Authenticated GET against the Web API. `path` may be a relative path or a full `next` URL. */
async function request<T>(path: string, params: QueryParams = {}): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new SpotifyAPIError(messageForStatus(401), path, 401);
  }

  const url = new URL(path.startsWith('http') ? path : `${SPOTIFY_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (!response.ok) {
    const retryAfter = Number(response.headers.get('Retry-After')) || undefined;
    throw new SpotifyAPIError(
      messageForStatus(response.status),
      url.pathname,
      response.status,
      retryAfter,
    );
  }

  return response.json() as Promise<T>;
}

/** Follows `next` links until there are no more pages or `maxItems` is reached. */
async function getAllPages<T>(path: string, maxItems?: number): Promise<T[]> {
  const items: T[] = [];
  let next: string | null = path;
  let params: QueryParams = { limit: PAGE_SIZE };

  while (next && (maxItems === undefined || items.length < maxItems)) {
    const page: Paging<T> = await request<Paging<T>>(next, params);
    items.push(...page.items);
    next = page.next;
    params = {}; // `next` already carries limit/offset
  }

  return maxItems === undefined ? items : items.slice(0, maxItems);
}

export function getCurrentUser(): Promise<UserProfile> {
  return request<UserProfile>('/me');
}

export async function getTopArtists(
  timeRange: TimeRange,
  limit: number = TOP_ITEMS_LIMIT,
): Promise<SpotifyArtist[]> {
  const page = await request<Paging<SpotifyArtist>>('/me/top/artists', {
    time_range: timeRange,
    limit,
  });
  return page.items;
}

export async function getTopTracks(
  timeRange: TimeRange,
  limit: number = TOP_ITEMS_LIMIT,
): Promise<SpotifyTrack[]> {
  const page = await request<Paging<SpotifyTrack>>('/me/top/tracks', {
    time_range: timeRange,
    limit,
  });
  return page.items;
}

export async function getRecentlyPlayed(
  limit: number = TOP_ITEMS_LIMIT,
): Promise<RecentlyPlayedTrack[]> {
  const page = await request<CursorPaging<RecentlyPlayedTrack>>('/me/player/recently-played', {
    limit,
  });
  return page.items;
}

/**
 * Audio features for the given tracks. Spotify restricted this endpoint for
 * apps created after 27 Nov 2024, so expect a 403 for most new apps.
 */
export async function getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
  const batches: string[][] = [];
  for (let i = 0; i < trackIds.length; i += AUDIO_FEATURES_BATCH_SIZE) {
    batches.push(trackIds.slice(i, i + AUDIO_FEATURES_BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map((ids) =>
      request<{ audio_features: (AudioFeatures | null)[] }>('/audio-features', {
        ids: ids.join(','),
      }),
    ),
  );

  // Spotify returns null for tracks without analysis.
  return results.flatMap((r) => r.audio_features.filter((f): f is AudioFeatures => f !== null));
}

export function getSavedTracks(maxItems?: number): Promise<SavedTrack[]> {
  return getAllPages<SavedTrack>('/me/tracks', maxItems);
}

export function getPlaylists(maxItems?: number): Promise<Playlist[]> {
  return getAllPages<Playlist>('/me/playlists', maxItems);
}
