/*
 * Spotify Web API response types (only the fields this app reads).
 *
 * Since February 2026, Development Mode apps no longer receive some fields
 * (e.g. `popularity`, profile `email`/`country`/`followers`/`product`), so those
 * are optional here and the UI hides whatever is missing.
 * https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
 */

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

interface ExternalUrls {
  spotify: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  popularity?: number;
  external_urls: ExternalUrls;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  artists?: SpotifyArtist[];
  external_urls: ExternalUrls;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity?: number;
  external_urls: ExternalUrls;
}

export interface RecentlyPlayedTrack {
  track: SpotifyTrack;
  played_at: string;
}

export interface AudioFeatures {
  id: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  valence: number;
  tempo: number;
  loudness: number;
  key: number;
  mode: number;
  time_signature: number;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  images?: SpotifyImage[];
  external_urls: ExternalUrls;
  email?: string;
  country?: string;
  product?: string;
  followers?: { total: number };
}

export interface SavedTrack {
  added_at: string;
  track: SpotifyTrack;
}

interface PlaylistItemsRef {
  href: string;
  total: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[] | null;
  /** Renamed from `tracks` in the February 2026 API update. */
  items?: PlaylistItemsRef;
  /** Pre-2026 name for `items`; still returned to Extended Quota apps. */
  tracks?: PlaylistItemsRef;
  owner: {
    id: string;
    display_name: string | null;
  };
  public: boolean | null;
  collaborative: boolean;
  external_urls: ExternalUrls;
}

export interface Paging<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
}

export interface CursorPaging<T> {
  items: T[];
  next: string | null;
}
