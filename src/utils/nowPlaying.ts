import type { CurrentlyPlaying, SpotifyImage } from '../types/spotify';
import { NOW_PLAYING_IDLE_POLL_MS, NOW_PLAYING_POLL_MS } from '../constants';
import { joinArtistNames } from './formatters';

export interface NowPlayingItem {
  title: string;
  subtitle: string;
  images: SpotifyImage[];
  url: string;
  durationMs: number;
}

/** Normalizes a track or podcast episode for display; null when there's nothing to show (e.g. ads). */
export function getNowPlayingItem(playback: CurrentlyPlaying | null): NowPlayingItem | null {
  const item = playback?.item;
  if (!item) return null;

  if (item.type === 'episode') {
    return {
      title: item.name,
      subtitle: item.show.name,
      images: item.images,
      url: item.external_urls.spotify,
      durationMs: item.duration_ms,
    };
  }

  return {
    title: item.name,
    subtitle: joinArtistNames(item.artists),
    images: item.album.images,
    url: item.external_urls.spotify,
    durationMs: item.duration_ms,
  };
}

/**
 * Playback position at `now`, advancing from the last poll while playing so
 * the progress bar moves smoothly between requests.
 */
export function getLiveProgress(
  playback: CurrentlyPlaying | null,
  fetchedAt: number,
  now: number,
): number {
  const progress = playback?.progress_ms ?? 0;
  const duration = playback?.item?.duration_ms ?? 0;
  if (!playback?.is_playing) return progress;
  return Math.min(duration, progress + Math.max(0, now - fetchedAt));
}

/**
 * How long to wait before polling again: right after the current item should
 * end (so the next song shows up promptly), otherwise every 15s while playing
 * and every 30s when idle.
 */
export function getPollInterval(
  playback: CurrentlyPlaying | null | undefined,
  fetchedAt: number,
  now: number,
): number {
  if (!playback?.is_playing || !playback.item) return NOW_PLAYING_IDLE_POLL_MS;
  const remaining = playback.item.duration_ms - getLiveProgress(playback, fetchedAt, now);
  return Math.min(NOW_PLAYING_POLL_MS, Math.max(2_000, remaining + 1_000));
}
