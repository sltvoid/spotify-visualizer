import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink } from 'lucide-react';
import type { SpotifyArtist, TimeRange } from '../types/spotify';
import { useSpotifyData } from '../contexts';
import { truncateString } from '../utils/formatters';
import {
  CHART_HEIGHT,
  ARTIST_NAME_MAX_LENGTH,
  CHART_TOOLTIP_STYLE,
  CHART_GRID_STROKE,
  CHART_AXIS_STROKE,
  CHART_COLORS,
} from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { ErrorMessage } from './ErrorBoundary';

interface TopArtistsProps {
  timeRange: TimeRange;
  preview?: boolean;
}

export default function TopArtists({ timeRange, preview = false }: TopArtistsProps) {
  const { fetchTopArtists, getArtists, loading, errors } = useSpotifyData();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await fetchTopArtists(timeRange);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : 'Failed to load top artists');
      }
    };
    loadData();
  }, [timeRange, fetchTopArtists]);

  const artists = getArtists(timeRange) || [];
  const isLoading = loading.artists && artists.length === 0;
  const error = localError || errors.artists;

  const chartData = useMemo(
    () =>
      artists.slice(0, 10).map((artist, index) => ({
        name: truncateString(artist.name, ARTIST_NAME_MAX_LENGTH),
        popularity: artist.popularity || 0,
        rank: index + 1,
      })),
    [artists]
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchTopArtists(timeRange)} />;
  if (artists.length === 0) {
    return <div className="text-gray-400 text-center p-4">No artist data available</div>;
  }

  // Preview mode - simplified list for overview page
  if (preview) {
    return (
      <div className="space-y-3" role="list" aria-label="Top artists preview">
        {artists.slice(0, 5).map((artist, index) => (
          <div
            key={artist.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
            role="listitem"
          >
            <span
              className="flex-shrink-0 w-8 text-xl font-bold text-spotify-green text-right tabular-nums"
              aria-label={`Rank ${index + 1}`}
            >
              {index + 1}
            </span>
            {artist.images && artist.images[0] ? (
              <img
                src={artist.images[0].url}
                alt={`Profile photo of ${artist.name}`}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/10 flex-shrink-0">
                <span className="text-lg" aria-hidden="true">🎵</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{artist.name}</p>
              <p className="text-xs text-gray-400 truncate">
                {artist.genres?.slice(0, 2).join(', ') || 'Artist'}
              </p>
            </div>
            <span className="text-sm text-gray-400 flex-shrink-0">{artist.popularity}</span>
          </div>
        ))}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Mobile View - Compact List */}
      <div className="card md:hidden">
        <h3 className="text-xl font-bold mb-4">Top Artists by Popularity</h3>
        <div className="space-y-3" role="list" aria-label="Top artists list">
          {artists.slice(0, 10).map((artist, index) => (
            <div key={artist.id} className="flex items-center gap-3" role="listitem">
              <span className="text-spotify-green font-bold text-sm w-6" aria-label={`Rank ${index + 1}`}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{artist.name}</span>
                  <span className="text-xs text-gray-400 ml-2" aria-label={`Popularity score ${artist.popularity}`}>
                    {artist.popularity}
                  </span>
                </div>
                <div
                  className="bg-gray-700 rounded-full h-2 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={artist.popularity || 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-gradient-to-r from-spotify-green to-spotify-green-light h-2 rounded-full transition-all duration-500"
                    style={{ width: `${artist.popularity}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View - Chart */}
      <div className="card hidden md:block">
        <h3 className="text-xl font-bold mb-4">Popularity Chart</h3>
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
            <Bar dataKey="popularity" fill={CHART_COLORS.SPOTIFY_GREEN} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Artist Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        role="list"
        aria-label="All top artists"
      >
        {artists.map((artist, index) => (
          <ArtistCard key={artist.id} artist={artist} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

interface ArtistCardProps {
  artist: SpotifyArtist;
  rank: number;
}

function ArtistCard({ artist, rank }: ArtistCardProps) {
  return (
    <div className="card transition-all duration-300" role="listitem">
      <div className="flex items-center gap-3">
        {/* Rank Number - Fixed Width Column */}
        <span
          className="flex-shrink-0 w-10 text-2xl font-bold text-spotify-green text-right tabular-nums"
          aria-label={`Ranked number ${rank}`}
        >
          {rank}
        </span>

        {/* Artist Image */}
        {artist.images && artist.images[0] ? (
          <img
            src={artist.images[0].url}
            alt={`Profile photo of ${artist.name}`}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 shadow-md flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/10 flex-shrink-0"
            aria-label="No profile photo available"
          >
            <span className="text-xl" aria-hidden="true">
              🎵
            </span>
          </div>
        )}

        {/* Artist Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{artist.name}</h4>
          {artist.genres && artist.genres.length > 0 && (
            <p className="text-sm text-gray-400 truncate">{artist.genres.slice(0, 2).join(', ')}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <div
              className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm"
              role="progressbar"
              aria-valuenow={artist.popularity || 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Popularity score"
            >
              <div
                className="bg-gradient-to-r from-spotify-green to-spotify-green-light h-2 rounded-full shadow-glow-green transition-all duration-500"
                style={{ width: `${artist.popularity}%` }}
              />
            </div>
            <span className="text-xs text-gray-300 font-medium w-6">{artist.popularity}</span>
          </div>
        </div>

        {/* Spotify Link */}
        <a
          href={artist.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-spotify-green transition-colors flex-shrink-0 p-1"
          aria-label={`Open ${artist.name} on Spotify (opens in new tab)`}
        >
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
