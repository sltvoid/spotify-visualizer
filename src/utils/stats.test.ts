import { describe, expect, it } from 'vitest';
import type { SpotifyArtist, SpotifyTrack } from '../types/spotify';
import {
  average,
  averagePopularity,
  getArtistLoyalty,
  getDecadeDistribution,
  getGenreDiversity,
  getReleaseYear,
  getTopAlbums,
  getTopGenres,
  hasPopularity,
  percentOf,
  rankBy,
} from './stats';

const artist = (id: string, extra: Partial<SpotifyArtist> = {}): SpotifyArtist => ({
  id,
  name: `Artist ${id}`,
  external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
  ...extra,
});

const track = (
  id: string,
  albumId: string,
  artistIds: string[],
  releaseDate = '2020-01-01',
): SpotifyTrack => ({
  id,
  name: `Track ${id}`,
  duration_ms: 180000,
  artists: artistIds.map((a) => artist(a)),
  album: {
    id: albumId,
    name: `Album ${albumId}`,
    images: [],
    release_date: releaseDate,
    external_urls: { spotify: '' },
  },
  external_urls: { spotify: '' },
});

describe('average', () => {
  it('returns null for an empty list', () => {
    expect(average([])).toBeNull();
  });

  it('averages numbers', () => {
    expect(average([1, 2, 3])).toBe(2);
  });
});

describe('averagePopularity', () => {
  it('ignores items without popularity', () => {
    expect(averagePopularity([{ popularity: 40 }, {}, { popularity: 60 }])).toBe(50);
  });

  it('returns null when Spotify omits popularity entirely', () => {
    expect(averagePopularity([{}, {}])).toBeNull();
    expect(hasPopularity([{}, {}])).toBe(false);
  });

  it('treats a popularity of 0 as present', () => {
    expect(hasPopularity([{ popularity: 0 }])).toBe(true);
  });
});

describe('rankBy', () => {
  it('counts single and multiple keys and sorts by count', () => {
    const result = rankBy(['a', 'b', 'a', 'c', 'a', 'b'], (x) => x);
    expect(result).toEqual([
      { name: 'a', value: 3 },
      { name: 'b', value: 2 },
      { name: 'c', value: 1 },
    ]);
    expect(rankBy([{ tags: ['x', 'y'] }, { tags: ['x'] }], (i) => i.tags)[0]).toEqual({
      name: 'x',
      value: 2,
    });
  });

  it('skips null keys', () => {
    expect(rankBy([1, 2], () => null)).toEqual([]);
  });
});

describe('getTopGenres', () => {
  it('ranks genres across artists and applies the limit', () => {
    const artists = [
      artist('1', { genres: ['pop', 'rock'] }),
      artist('2', { genres: ['pop'] }),
      artist('3'),
    ];
    expect(getTopGenres(artists, 1)).toEqual([{ name: 'pop', value: 2 }]);
  });
});

describe('getTopAlbums', () => {
  it('ranks albums by number of top tracks', () => {
    const albums = getTopAlbums([track('1', 'A', []), track('2', 'B', []), track('3', 'B', [])]);
    expect(albums.map((a) => [a.id, a.trackCount])).toEqual([
      ['B', 2],
      ['A', 1],
    ]);
  });
});

describe('getReleaseYear', () => {
  it.each([
    ['1999', 1999],
    ['2019-06', 2019],
    ['2019-06-14', 2019],
    ['0000', null],
    ['', null],
    [undefined, null],
  ])('%s -> %s', (input, expected) => {
    expect(getReleaseYear(input)).toBe(expected);
  });
});

describe('getDecadeDistribution', () => {
  it('groups tracks by decade and skips unknown dates', () => {
    const tracks = [
      track('1', 'A', [], '1994-01-01'),
      track('2', 'B', [], '1999'),
      track('3', 'C', [], '2001-05-05'),
      track('4', 'D', [], '0000'),
    ];
    expect(getDecadeDistribution(tracks)).toEqual([
      { decade: '1990s', count: 2 },
      { decade: '2000s', count: 1 },
    ]);
  });
});

describe('getGenreDiversity', () => {
  it('is 0 when there are no genres', () => {
    expect(getGenreDiversity([artist('1')])).toEqual({ score: 0, uniqueGenres: 0 });
  });

  it('caps the score at 100', () => {
    const result = getGenreDiversity([artist('1', { genres: ['a', 'b'] })]);
    expect(result).toEqual({ score: 100, uniqueGenres: 2 });
  });
});

describe('getArtistLoyalty', () => {
  it('handles no tracks without returning NaN', () => {
    expect(getArtistLoyalty([])).toEqual({ score: 0, avgAppearances: 0 });
  });

  it('scores repeat artists', () => {
    const tracks = [track('1', 'A', ['x']), track('2', 'A', ['x']), track('3', 'B', ['y'])];
    const result = getArtistLoyalty(tracks);
    expect(result.avgAppearances).toBe(1.5);
    expect(result.score).toBe(30);
  });
});

describe('percentOf', () => {
  it('guards against dividing by zero', () => {
    expect(percentOf(5, 0)).toBe(0);
    expect(percentOf(1, 4)).toBe(25);
  });
});
