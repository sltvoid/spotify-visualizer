import type { AudioFeatures, SpotifyAlbum, SpotifyArtist, SpotifyTrack } from '../types/spotify';

/*
 * Pure calculations behind the dashboard charts. Kept free of React so they
 * are easy to test and reuse.
 */

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Average popularity (0-100), ignoring items without a score. Returns null
 * when none have one: Spotify stopped sending `popularity` to Development
 * Mode apps in February 2026.
 */
export function averagePopularity(items: { popularity?: number }[]): number | null {
  return average(items.map((i) => i.popularity).filter((p): p is number => typeof p === 'number'));
}

export function hasPopularity(items: { popularity?: number }[]): boolean {
  return items.some((i) => typeof i.popularity === 'number');
}

/** Counts items per key, sorted by count (highest first). */
export function rankBy<T>(
  items: T[],
  getKeys: (item: T) => string | string[] | null | undefined,
): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const keys = getKeys(item);
    for (const key of Array.isArray(keys) ? keys : keys == null ? [] : [keys]) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function getTopGenres(artists: SpotifyArtist[], limit = 10) {
  return rankBy(artists, (a) => a.genres).slice(0, limit);
}

export interface AlbumWithCount extends SpotifyAlbum {
  trackCount: number;
}

/** Albums ranked by how many of the user's top tracks they contain. */
export function getTopAlbums(tracks: SpotifyTrack[], limit = 20): AlbumWithCount[] {
  const albums = new Map<string, AlbumWithCount>();
  for (const { album } of tracks) {
    const existing = albums.get(album.id);
    if (existing) existing.trackCount++;
    else albums.set(album.id, { ...album, trackCount: 1 });
  }
  return Array.from(albums.values())
    .sort((a, b) => b.trackCount - a.trackCount)
    .slice(0, limit);
}

/** Year from a Spotify release date ("2019", "2019-06", or "2019-06-14"). */
export function getReleaseYear(releaseDate: string | undefined): number | null {
  const year = Number.parseInt(releaseDate?.slice(0, 4) ?? '', 10);
  return Number.isFinite(year) && year > 0 ? year : null;
}

export function getDecadeDistribution(tracks: SpotifyTrack[], limit = 6) {
  return rankBy(tracks, (t) => {
    const year = getReleaseYear(t.album.release_date);
    return year === null ? null : `${Math.floor(year / 10) * 10}s`;
  })
    .slice(0, limit)
    .map(({ name, value }) => ({ decade: name, count: value }));
}

/** 0-100: how varied the genres across the user's top artists are. */
export function getGenreDiversity(artists: SpotifyArtist[]) {
  const allGenres = artists.flatMap((a) => a.genres ?? []);
  const uniqueGenres = new Set(allGenres).size;
  const score =
    allGenres.length === 0 ? 0 : Math.min(100, Math.round((uniqueGenres / allGenres.length) * 200));
  return { score, uniqueGenres };
}

/** 0-100: how often the same artists repeat across the user's top tracks. */
export function getArtistLoyalty(tracks: SpotifyTrack[]) {
  const appearances = rankBy(tracks, (t) => t.artists.map((a) => a.id)).map((a) => a.value);
  const avgAppearances = average(appearances) ?? 0;
  return { score: Math.min(100, Math.round(avgAppearances * 20)), avgAppearances };
}

export function getMoodDistribution(features: AudioFeatures[]) {
  return {
    happy: features.filter((f) => f.valence > 0.6).length,
    neutral: features.filter((f) => f.valence >= 0.4 && f.valence <= 0.6).length,
    sad: features.filter((f) => f.valence < 0.4).length,
  };
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Very High';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Low';
  return 'Very Low';
}

/** Share of `value` in `total` as a percentage, guarding against divide-by-zero. */
export function percentOf(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * 100;
}
