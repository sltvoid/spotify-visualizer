import type {
  AudioFeatures,
  SavedAlbum,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyTrack,
} from '../types/spotify';

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

/** "1994-02-01" -> "1990s"; null when the date is unknown. */
export function getDecade(releaseDate: string | undefined): string | null {
  const year = getReleaseYear(releaseDate);
  return year === null ? null : `${Math.floor(year / 10) * 10}s`;
}

export function getDecadeDistribution(tracks: SpotifyTrack[], limit = 6) {
  return rankBy(tracks, (t) => getDecade(t.album.release_date))
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

export interface RankedItem<T> {
  item: T;
  /** 1-based position in the recent list. */
  rank: number;
  /** 1-based position in the baseline list, or null if it wasn't there. */
  previousRank: number | null;
}

export interface FadedItem<T> {
  item: T;
  /** 1-based position in the baseline list. */
  previousRank: number;
}

export interface RankingComparison<T> {
  /** In the recent top list but not in the baseline at all. */
  newEntries: RankedItem<T>[];
  /** Moved up at least `minClimb` places. */
  climbing: RankedItem<T>[];
  /** Near the top of the baseline but missing from the recent list. */
  fading: FadedItem<T>[];
}

/**
 * Compares a recent top list (e.g. last 4 weeks) with a longer baseline
 * (e.g. all time) to find what's new, climbing, and fading.
 */
export function compareRankings<T extends { id: string }>(
  recent: T[],
  baseline: T[],
  { limit = 10, minClimb = 5, fadingFromTop = 20 } = {},
): RankingComparison<T> {
  const baselineRank = new Map(baseline.map((item, index) => [item.id, index + 1]));
  const recentIds = new Set(recent.map((item) => item.id));

  const ranked = recent.map((item, index) => ({
    item,
    rank: index + 1,
    previousRank: baselineRank.get(item.id) ?? null,
  }));

  const newEntries = ranked.filter((r) => r.previousRank === null).slice(0, limit);

  const climbBy = (r: RankedItem<T>) => (r.previousRank ?? r.rank) - r.rank;
  const climbing = ranked
    .filter((r) => r.previousRank !== null && climbBy(r) >= minClimb)
    .sort((a, b) => climbBy(b) - climbBy(a) || a.rank - b.rank)
    .slice(0, limit);

  const fading = baseline
    .map((item, index) => ({ item, previousRank: index + 1 }))
    .slice(0, fadingFromTop)
    .filter(({ item }) => !recentIds.has(item.id))
    .slice(0, limit);

  return { newEntries, climbing, fading };
}

export function summarizeSavedAlbums(saved: SavedAlbum[]) {
  return {
    totalTracks: saved.reduce((sum, { album }) => sum + (album.total_tracks ?? 0), 0),
    uniqueArtists: new Set(saved.flatMap(({ album }) => album.artists.map((a) => a.id))).size,
    topDecade: rankBy(saved, ({ album }) => getDecade(album.release_date))[0]?.name ?? null,
  };
}
