import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Music } from 'lucide-react';
import type { SpotifyArtist, TimeRange } from '../types/spotify';
import { useTopArtists } from '../hooks/useSpotify';
import { truncateString } from '../utils/formatters';
import { hasPopularity } from '../utils/stats';
import {
  ARTIST_NAME_MAX_LENGTH,
  CHART_AXIS_STROKE,
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_HEIGHT,
  CHART_TOOLTIP_STYLE,
} from '../constants';
import ChartCard from './ChartCard';
import CoverImage from './CoverImage';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SpotifyLink from './SpotifyLink';

interface TopArtistsProps {
  timeRange: TimeRange;
  /** Compact top-5 list for the overview tab. */
  preview?: boolean;
}

export default function TopArtists({ timeRange, preview = false }: TopArtistsProps) {
  const { data: artists, isPending, isError, error, refetch } = useTopArtists(timeRange);

  const chartData = useMemo(
    () =>
      (artists ?? []).slice(0, 10).map((artist) => ({
        name: truncateString(artist.name, ARTIST_NAME_MAX_LENGTH),
        popularity: artist.popularity ?? 0,
      })),
    [artists],
  );

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (artists.length === 0) return <EmptyState>No artist data available</EmptyState>;

  // Spotify stopped returning popularity to Development Mode apps in 2026.
  const showPopularity = hasPopularity(artists);

  if (preview) {
    return (
      <ol className="space-y-3" aria-label="Top artists preview">
        {artists.slice(0, 5).map((artist, index) => (
          <li
            key={artist.id}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
          >
            <span
              className="w-8 shrink-0 text-right text-xl font-bold text-spotify-green tabular-nums"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <CoverImage
              images={artist.images}
              alt=""
              size={40}
              className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white/10"
              fallbackIcon={Music}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{artist.name}</p>
              <p className="truncate text-xs text-gray-400">
                {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
              </p>
            </div>
            {showPopularity && (
              <span className="shrink-0 text-sm text-gray-400">{artist.popularity}</span>
            )}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="space-y-6">
      {showPopularity && (
        <>
          {/* Mobile: list with bars */}
          <div className="md:hidden">
            <ChartCard title="Top Artists by Popularity">
              <ol className="space-y-3">
                {artists.slice(0, 10).map((artist, index) => (
                  <li key={artist.id} className="flex items-center gap-3">
                    <span className="w-6 text-sm font-bold text-spotify-green" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="truncate text-sm font-medium">{artist.name}</span>
                        <span className="ml-2 text-xs text-gray-400">{artist.popularity}</span>
                      </div>
                      <PopularityBar value={artist.popularity} label={artist.name} />
                    </div>
                  </li>
                ))}
              </ol>
            </ChartCard>
          </div>

          {/* Desktop: chart */}
          <div className="hidden md:block">
            <ChartCard title="Popularity Chart">
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                  <XAxis
                    dataKey="name"
                    stroke={CHART_AXIS_STROKE}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke={CHART_AXIS_STROKE} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar
                    dataKey="popularity"
                    fill={CHART_COLORS.SPOTIFY_GREEN}
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      <ol
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-label="All top artists"
      >
        {artists.map((artist, index) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            rank={index + 1}
            showPopularity={showPopularity}
          />
        ))}
      </ol>
    </div>
  );
}

function PopularityBar({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div
      className="h-2 flex-1 overflow-hidden rounded-full bg-white/10"
      role="progressbar"
      aria-valuenow={value ?? 0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${label} popularity`}
    >
      <div
        className="h-2 rounded-full bg-linear-to-r from-spotify-green to-spotify-green-light shadow-glow-green transition-all duration-500"
        style={{ width: `${value ?? 0}%` }}
      />
    </div>
  );
}

interface ArtistCardProps {
  artist: SpotifyArtist;
  rank: number;
  showPopularity: boolean;
}

function ArtistCard({ artist, rank, showPopularity }: ArtistCardProps) {
  return (
    <li className="card transition-all duration-300">
      <div className="flex items-center gap-3">
        <span
          className="w-10 shrink-0 text-right text-2xl font-bold text-spotify-green tabular-nums"
          aria-label={`Rank ${rank}`}
        >
          {rank}
        </span>

        <CoverImage
          images={artist.images}
          alt=""
          size={48}
          className="h-12 w-12 shrink-0 rounded-full shadow-md ring-2 ring-white/10"
          fallbackIcon={Music}
        />

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold">{artist.name}</h4>
          {artist.genres && artist.genres.length > 0 && (
            <p className="truncate text-sm text-gray-400">{artist.genres.slice(0, 2).join(', ')}</p>
          )}
          {showPopularity && (
            <div className="mt-1 flex items-center gap-2">
              <PopularityBar value={artist.popularity} label={artist.name} />
              <span className="w-6 text-xs font-medium text-gray-300">{artist.popularity}</span>
            </div>
          )}
        </div>

        <SpotifyLink href={artist.external_urls.spotify} label={artist.name} size={16} />
      </div>
    </li>
  );
}
