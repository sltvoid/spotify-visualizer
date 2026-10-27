import { useState, type ReactNode } from 'react';
import { Music, Pause, Radio } from 'lucide-react';
import { useCurrentlyPlaying } from '../hooks/useSpotify';
import { useNow } from '../hooks/useNow';
import { hasGrantedScope, startLogin } from '../utils/auth';
import { formatDuration } from '../utils/formatters';
import { getLiveProgress, getNowPlayingItem } from '../utils/nowPlaying';
import { percentOf } from '../utils/stats';
import CoverImage from './CoverImage';
import SpotifyLink from './SpotifyLink';

const SCOPE = 'user-read-currently-playing';

/** Animated bars shown while music is playing. */
function Equalizer() {
  return (
    <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
      {[0, 0.2, 0.4].map((delay) => (
        <span
          key={delay}
          className="h-full w-0.5 origin-bottom animate-equalizer rounded-full bg-spotify-green"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

function CompactCard({ children }: { children: ReactNode }) {
  return (
    <section
      className="card flex items-center gap-3 py-4 text-sm text-gray-400"
      aria-label="Now playing"
    >
      {children}
    </section>
  );
}

/** Logins from before this feature existed lack the scope; offer to reconnect. */
function ReconnectPrompt() {
  const [error, setError] = useState<string | null>(null);

  return (
    <CompactCard>
      <Radio size={18} className="shrink-0 text-spotify-green" aria-hidden="true" />
      <p className="flex-1">
        {error ?? 'Reconnect your Spotify account to see what you’re listening to right now.'}
      </p>
      <button
        type="button"
        className="btn-secondary shrink-0 text-sm"
        onClick={() =>
          startLogin().catch((err) =>
            setError(err instanceof Error ? err.message : 'Could not start login.'),
          )
        }
      >
        Reconnect
      </button>
    </CompactCard>
  );
}

function PlaybackStatus() {
  const { data: playback, isPending, isError, dataUpdatedAt } = useCurrentlyPlaying(true);
  const isPlaying = Boolean(playback?.is_playing);
  const now = useNow(1000, isPlaying);
  const item = getNowPlayingItem(playback ?? null);

  if (isPending) {
    return (
      <CompactCard>
        <Music size={18} className="shrink-0" aria-hidden="true" />
        <p>Checking what’s playing…</p>
      </CompactCard>
    );
  }

  if (isError) {
    return (
      <CompactCard>
        <Music size={18} className="shrink-0" aria-hidden="true" />
        <p>Couldn’t check what’s playing right now.</p>
      </CompactCard>
    );
  }

  if (!playback || !item) {
    return (
      <CompactCard>
        <Music size={18} className="shrink-0" aria-hidden="true" />
        <p>
          {playback?.currently_playing_type === 'ad'
            ? 'An ad is playing on Spotify.'
            : 'Nothing playing on Spotify right now.'}
        </p>
      </CompactCard>
    );
  }

  const progress = getLiveProgress(playback, dataUpdatedAt, now);

  return (
    <section className="card" aria-label="Now playing">
      <div className="flex items-center gap-4">
        <CoverImage
          images={item.images}
          alt=""
          size={64}
          className="h-16 w-16 shrink-0 rounded-lg shadow-lg"
          fallbackIcon={Music}
        />

        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-spotify-green uppercase">
            {isPlaying ? <Equalizer /> : <Pause size={12} aria-hidden="true" />}
            {isPlaying ? 'Now playing' : 'Paused'}
          </p>
          <h2 className="truncate font-semibold">{item.title}</h2>
          <p className="truncate text-sm text-gray-400">{item.subtitle}</p>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 tabular-nums">
            <span>{formatDuration(progress)}</span>
            <div
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-label="Playback progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(item.durationMs / 1000)}
              aria-valuenow={Math.round(progress / 1000)}
              aria-valuetext={`${formatDuration(progress)} of ${formatDuration(item.durationMs)}`}
            >
              <div
                className="h-full rounded-full bg-spotify-green"
                style={{ width: `${percentOf(progress, item.durationMs)}%` }}
              />
            </div>
            <span>{formatDuration(item.durationMs)}</span>
          </div>
        </div>

        <SpotifyLink href={item.url} label={item.title} />
      </div>
    </section>
  );
}

export default function NowPlaying() {
  return hasGrantedScope(SCOPE) ? <PlaybackStatus /> : <ReconnectPrompt />;
}
