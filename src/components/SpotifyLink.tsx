import { ExternalLink } from 'lucide-react';

interface SpotifyLinkProps {
  href: string;
  /** What is being opened, e.g. the track name. */
  label: string;
  size?: number;
}

/** Icon link that opens an item in Spotify in a new tab. */
export default function SpotifyLink({ href, label, size = 18 }: SpotifyLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 p-1 text-gray-400 transition-colors hover:text-spotify-green"
      aria-label={`Open ${label} on Spotify (opens in new tab)`}
    >
      <ExternalLink size={size} aria-hidden="true" />
    </a>
  );
}
