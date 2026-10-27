import { describe, expect, it } from 'vitest';
import { SpotifyAPIError } from '../services/spotify';
import { getErrorMessage, isAudioFeaturesUnavailable } from './errors';

describe('isAudioFeaturesUnavailable', () => {
  it('matches only a 403 from the audio-features endpoint', () => {
    expect(
      isAudioFeaturesUnavailable(new SpotifyAPIError('Forbidden', '/audio-features', 403)),
    ).toBe(true);
    expect(
      isAudioFeaturesUnavailable(new SpotifyAPIError('Forbidden', '/me/top/tracks', 403)),
    ).toBe(false);
    expect(isAudioFeaturesUnavailable(new SpotifyAPIError('Oops', '/audio-features', 500))).toBe(
      false,
    );
    expect(isAudioFeaturesUnavailable(new Error('Forbidden'))).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('uses the error message, or the fallback when there is none', () => {
    expect(getErrorMessage(new Error('Network down'))).toBe('Network down');
    expect(getErrorMessage('nope', 'Fallback')).toBe('Fallback');
  });
});
