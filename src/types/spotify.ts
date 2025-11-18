export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  popularity?: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
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
  display_name: string;
  email: string;
  images: SpotifyImage[];
  followers: {
    total: number;
  };
  country: string;
  product: string;
  external_urls: {
    spotify: string;
  };
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface TopItemsResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface RecentlyPlayedResponse {
  items: RecentlyPlayedTrack[];
}
