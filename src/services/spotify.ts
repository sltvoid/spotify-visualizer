import axios from 'axios';
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

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

class SpotifyService {
  private getAuthHeader() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      throw new Error('No access token found');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/me`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getTopArtists(
    timeRange: TimeRange = 'medium_term',
    limit: number = 50
  ): Promise<SpotifyArtist[]> {
    const response = await axios.get<TopItemsResponse<SpotifyArtist>>(
      `${SPOTIFY_API_BASE}/me/top/artists`,
      {
        ...this.getAuthHeader(),
        params: { time_range: timeRange, limit },
      }
    );
    return response.data.items;
  }

  async getTopTracks(
    timeRange: TimeRange = 'medium_term',
    limit: number = 50
  ): Promise<SpotifyTrack[]> {
    const response = await axios.get<TopItemsResponse<SpotifyTrack>>(
      `${SPOTIFY_API_BASE}/me/top/tracks`,
      {
        ...this.getAuthHeader(),
        params: { time_range: timeRange, limit },
      }
    );
    return response.data.items;
  }

  async getRecentlyPlayed(limit: number = 50): Promise<RecentlyPlayedResponse> {
    const response = await axios.get<RecentlyPlayedResponse>(
      `${SPOTIFY_API_BASE}/me/player/recently-played`,
      {
        ...this.getAuthHeader(),
        params: { limit },
      }
    );
    return response.data;
  }

  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    // Spotify's audio-features endpoint can be restricted in Development Mode
    // Batch requests into smaller chunks of 20 IDs to avoid 403 errors
    const BATCH_SIZE = 20;
    const batches: string[][] = [];

    for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
      batches.push(trackIds.slice(i, i + BATCH_SIZE));
    }

    try {
      // Make parallel requests for all batches
      const batchPromises = batches.map(async (batch) => {
        try {
          const response = await axios.get(
            `${SPOTIFY_API_BASE}/audio-features`,
            {
              ...this.getAuthHeader(),
              params: { ids: batch.join(',') },
            }
          );
          return response.data.audio_features.filter((f: AudioFeatures | null) => f !== null);
        } catch (error) {
          console.warn(`Failed to fetch audio features for batch:`, error);
          return []; // Return empty array for failed batches
        }
      });

      const results = await Promise.all(batchPromises);
      return results.flat();
    } catch (error) {
      console.error('Error fetching audio features:', error);
      throw error;
    }
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/artists/${artistId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // Helper method for paginated requests
  private async getAllPaginated<T>(
    url: string,
    limit: number = 50,
    maxItems?: number
  ): Promise<T[]> {
    const allItems: T[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.get<PaginatedResponse<T>>(
        url,
        {
          ...this.getAuthHeader(),
          params: { limit, offset },
        }
      );

      allItems.push(...response.data.items);
      offset += limit;
      hasMore = response.data.next !== null;

      if (maxItems && allItems.length >= maxItems) {
        return allItems.slice(0, maxItems);
      }
    }

    return allItems;
  }

  // Saved Library
  async getSavedTracks(limit?: number): Promise<SavedTrack[]> {
    return this.getAllPaginated<SavedTrack>(
      `${SPOTIFY_API_BASE}/me/tracks`,
      50,
      limit
    );
  }

  async getSavedAlbums(limit?: number): Promise<SavedAlbum[]> {
    return this.getAllPaginated<SavedAlbum>(
      `${SPOTIFY_API_BASE}/me/albums`,
      50,
      limit
    );
  }

  // Playlists
  async getPlaylists(limit?: number): Promise<Playlist[]> {
    return this.getAllPaginated<Playlist>(
      `${SPOTIFY_API_BASE}/me/playlists`,
      50,
      limit
    );
  }

  async getPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    return this.getAllPaginated<PlaylistTrack>(
      `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
      100
    );
  }

  // Followed Artists
  async getFollowedArtists(): Promise<SpotifyArtist[]> {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/me/following`,
      {
        ...this.getAuthHeader(),
        params: { type: 'artist', limit: 50 },
      }
    );
    return response.data.artists.items;
  }

  // Recommendations
  async getRecommendations(
    seedTracks?: string[],
    seedArtists?: string[],
    limit: number = 20
  ): Promise<Recommendations> {
    const params: Record<string, string | number> = { limit };

    if (seedTracks && seedTracks.length > 0) {
      params.seed_tracks = seedTracks.slice(0, 5).join(',');
    }
    if (seedArtists && seedArtists.length > 0) {
      params.seed_artists = seedArtists.slice(0, 5).join(',');
    }

    const response = await axios.get(
      `${SPOTIFY_API_BASE}/recommendations`,
      {
        ...this.getAuthHeader(),
        params,
      }
    );
    return response.data;
  }

  // Get album details
  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/albums/${albumId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // Get multiple albums
  async getAlbums(albumIds: string[]): Promise<SpotifyAlbum[]> {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/albums`,
      {
        ...this.getAuthHeader(),
        params: { ids: albumIds.join(',') },
      }
    );
    return response.data.albums;
  }
}

export const spotifyService = new SpotifyService();
