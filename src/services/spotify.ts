import axios, { AxiosError } from 'axios';
import type {
  SpotifyArtist,
  SpotifyTrack,
  UserProfile,
  TimeRange,
  TopItemsResponse,
  RecentlyPlayedResponse,
  AudioFeatures,
  SavedTrack,
  SavedAlbum,
  Playlist,
  PlaylistTrack,
  Recommendations,
  PaginatedResponse,
  SpotifyAlbum,
} from '../types/spotify';
import {
  SPOTIFY_API_BASE,
  API_BATCH_SIZE,
  DEFAULT_LIMIT,
  PAGINATION_LIMIT,
  PLAYLIST_TRACKS_LIMIT,
  MAX_SEED_ITEMS,
} from '../constants';
import { getValidAccessToken, logout } from '../utils/auth';

/**
 * Custom error class for Spotify API errors with additional context.
 */
export class SpotifyAPIError extends Error {
  statusCode?: number;
  endpoint?: string;

  constructor(message: string, statusCode?: number, endpoint?: string) {
    super(message);
    this.name = 'SpotifyAPIError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

/**
 * SpotifyService handles all communication with the Spotify Web API.
 * Includes automatic token refresh and standardized error handling.
 */
class SpotifyService {
  /**
   * Gets authorization headers with the current access token.
   * Automatically refreshes token if expired.
   */
  private async getAuthHeader(): Promise<{ headers: { Authorization: string } }> {
    const token = await getValidAccessToken();

    if (!token) {
      throw new SpotifyAPIError('No access token available. Please log in again.');
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  /**
   * Handles API errors with appropriate responses.
   */
  private handleError(error: unknown, endpoint: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      // Handle authentication errors
      if (status === 401) {
        logout();
        throw new SpotifyAPIError(
          'Session expired. Please log in again.',
          401,
          endpoint
        );
      }

      // Handle forbidden (likely scope or premium issue)
      if (status === 403) {
        throw new SpotifyAPIError(
          'Access denied. This feature may require Spotify Premium or additional permissions.',
          403,
          endpoint
        );
      }

      // Handle rate limiting
      if (status === 429) {
        throw new SpotifyAPIError(
          'Too many requests. Please try again later.',
          429,
          endpoint
        );
      }

      throw new SpotifyAPIError(
        error.message || 'An error occurred while fetching data',
        status,
        endpoint
      );
    }

    if (error instanceof SpotifyAPIError) {
      throw error;
    }

    throw new SpotifyAPIError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      undefined,
      endpoint
    );
  }

  /**
   * Fetches the current user's profile.
   */
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await axios.get<UserProfile>(
        `${SPOTIFY_API_BASE}/me`,
        await this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      this.handleError(error, '/me');
    }
  }

  /**
   * Fetches the user's top artists for a given time range.
   */
  async getTopArtists(
    timeRange: TimeRange = 'medium_term',
    limit: number = DEFAULT_LIMIT
  ): Promise<SpotifyArtist[]> {
    try {
      const response = await axios.get<TopItemsResponse<SpotifyArtist>>(
        `${SPOTIFY_API_BASE}/me/top/artists`,
        {
          ...(await this.getAuthHeader()),
          params: { time_range: timeRange, limit },
        }
      );
      return response.data.items;
    } catch (error) {
      this.handleError(error, '/me/top/artists');
    }
  }

  /**
   * Fetches the user's top tracks for a given time range.
   */
  async getTopTracks(
    timeRange: TimeRange = 'medium_term',
    limit: number = DEFAULT_LIMIT
  ): Promise<SpotifyTrack[]> {
    try {
      const response = await axios.get<TopItemsResponse<SpotifyTrack>>(
        `${SPOTIFY_API_BASE}/me/top/tracks`,
        {
          ...(await this.getAuthHeader()),
          params: { time_range: timeRange, limit },
        }
      );
      return response.data.items;
    } catch (error) {
      this.handleError(error, '/me/top/tracks');
    }
  }

  /**
   * Fetches the user's recently played tracks.
   */
  async getRecentlyPlayed(limit: number = DEFAULT_LIMIT): Promise<RecentlyPlayedResponse> {
    try {
      const response = await axios.get<RecentlyPlayedResponse>(
        `${SPOTIFY_API_BASE}/me/player/recently-played`,
        {
          ...(await this.getAuthHeader()),
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, '/me/player/recently-played');
    }
  }

  /**
   * Fetches audio features for a list of track IDs.
   * Batches requests to avoid hitting rate limits.
   */
  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    if (trackIds.length === 0) {
      return [];
    }

    // Split into batches
    const batches: string[][] = [];
    for (let i = 0; i < trackIds.length; i += API_BATCH_SIZE) {
      batches.push(trackIds.slice(i, i + API_BATCH_SIZE));
    }

    const authHeader = await this.getAuthHeader();

    // Process batches in parallel
    const batchResults = await Promise.all(
      batches.map(async (batch) => {
        try {
          const response = await axios.get(`${SPOTIFY_API_BASE}/audio-features`, {
            ...authHeader,
            params: { ids: batch.join(',') },
          });
          // Filter out null values (unavailable tracks)
          return (response.data.audio_features || []).filter(
            (f: AudioFeatures | null): f is AudioFeatures => f !== null
          );
        } catch (error) {
          // Log but don't fail the entire request for individual batch failures
          console.warn('Failed to fetch audio features for batch:', error);
          return [];
        }
      })
    );

    return batchResults.flat();
  }

  /**
   * Fetches details for a single artist.
   */
  async getArtist(artistId: string): Promise<SpotifyArtist> {
    try {
      const response = await axios.get<SpotifyArtist>(
        `${SPOTIFY_API_BASE}/artists/${artistId}`,
        await this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `/artists/${artistId}`);
    }
  }

  /**
   * Helper method for paginated API requests.
   */
  private async getAllPaginated<T>(
    url: string,
    limit: number = PAGINATION_LIMIT,
    maxItems?: number
  ): Promise<T[]> {
    const allItems: T[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get<PaginatedResponse<T>>(url, {
        ...(await this.getAuthHeader()),
        params: { limit, offset },
      });

      allItems.push(...response.data.items);
      offset += limit;
      hasMore = response.data.next !== null;

      if (maxItems && allItems.length >= maxItems) {
        return allItems.slice(0, maxItems);
      }
    }

    return allItems;
  }

  /**
   * Fetches the user's saved tracks (library).
   */
  async getSavedTracks(limit?: number): Promise<SavedTrack[]> {
    try {
      return await this.getAllPaginated<SavedTrack>(
        `${SPOTIFY_API_BASE}/me/tracks`,
        PAGINATION_LIMIT,
        limit
      );
    } catch (error) {
      this.handleError(error, '/me/tracks');
    }
  }

  /**
   * Fetches the user's saved albums.
   */
  async getSavedAlbums(limit?: number): Promise<SavedAlbum[]> {
    try {
      return await this.getAllPaginated<SavedAlbum>(
        `${SPOTIFY_API_BASE}/me/albums`,
        PAGINATION_LIMIT,
        limit
      );
    } catch (error) {
      this.handleError(error, '/me/albums');
    }
  }

  /**
   * Fetches the user's playlists.
   */
  async getPlaylists(limit?: number): Promise<Playlist[]> {
    try {
      return await this.getAllPaginated<Playlist>(
        `${SPOTIFY_API_BASE}/me/playlists`,
        PAGINATION_LIMIT,
        limit
      );
    } catch (error) {
      this.handleError(error, '/me/playlists');
    }
  }

  /**
   * Fetches tracks for a specific playlist.
   */
  async getPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    try {
      return await this.getAllPaginated<PlaylistTrack>(
        `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
        PLAYLIST_TRACKS_LIMIT
      );
    } catch (error) {
      this.handleError(error, `/playlists/${playlistId}/tracks`);
    }
  }

  /**
   * Fetches the user's followed artists.
   */
  async getFollowedArtists(): Promise<SpotifyArtist[]> {
    try {
      const response = await axios.get(`${SPOTIFY_API_BASE}/me/following`, {
        ...(await this.getAuthHeader()),
        params: { type: 'artist', limit: DEFAULT_LIMIT },
      });
      return response.data.artists.items;
    } catch (error) {
      this.handleError(error, '/me/following');
    }
  }

  /**
   * Fetches track recommendations based on seed tracks and/or artists.
   */
  async getRecommendations(
    seedTracks?: string[],
    seedArtists?: string[],
    limit: number = 20
  ): Promise<Recommendations> {
    try {
      const params: Record<string, string | number> = { limit };

      if (seedTracks && seedTracks.length > 0) {
        params.seed_tracks = seedTracks.slice(0, MAX_SEED_ITEMS).join(',');
      }
      if (seedArtists && seedArtists.length > 0) {
        params.seed_artists = seedArtists.slice(0, MAX_SEED_ITEMS).join(',');
      }

      const response = await axios.get<Recommendations>(
        `${SPOTIFY_API_BASE}/recommendations`,
        {
          ...(await this.getAuthHeader()),
          params,
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, '/recommendations');
    }
  }

  /**
   * Fetches details for a single album.
   */
  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    try {
      const response = await axios.get<SpotifyAlbum>(
        `${SPOTIFY_API_BASE}/albums/${albumId}`,
        await this.getAuthHeader()
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `/albums/${albumId}`);
    }
  }

  /**
   * Fetches details for multiple albums.
   */
  async getAlbums(albumIds: string[]): Promise<SpotifyAlbum[]> {
    if (albumIds.length === 0) {
      return [];
    }

    try {
      const response = await axios.get(`${SPOTIFY_API_BASE}/albums`, {
        ...(await this.getAuthHeader()),
        params: { ids: albumIds.join(',') },
      });
      return response.data.albums;
    } catch (error) {
      this.handleError(error, '/albums');
    }
  }
}

export const spotifyService = new SpotifyService();
