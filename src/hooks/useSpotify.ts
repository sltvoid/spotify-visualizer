import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import type { TimeRange } from '../types/spotify';
import {
  getAudioFeatures,
  getCurrentlyPlaying,
  getCurrentUser,
  getPlaylists,
  getRecentlyPlayed,
  getSavedAlbums,
  getSavedTracks,
  getTopArtists,
  getTopTracks,
} from '../services/spotify';
import { queryClient } from '../lib/queryClient';
import { getPollInterval } from '../utils/nowPlaying';

/*
 * One hook per Spotify resource. TanStack Query caches by key, so every
 * component asking for the same data (e.g. top tracks for a time range)
 * shares a single request.
 */

const topTracksOptions = (timeRange: TimeRange) =>
  queryOptions({
    queryKey: ['top-tracks', timeRange],
    queryFn: () => getTopTracks(timeRange),
  });

export function useCurrentUser() {
  return useQuery({ queryKey: ['me'], queryFn: getCurrentUser, staleTime: Infinity });
}

export function useTopArtists(timeRange: TimeRange) {
  return useQuery({
    queryKey: ['top-artists', timeRange],
    queryFn: () => getTopArtists(timeRange),
  });
}

export function useTopTracks(timeRange: TimeRange) {
  return useQuery(topTracksOptions(timeRange));
}

export function useAudioFeatures(timeRange: TimeRange) {
  return useQuery({
    queryKey: ['audio-features', timeRange],
    queryFn: async () => {
      const tracks = await queryClient.ensureQueryData(topTracksOptions(timeRange));
      return getAudioFeatures(tracks.map((t) => t.id));
    },
  });
}

export function useRecentlyPlayed() {
  return useQuery({
    queryKey: ['recently-played'],
    queryFn: () => getRecentlyPlayed(),
    staleTime: 30 * 1000,
  });
}

export function useSavedTracks(maxItems: number | undefined) {
  return useQuery({
    queryKey: ['saved-tracks', maxItems ?? 'all'],
    queryFn: () => getSavedTracks(maxItems),
    // Keep showing the current list while a bigger one loads.
    placeholderData: keepPreviousData,
  });
}

export function useSavedAlbums(maxItems: number | undefined) {
  return useQuery({
    queryKey: ['saved-albums', maxItems ?? 'all'],
    queryFn: () => getSavedAlbums(maxItems),
    placeholderData: keepPreviousData,
  });
}

/**
 * Polls playback state. Polling pauses while the browser tab is hidden
 * (TanStack Query's default), so a background tab doesn't use up rate limits.
 */
export function useCurrentlyPlaying(enabled: boolean) {
  return useQuery({
    queryKey: ['currently-playing'],
    queryFn: getCurrentlyPlaying,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: (query) =>
      getPollInterval(query.state.data, query.state.dataUpdatedAt, Date.now()),
  });
}

export function usePlaylists() {
  return useQuery({ queryKey: ['playlists'], queryFn: () => getPlaylists() });
}
