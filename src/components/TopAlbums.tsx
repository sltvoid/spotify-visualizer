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
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
            <Bar dataKey="tracks" fill={CHART_COLORS.SPOTIFY_GREEN} radius={[8, 8, 0, 0]} />
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
              <div className="relative mb-4">
                <span
                  className="absolute -top-2 -left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-spotify-green text-xs font-bold text-white shadow-lg ring-2 ring-gray-900"
                  aria-label={`Rank ${index + 1}`}
                >
                  {index + 1}
                </span>
                <CoverImage
                  images={album.images}
                  alt={`Album cover for ${album.name}`}
                  size={300}
                  className="aspect-square w-full rounded-lg"
                  fallbackIcon={Disc}
                />
              </div>

              <h4 className="mb-1 truncate font-semibold">{album.name}</h4>
              {album.artists && album.artists.length > 0 && (
                <p className="mb-2 truncate text-sm text-gray-400">
                  {joinArtistNames(album.artists)}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {album.trackCount} {album.trackCount === 1 ? 'track' : 'tracks'} in top
                </span>
                <SpotifyLink href={album.external_urls.spotify} label={album.name} size={16} />
              </div>

              {year && <p className="mt-1 text-xs text-gray-500">Released: {year}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
