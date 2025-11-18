import axios from 'axios';
import type {
  SpotifyArtist,
  SpotifyTrack,
  UserProfile,
  TimeRange,
  TopItemsResponse,
  RecentlyPlayedResponse,
  AudioFeatures,
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
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/audio-features`,
      {
        ...this.getAuthHeader(),
        params: { ids: trackIds.join(',') },
      }
    );
    return response.data.audio_features.filter((f: AudioFeatures | null) => f !== null);
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    const response = await axios.get(
      `${SPOTIFY_API_BASE}/artists/${artistId}`,
      this.getAuthHeader()
    );
    return response.data;
  }
}

export const spotifyService = new SpotifyService();
