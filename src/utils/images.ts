import type { SpotifyImage } from '../types/spotify';

/**
 * Picks the smallest image at least `size * 2` pixels wide (sharp on high-DPI
 * screens), falling back to the largest available.
 */
export function pickImage(
  images: SpotifyImage[] | null | undefined,
  size: number,
): SpotifyImage | undefined {
  if (!images?.length) return undefined;
  const bySizeDesc = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const bigEnough = bySizeDesc.filter((img) => (img.width ?? 0) >= size * 2);
  return bigEnough.at(-1) ?? bySizeDesc[0];
}
