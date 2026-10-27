import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUp, Music, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import type { SpotifyArtist, SpotifyImage, SpotifyTrack, TimeRange } from '../types/spotify';
import { useTopArtists, useTopTracks } from '../hooks/useSpotify';
import { compareRankings, type RankingComparison } from '../utils/stats';
import { joinArtistNames } from '../utils/formatters';
import { TIME_RANGES } from '../constants';
import CoverImage from './CoverImage';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SpotifyLink from './SpotifyLink';

type Baseline = Exclude<TimeRange, 'short_term'>;

const BASELINES: Baseline[] = ['medium_term', 'long_term'];
const rangeLabel = (range: TimeRange) => TIME_RANGES.find((r) => r.value === range)?.label ?? range;
/** Phrase used in sentences, e.g. "top 50 for all time". */
const BASELINE_PHRASE: Record<Baseline, string> = {
  medium_term: 'the last 6 months',
  long_term: 'all time',
};

interface Display {
  title: string;
  subtitle: string;
  images: SpotifyImage[] | undefined;
  url: string;
}

const artistDisplay = (artist: SpotifyArtist): Display => ({
  title: artist.name,
  subtitle: artist.genres?.slice(0, 2).join(', ') || 'Artist',
  images: artist.images,
  url: artist.external_urls.spotify,
});

const trackDisplay = (track: SpotifyTrack): Display => ({
  title: track.name,
  subtitle: joinArtistNames(track.artists),
  images: track.album.images,
  url: track.external_urls.spotify,
});

function TrendRow({ display, badge }: { display: Display; badge: ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5">
      <CoverImage
        images={display.images}
        alt=""
        size={40}
        className="h-10 w-10 shrink-0 rounded-md"
        fallbackIcon={Music}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{display.title}</p>
        <p className="truncate text-xs text-gray-400">{display.subtitle}</p>
      </div>
      <span className="shrink-0 text-xs font-semibold">{badge}</span>
      <SpotifyLink href={display.url} label={display.title} size={16} />
    </li>
  );
}

interface TrendColumnProps {
  icon: ReactNode;
  title: string;
  description: string;
  emptyText: string;
  children: ReactNode[];
}

function TrendColumn({ icon, title, description, emptyText, children }: TrendColumnProps) {
  return (
    <div>
      <h4 className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </h4>
      <p className="mb-3 text-xs text-gray-500">{description}</p>
      {children.length > 0 ? (
        <ul className="space-y-1">{children}</ul>
      ) : (
        <p className="rounded-lg bg-white/5 p-4 text-center text-sm text-gray-500">{emptyText}</p>
      )}
    </div>
  );
}

function TrendSection<T extends { id: string }>({
  title,
  comparison,
  toDisplay,
  baselinePhrase,
}: {
  title: string;
  comparison: RankingComparison<T>;
  toDisplay: (item: T) => Display;
  baselinePhrase: string;
}) {
  return (
    <section className="card">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TrendColumn
          icon={<Sparkles size={16} className="text-spotify-green" aria-hidden="true" />}
          title="New in rotation"
          description={`Not in your top 50 for ${baselinePhrase}`}
          emptyText="Nothing new lately"
        >
          {comparison.newEntries.map(({ item, rank }) => (
            <TrendRow
              key={item.id}
              display={toDisplay(item)}
              badge={
                <span className="rounded-full bg-spotify-green/20 px-2 py-0.5 text-spotify-green">
                  NEW · #{rank}
                </span>
              }
            />
          ))}
        </TrendColumn>

        <TrendColumn
          icon={<TrendingUp size={16} className="text-spotify-green" aria-hidden="true" />}
          title="Climbing"
          description="Ranked higher recently"
          emptyText="No big climbers"
        >
          {comparison.climbing.map(({ item, rank, previousRank }) => (
            <TrendRow
              key={item.id}
              display={toDisplay(item)}
              badge={
                <span
                  className="flex items-center gap-0.5 text-spotify-green"
                  aria-label={`Up ${previousRank! - rank} places, from #${previousRank} to #${rank}`}
                >
                  <ArrowUp size={12} aria-hidden="true" />
                  {previousRank! - rank}
                </span>
              }
            />
          ))}
        </TrendColumn>

        <TrendColumn
          icon={<TrendingDown size={16} className="text-orange-400" aria-hidden="true" />}
          title="Fading favorites"
          description={`In your top 20 for ${baselinePhrase}, but not lately`}
          emptyText="Your favorites are holding strong"
        >
          {comparison.fading.map(({ item, previousRank }) => (
            <TrendRow
              key={item.id}
              display={toDisplay(item)}
              badge={<span className="text-gray-400">was #{previousRank}</span>}
            />
          ))}
        </TrendColumn>
      </div>
    </section>
  );
}

/** What's new, rising, and fading: last 4 weeks compared with a longer period. */
export default function Trending() {
  const [baseline, setBaseline] = useState<Baseline>('long_term');

  const recentArtists = useTopArtists('short_term');
  const baselineArtists = useTopArtists(baseline);
  const recentTracks = useTopTracks('short_term');
  const baselineTracks = useTopTracks(baseline);
  const queries = [recentArtists, baselineArtists, recentTracks, baselineTracks];

  const artistTrends = useMemo(
    () =>
      recentArtists.data && baselineArtists.data
        ? compareRankings(recentArtists.data, baselineArtists.data)
        : null,
    [recentArtists.data, baselineArtists.data],
  );
  const trackTrends = useMemo(
    () =>
      recentTracks.data && baselineTracks.data
        ? compareRankings(recentTracks.data, baselineTracks.data)
        : null,
    [recentTracks.data, baselineTracks.data],
  );

  const failed = queries.find((q) => q.isError);
  if (failed) return <ErrorMessage error={failed.error} onRetry={() => failed.refetch()} />;
  if (!artistTrends || !trackTrends) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-300">
          Your top 50 from the <strong>last 4 weeks</strong>, compared with
        </p>
        <div className="flex gap-2" role="group" aria-label="Compare with">
          {BASELINES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setBaseline(range)}
              aria-pressed={baseline === range}
              className={`btn-secondary text-sm ${baseline === range ? 'bg-spotify-green' : ''}`}
            >
              {rangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      <TrendSection
        title="Artists"
        comparison={artistTrends}
        toDisplay={artistDisplay}
        baselinePhrase={BASELINE_PHRASE[baseline]}
      />
      <TrendSection
        title="Tracks"
        comparison={trackTrends}
        toDisplay={trackDisplay}
        baselinePhrase={BASELINE_PHRASE[baseline]}
      />
    </div>
  );
}
