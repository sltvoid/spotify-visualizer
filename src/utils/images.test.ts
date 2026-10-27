import { describe, expect, it } from 'vitest';
import { pickImage } from './images';

const img = (width: number | null) => ({ url: `w${width}`, width, height: width });

describe('pickImage', () => {
  it('returns undefined when there are no images', () => {
    expect(pickImage([], 64)).toBeUndefined();
    expect(pickImage(null, 64)).toBeUndefined();
  });

  it('picks the smallest image at least twice the display size', () => {
    expect(pickImage([img(640), img(300), img(64)], 64)?.url).toBe('w300');
    expect(pickImage([img(64), img(640), img(300)], 20)?.url).toBe('w64');
  });

  it('falls back to the largest image', () => {
    expect(pickImage([img(64), img(300)], 400)?.url).toBe('w300');
    expect(pickImage([img(null)], 64)?.url).toBe('wnull');
  });
});
