import type { LucideIcon } from 'lucide-react';
import type { SpotifyImage } from '../types/spotify';
import { pickImage } from '../utils/images';

interface CoverImageProps {
  images: SpotifyImage[] | null | undefined;
  alt: string;
  /** Rendered size in CSS pixels; used to pick the smallest image that still looks sharp. */
  size: number;
  className: string;
  fallbackIcon: LucideIcon;
}

/** Album, artist, or playlist artwork with an icon placeholder. */
export default function CoverImage({
  images,
  alt,
  size,
  className,
  fallbackIcon: Icon,
}: CoverImageProps) {
  const image = pickImage(images, size);

  if (!image) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-white/10`}
        role="img"
        aria-label={alt}
      >
        <Icon
          size={Math.min(48, Math.round(size / 2.5))}
          className="text-gray-500"
          aria-hidden="true"
        />
      </div>
    );
  }

  return <img src={image.url} alt={alt} className={`${className} object-cover`} loading="lazy" />;
}
