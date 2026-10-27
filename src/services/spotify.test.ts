import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../constants';
import {
  getAudioFeatures,
  getCurrentlyPlaying,
  getSavedAlbums,
  getSavedTracks,
  getTopTracks,
  SpotifyAPIError,
} from './spotify';

function json(body: object, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

beforeEach(() => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, 'token');
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, String(Date.now() + 60 * 60 * 1000));
});

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('Spotify API client', () => {
  it('sends the bearer token and query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ items: [], next: null }));
    vi.stubGlobal('fetch', fetchMock);

    await getTopTracks('short_term', 10);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10',
    );
    expect(init.headers.Authorization).toBe('Bearer token');
  });

  it('follows `next` links and stops at maxItems', async () => {
    const page = (n: number, next: string | null) =>
      json({ items: Array.from({ length: 50 }, (_, i) => ({ n: n * 50 + i })), next });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(page(0, 'https://api.spotify.com/v1/me/tracks?offset=50&limit=50'))
      .mockResolvedValueOnce(page(1, 'https://api.spotify.com/v1/me/tracks?offset=100&limit=50'))
      .mockResolvedValueOnce(page(2, null));
    vi.stubGlobal('fetch', fetchMock);

    const tracks = await getSavedTracks(75);

    expect(tracks).toHaveLength(75);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toBe(
      'https://api.spotify.com/v1/me/tracks?offset=50&limit=50',
    );
  });

  it('turns HTTP errors into SpotifyAPIError with status and Retry-After', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json({}, { status: 429, headers: { 'Retry-After': '7' } })),
    );

    const error = await getTopTracks('long_term').catch((e) => e);

    expect(error).toBeInstanceOf(SpotifyAPIError);
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(7);
  });

  it('throws a 401 error without calling Spotify when logged out', async () => {
    localStorage.clear();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(getTopTracks('long_term')).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('drops null audio features', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json({ audio_features: [{ id: 'a' }, null] })),
    );

    await expect(getAudioFeatures(['a', 'b'])).resolves.toEqual([{ id: 'a' }]);
  });

  it('returns null when nothing is playing (204 No Content)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getCurrentlyPlaying()).resolves.toBeNull();
    expect(String(fetchMock.mock.calls[0][0])).toContain('additional_types=episode');
  });

  it('drops the embedded track list from saved albums', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        json({
          items: [{ added_at: 'x', album: { id: 'al', name: 'A', tracks: { items: [1, 2] } } }],
          next: null,
        }),
      ),
    );

    await expect(getSavedAlbums()).resolves.toEqual([
      { added_at: 'x', album: { id: 'al', name: 'A' } },
    ]);
  });
});
