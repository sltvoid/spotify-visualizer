import type { TimeRange } from '../types/spotify';

// API configuration
export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// API limits
export const TOP_ITEMS_LIMIT = 50;
export const PAGE_SIZE = 50;
export const AUDIO_FEATURES_BATCH_SIZE = 100;

// Now Playing polling (ms). Spotify has no push API for playback state.
export const NOW_PLAYING_POLL_MS = 15_000;
export const NOW_PLAYING_IDLE_POLL_MS = 30_000;

// UI constants
export const CHART_HEIGHT = 300;
export const PIE_CHART_OUTER_RADIUS = 100;
export const ARTIST_NAME_MAX_LENGTH = 15;
export const ALBUM_NAME_MAX_LENGTH = 20;

export const TIME_RANGES: readonly { value: TimeRange; label: string; description: string }[] = [
  { value: 'short_term', label: 'Last 4 Weeks', description: 'Recent trends' },
  { value: 'medium_term', label: 'Last 6 Months', description: 'Current favorites' },
  { value: 'long_term', label: 'All Time', description: 'Your classics' },
];

export const DEFAULT_TIME_RANGE: TimeRange = 'medium_term';

// Chart colors
export const CHART_COLORS = {
  SPOTIFY_GREEN: '#1DB954',
  SPOTIFY_GREEN_DARK: '#1AA34A',
  HAPPY: '#1DB954',
  NEUTRAL: '#FFD700',
  SAD: '#6B7280',
} as const;

// Shades of green used for categorical charts (pie slices, legends).
export const GREEN_PALETTE = [
  '#1DB954',
  '#1ED760',
  '#2EBD59',
  '#1AA34A',
  '#158940',
  '#117A37',
  '#0D6B2E',
  '#095C25',
  '#05481C',
  '#023913',
] as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1F2937',
  border: '1px solid #374151',
  borderRadius: '8px',
} as const;

export const CHART_GRID_STROKE = '#374151';
export const CHART_AXIS_STROKE = '#9CA3AF';

// Browser storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  TOKEN_EXPIRY: 'spotify_token_expiry',
  AUTH_STATE: 'spotify_auth_state',
  CODE_VERIFIER: 'spotify_code_verifier',
  GRANTED_SCOPES: 'spotify_granted_scopes',
} as const;

// OAuth scopes: only what the dashboard reads.
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
] as const;

/** How many saved items to load in the Library tab (undefined = everything). */
export const LOAD_LIMITS = [100, 500, undefined] as const;

export const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview', usesTimeRange: true },
  { id: 'insights', label: 'Insights', usesTimeRange: true },
  { id: 'trending', label: 'Trending', usesTimeRange: false },
  { id: 'artists', label: 'Top Artists', usesTimeRange: true },
  { id: 'tracks', label: 'Top Tracks', usesTimeRange: true },
  { id: 'albums', label: 'Top Albums', usesTimeRange: true },
  { id: 'library', label: 'Library', usesTimeRange: false },
  { id: 'playlists', label: 'Playlists', usesTimeRange: false },
  { id: 'recent', label: 'Recently Played', usesTimeRange: false },
  { id: 'features', label: 'Audio Features', usesTimeRange: true },
  { id: 'advanced', label: 'Advanced Audio', usesTimeRange: true },
  { id: 'genres', label: 'Genres', usesTimeRange: true },
] as const;

export type DashboardTabId = (typeof DASHBOARD_TABS)[number]['id'];
