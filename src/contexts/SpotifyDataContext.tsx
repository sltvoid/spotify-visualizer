import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  SpotifyArtist,
  SpotifyTrack,
  UserProfile,
  TimeRange,
  AudioFeatures,
} from '../types/spotify';
import { spotifyService } from '../services/spotify';

/**
 * Cached data structure for a specific time range.
 */
interface TimeRangeData {
  artists: SpotifyArtist[] | null;
  tracks: SpotifyTrack[] | null;
  audioFeatures: AudioFeatures[] | null;
  fetchedAt: number | null;
}

/**
 * Context state interface.
 */
interface SpotifyDataState {
  userProfile: UserProfile | null;
  dataByTimeRange: Record<TimeRange, TimeRangeData>;
  loading: {
    profile: boolean;
    artists: boolean;
    tracks: boolean;
    audioFeatures: boolean;
  };
  errors: {
    profile: string | null;
    artists: string | null;
    tracks: string | null;
    audioFeatures: string | null;
  };
}

/**
 * Context actions interface.
 */
interface SpotifyDataActions {
  fetchUserProfile: () => Promise<void>;
  fetchTopArtists: (timeRange: TimeRange) => Promise<SpotifyArtist[]>;
  fetchTopTracks: (timeRange: TimeRange) => Promise<SpotifyTrack[]>;
  fetchAudioFeatures: (timeRange: TimeRange) => Promise<AudioFeatures[]>;
  getArtists: (timeRange: TimeRange) => SpotifyArtist[] | null;
  getTracks: (timeRange: TimeRange) => SpotifyTrack[] | null;
  getAudioFeatures: (timeRange: TimeRange) => AudioFeatures[] | null;
  clearCache: () => void;
}

type SpotifyDataContextType = SpotifyDataState & SpotifyDataActions;

const SpotifyDataContext = createContext<SpotifyDataContextType | null>(null);

// Cache validity duration (5 minutes)
const CACHE_DURATION_MS = 5 * 60 * 1000;

/**
 * Creates initial empty data for a time range.
 */
function createEmptyTimeRangeData(): TimeRangeData {
  return {
    artists: null,
    tracks: null,
    audioFeatures: null,
    fetchedAt: null,
  };
}

/**
 * Checks if cached data is still valid.
 */
function isCacheValid(fetchedAt: number | null): boolean {
  if (!fetchedAt) return false;
  return Date.now() - fetchedAt < CACHE_DURATION_MS;
}

interface SpotifyDataProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages shared Spotify data state.
 * Caches data by time range to prevent redundant API calls.
 */
export function SpotifyDataProvider({ children }: SpotifyDataProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dataByTimeRange, setDataByTimeRange] = useState<Record<TimeRange, TimeRangeData>>({
    short_term: createEmptyTimeRangeData(),
    medium_term: createEmptyTimeRangeData(),
    long_term: createEmptyTimeRangeData(),
  });
  const [loading, setLoading] = useState({
    profile: false,
    artists: false,
    tracks: false,
    audioFeatures: false,
  });
  const [errors, setErrors] = useState({
    profile: null as string | null,
    artists: null as string | null,
    tracks: null as string | null,
    audioFeatures: null as string | null,
  });

  const fetchUserProfile = useCallback(async () => {
    if (userProfile) return;

    setLoading((prev) => ({ ...prev, profile: true }));
    setErrors((prev) => ({ ...prev, profile: null }));

    try {
      const profile = await spotifyService.getUserProfile();
      setUserProfile(profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setErrors((prev) => ({ ...prev, profile: message }));
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, [userProfile]);

  const fetchTopArtists = useCallback(
    async (timeRange: TimeRange): Promise<SpotifyArtist[]> => {
      const cached = dataByTimeRange[timeRange];

      // Return cached data if valid
      if (cached.artists && isCacheValid(cached.fetchedAt)) {
        return cached.artists;
      }

      setLoading((prev) => ({ ...prev, artists: true }));
      setErrors((prev) => ({ ...prev, artists: null }));

      try {
        const artists = await spotifyService.getTopArtists(timeRange, 50);
        setDataByTimeRange((prev) => ({
          ...prev,
          [timeRange]: {
            ...prev[timeRange],
            artists,
            fetchedAt: Date.now(),
          },
        }));
        return artists;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load artists';
        setErrors((prev) => ({ ...prev, artists: message }));
        throw err;
      } finally {
        setLoading((prev) => ({ ...prev, artists: false }));
      }
    },
    [dataByTimeRange]
  );

  const fetchTopTracks = useCallback(
    async (timeRange: TimeRange): Promise<SpotifyTrack[]> => {
      const cached = dataByTimeRange[timeRange];

      // Return cached data if valid
      if (cached.tracks && isCacheValid(cached.fetchedAt)) {
        return cached.tracks;
      }

      setLoading((prev) => ({ ...prev, tracks: true }));
      setErrors((prev) => ({ ...prev, tracks: null }));

      try {
        const tracks = await spotifyService.getTopTracks(timeRange, 50);
        setDataByTimeRange((prev) => ({
          ...prev,
          [timeRange]: {
            ...prev[timeRange],
            tracks,
            fetchedAt: Date.now(),
          },
        }));
        return tracks;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load tracks';
        setErrors((prev) => ({ ...prev, tracks: message }));
        throw err;
      } finally {
        setLoading((prev) => ({ ...prev, tracks: false }));
      }
    },
    [dataByTimeRange]
  );

  const fetchAudioFeatures = useCallback(
    async (timeRange: TimeRange): Promise<AudioFeatures[]> => {
      const cached = dataByTimeRange[timeRange];

      // Return cached data if valid
      if (cached.audioFeatures && isCacheValid(cached.fetchedAt)) {
        return cached.audioFeatures;
      }

      // Need tracks first to get audio features
      let tracks = cached.tracks;
      if (!tracks) {
        tracks = await fetchTopTracks(timeRange);
      }

      setLoading((prev) => ({ ...prev, audioFeatures: true }));
      setErrors((prev) => ({ ...prev, audioFeatures: null }));

      try {
        const trackIds = tracks.map((t) => t.id);
        const features = await spotifyService.getAudioFeatures(trackIds);
        setDataByTimeRange((prev) => ({
          ...prev,
          [timeRange]: {
            ...prev[timeRange],
            audioFeatures: features,
          },
        }));
        return features;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load audio features';
        setErrors((prev) => ({ ...prev, audioFeatures: message }));
        // Return empty array instead of throwing for optional feature
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, audioFeatures: false }));
      }
    },
    [dataByTimeRange, fetchTopTracks]
  );

  const getArtists = useCallback(
    (timeRange: TimeRange): SpotifyArtist[] | null => {
      return dataByTimeRange[timeRange].artists;
    },
    [dataByTimeRange]
  );

  const getTracks = useCallback(
    (timeRange: TimeRange): SpotifyTrack[] | null => {
      return dataByTimeRange[timeRange].tracks;
    },
    [dataByTimeRange]
  );

  const getAudioFeatures = useCallback(
    (timeRange: TimeRange): AudioFeatures[] | null => {
      return dataByTimeRange[timeRange].audioFeatures;
    },
    [dataByTimeRange]
  );

  const clearCache = useCallback(() => {
    setDataByTimeRange({
      short_term: createEmptyTimeRangeData(),
      medium_term: createEmptyTimeRangeData(),
      long_term: createEmptyTimeRangeData(),
    });
  }, []);

  const value = useMemo<SpotifyDataContextType>(
    () => ({
      userProfile,
      dataByTimeRange,
      loading,
      errors,
      fetchUserProfile,
      fetchTopArtists,
      fetchTopTracks,
      fetchAudioFeatures,
      getArtists,
      getTracks,
      getAudioFeatures,
      clearCache,
    }),
    [
      userProfile,
      dataByTimeRange,
      loading,
      errors,
      fetchUserProfile,
      fetchTopArtists,
      fetchTopTracks,
      fetchAudioFeatures,
      getArtists,
      getTracks,
      getAudioFeatures,
      clearCache,
    ]
  );

  return (
    <SpotifyDataContext.Provider value={value}>{children}</SpotifyDataContext.Provider>
  );
}

/**
 * Hook to access the Spotify data context.
 * Must be used within a SpotifyDataProvider.
 */
export function useSpotifyData(): SpotifyDataContextType {
  const context = useContext(SpotifyDataContext);

  if (!context) {
    throw new Error('useSpotifyData must be used within a SpotifyDataProvider');
  }

  return context;
}
