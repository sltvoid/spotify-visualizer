import { Clock, Disc, Music, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import type { TimeRange } from '../types/spotify';
import { useTopArtists, useTopTracks } from '../hooks/useSpotify';
import { formatHoursMinutes } from '../utils/formatters';
import { averagePopularity } from '../utils/stats';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface StatTile {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

export default function ListeningStats({ timeRange }: { timeRange: TimeRange }) {
  const tracksQuery = useTopTracks(timeRange);
  const artistsQuery = useTopArtists(timeRange);

  if (tracksQuery.isPending || artistsQuery.isPending) return <LoadingSpinner />;
  if (tracksQuery.isError) {
    return <ErrorMessage error={tracksQuery.error} onRetry={() => tracksQuery.refetch()} />;
  }
  if (artistsQuery.isError) {
    return <ErrorMessage error={artistsQuery.error} onRetry={() => artistsQuery.refetch()} />;
  }

  const tracks = tracksQuery.data;
  const totalDuration = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
  const avgPopularity = averagePopularity(tracks);

  const stats: StatTile[] = [
    {
      icon: Music,
      label: 'Top Tracks',
      value: tracks.length,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Users,
      label: 'Top Artists',
      value: artistsQuery.data.length,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: Clock,
      label: 'Total Duration',
      value: formatHoursMinutes(totalDuration),
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    // Spotify stopped returning popularity to Development Mode apps in 2026.
    avgPopularity === null
      ? {
          icon: Disc,
          label: 'Albums',
          value: new Set(tracks.map((t) => t.album.id)).size,
          color: 'text-orange-400',
          bgColor: 'bg-orange-400/10',
        }
      : {
          icon: TrendingUp,
          label: 'Avg Popularity',
          value: Math.round(avgPopularity),
          color: 'text-orange-400',
          bgColor: 'bg-orange-400/10',
        },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, color, bgColor }) => (
        <div key={label} className="card transition-transform duration-200 hover:scale-105">
          <div className={`${bgColor} mb-3 flex h-12 w-12 items-center justify-center rounded-lg`}>
            <Icon className={color} size={24} aria-hidden="true" />
          </div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
      ))}
    </div>
  );
}
