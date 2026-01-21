// API Configuration
export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
export const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// API Limits
export const API_BATCH_SIZE = 20;
export const DEFAULT_LIMIT = 50;
export const MAX_SEED_ITEMS = 5;
export const PAGINATION_LIMIT = 50;
export const PLAYLIST_TRACKS_LIMIT = 100;

// UI Constants
export const CHART_HEIGHT = 300;
export const PIE_CHART_OUTER_RADIUS = 100;
export const ARTIST_NAME_MAX_LENGTH = 15;

// Time Ranges
export const TIME_RANGES = [
  { value: 'short_term', label: 'Last 4 Weeks' },
  { value: 'medium_term', label: 'Last 6 Months' },
  { value: 'long_term', label: 'All Time' },
] as const;

// Score thresholds for insights
export const SCORE_THRESHOLDS = {
  VERY_HIGH: 80,
  HIGH: 60,
  MODERATE: 40,
  LOW: 20,
} as const;

// Colors
export const CHART_COLORS = {
  SPOTIFY_GREEN: '#1DB954',
  HAPPY: '#1DB954',
  NEUTRAL: '#FFD700',
  SAD: '#6B7280',
  ENERGY: '#EF4444',
  PURPLE: '#8B5CF6',
  BLUE: '#3B82F6',
  ORANGE: '#F97316',
} as const;

// Tooltip styles for Recharts
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1F2937',
  border: '1px solid #374151',
  borderRadius: '8px',
} as const;

// Grid stroke color for charts
export const CHART_GRID_STROKE = '#374151';
export const CHART_AXIS_STROKE = '#9CA3AF';

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  AUTH_STATE: 'spotify_auth_state',
  CODE_VERIFIER: 'spotify_code_verifier',
  TOKEN_EXPIRY: 'spotify_token_expiry',
} as const;

// OAuth scopes
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-library-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-follow-read',
] as const;

// Load limit options for library
export const LOAD_LIMIT_OPTIONS = [
  { value: 100, label: '100 Tracks' },
  { value: 500, label: '500 Tracks' },
  { value: undefined, label: 'All Tracks' },
] as const;

// Tab configuration
export const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'insights', label: 'Insights' },
  { id: 'artists', label: 'Top Artists' },
  { id: 'tracks', label: 'Top Tracks' },
  { id: 'albums', label: 'Top Albums' },
  { id: 'library', label: 'Library' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'recent', label: 'Recently Played' },
  { id: 'features', label: 'Audio Features' },
  { id: 'advanced', label: 'Advanced Audio' },
  { id: 'genres', label: 'Genres' },
] as const;

// Tabs that don't use time range
export const NO_TIME_RANGE_TABS = ['recent', 'library', 'playlists'] as const;
