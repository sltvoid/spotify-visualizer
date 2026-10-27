import { describe, expect, it } from 'vitest';
import type { CurrentlyPlaying, SpotifyEpisode, SpotifyTrack } from '../types/spotify';
import { NOW_PLAYING_IDLE_POLL_MS, NOW_PLAYING_POLL_MS } from '../constants';
import { getLiveProgress, getNowPlayingItem, getPollInterval } from './nowPlaying';

const track: SpotifyTrack = {
  type: 'track',
  id: 't1',
  name: 'Song',
  duration_ms: 200_000,
  artists: [{ id: 'a', name: 'Band', external_urls: { spotify: '' } }],
  album: {
    id: 'al',
    name: 'Record',
    images: [],
    release_date: '2020',
    external_urls: { spotify: '' },
  },
  external_urls: { spotify: 'https://open.spotify.com/track/t1' },
};

const episode: SpotifyEpisode = {
  type: 'episode',
  id: 'e1',
  name: 'Episode 1',
  duration_ms: 3_600_000,
  images: [],
  show: { name: 'The Show' },
  external_urls: { spotify: '' },
};

const playing = (
  progress: number,
  item: SpotifyTrack | SpotifyEpisode = track,
): CurrentlyPlaying => ({
  is_playing: true,
  progress_ms: progress,
  currently_playing_type: item.type ?? 'track',
  item,
});

describe('getNowPlayingItem', () => {
  it('describes tracks and episodes', () => {
    expect(getNowPlayingItem(playing(0))).toMatchObject({ title: 'Song', subtitle: 'Band' });
    expect(getNowPlayingItem(playing(0, episode))).toMatchObject({
      title: 'Episode 1',
      subtitle: 'The Show',
    });
  });

  it('returns null when nothing (or an ad) is playing', () => {
    expect(getNowPlayingItem(null)).toBeNull();
    expect(
      getNowPlayingItem({ ...playing(0), currently_playing_type: 'ad', item: null }),
    ).toBeNull();
  });
});

describe('getLiveProgress', () => {
  it('advances while playing, capped at the duration', () => {
    expect(getLiveProgress(playing(10_000), 1_000, 6_000)).toBe(15_000);
    expect(getLiveProgress(playing(199_000), 0, 60_000)).toBe(200_000);
  });

  it('stays put while paused and never goes backwards', () => {
    expect(getLiveProgress({ ...playing(10_000), is_playing: false }, 0, 60_000)).toBe(10_000);
    expect(getLiveProgress(playing(10_000), 5_000, 1_000)).toBe(10_000);
  });
});

describe('getPollInterval', () => {
  it('polls slowly when idle', () => {
    expect(getPollInterval(null, 0, 0)).toBe(NOW_PLAYING_IDLE_POLL_MS);
    expect(getPollInterval({ ...playing(0), is_playing: false }, 0, 0)).toBe(
      NOW_PLAYING_IDLE_POLL_MS,
    );
  });

  it('polls regularly mid-song and right after the song should end', () => {
    expect(getPollInterval(playing(0), 0, 0)).toBe(NOW_PLAYING_POLL_MS);
    // 5s left -> poll 1s after it ends
    expect(getPollInterval(playing(195_000), 0, 0)).toBe(6_000);
    // never faster than every 2s
    expect(getPollInterval(playing(200_000), 0, 0)).toBe(2_000);
  });
});
