import { useMemo } from 'react';
import { Disc } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TimeRange } from '../types/spotify';
import { useTopTracks } from '../hooks/useSpotify';
import { getReleaseYear, getTopAlbums } from '../utils/stats';
import { joinArtistNames, truncateString } from '../utils/formatters';
import {
  ALBUM_NAME_MAX_LENGTH,
  CHART_AXIS_STROKE,
  CHART_BAR_CURSOR,
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_HEIGHT,
  CHART_TOOLTIP_PROPS,
} from '../constants';
import ChartCard from './ChartCard';
import CoverImage from './CoverImage';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';
import SpotifyLink from './SpotifyLink';

/** Albums ranked by how many of the user's top tracks they contain. */
export default function TopAlbums({ timeRange }: { timeRange: TimeRange }) {
  const { data: tracks, isPending, isError, error, refetch } = useTopTracks(timeRange);
  const albums = useMemo(() => getTopAlbums(tracks ?? []), [tracks]);

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} onRetry={() => refetch()} />;
  if (albums.length === 0) return <EmptyState>No album data available</EmptyState>;

  const chartData = albums.slice(0, 10).map((album) => ({
    name: truncateString(album.name, ALBUM_NAME_MAX_LENGTH),
    tracks: album.trackCount,
  }));

  return (
    <div className="space-y-6">
      <ChartCard title="Top Albums by Track Count">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
            <XAxis
              dataKey="name"
              stroke={CHART_AXIS_STROKE}
              angle={-45}
              textAnchor="end"
              height={120}
            />
            <YAxis stroke={CHART_AXIS_STROKE} allowDecimals={false} />
            <Tooltip {...CHART_TOOLTIP_PROPS} cursor={CHART_BAR_CURSOR} />
            <Bar
              dataKey="tracks"
              name="Top tracks"
              fill={CHART_COLORS.SPOTIFY_GREEN}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ol
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-label="Top albums"
      >
        {albums.map((album, index) => {
          const year = getReleaseYear(album.release_date);
          return (
            <li key={album.id} className="card transition-all hover:bg-gray-700/50">
              <CoverImage
                images={album.images}
                alt={`Album cover for ${album.name}`}
                size={300}
                className="mb-4 aspect-square w-full rounded-lg"
                fallbackIcon={Disc}
              />

              {/* Rank sits beside the title (as on artist cards), not over the cover art. */}
              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 text-2xl leading-tight font-bold text-spotify-green tabular-nums"
                  aria-label={`Rank ${index + 1}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="mb-1 truncate font-semibold">{album.name}</h4>
                  {album.artists && album.artists.length > 0 && (
                    <p className="mb-2 truncate text-sm text-gray-400">
                      {joinArtistNames(album.artists)}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'} in top
                </span>
                <SpotifyLink href={album.external_urls.spotify} label={album.name} size={16} />
              </div>

              {year && <p className="mt-1 text-xs text-gray-400">Released: {year}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
