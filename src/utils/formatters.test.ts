import { describe, expect, it } from 'vitest';
import {
  createCSV,
  decodeHtmlEntities,
  escapeCSVValue,
  formatCount,
  formatDuration,
  formatHoursMinutes,
  formatRelativeTime,
  truncateString,
} from './formatters';

describe('formatDuration', () => {
  it('formats minutes and zero-padded seconds', () => {
    expect(formatDuration(225000)).toBe('3:45');
    expect(formatDuration(61000)).toBe('1:01');
  });
});

describe('formatHoursMinutes', () => {
  it('formats hours and minutes', () => {
    expect(formatHoursMinutes(9000000)).toBe('2h 30m');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-10T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it.each([
    [30 * 1000, 'Just now'],
    [5 * 60 * 1000, '5 min ago'],
    [60 * 60 * 1000, '1 hour ago'],
    [3 * 60 * 60 * 1000, '3 hours ago'],
    [25 * 60 * 60 * 1000, 'Yesterday'],
    [3 * 24 * 60 * 60 * 1000, '3 days ago'],
  ])('%i ms ago -> %s', (ms, expected) => {
    expect(formatRelativeTime(ago(ms), now)).toBe(expected);
  });
});

describe('truncateString', () => {
  it('leaves short strings alone and truncates long ones', () => {
    expect(truncateString('short', 10)).toBe('short');
    expect(truncateString('a very long name', 6)).toBe('a very...');
  });
});

describe('formatCount', () => {
  it('pluralizes the unit', () => {
    expect(formatCount(1, 'track')).toBe('1 track');
    expect(formatCount(28, 'track')).toBe('28 tracks');
    expect(formatCount(0, 'artist')).toBe('0 artists');
  });
});

describe('CSV helpers', () => {
  it('quotes values containing commas, quotes, or newlines', () => {
    expect(escapeCSVValue('plain')).toBe('plain');
    expect(escapeCSVValue('a, b')).toBe('"a, b"');
    expect(escapeCSVValue('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCSVValue('line\nbreak')).toBe('"line\nbreak"');
  });

  it('builds a CSV document', () => {
    expect(createCSV(['Track', 'Artist'], [['Song', 'A, B']])).toBe('Track,Artist\nSong,"A, B"');
  });
});

describe('decodeHtmlEntities', () => {
  it('decodes entities and strips tags', () => {
    expect(decodeHtmlEntities('Rock &amp; Roll <a href="#">link</a>')).toBe('Rock & Roll link');
  });
});
