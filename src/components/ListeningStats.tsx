import { useState, useEffect } from 'react';
import { Music, Users, Clock, TrendingUp } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { TimeRange } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface ListeningStatsProps {
  timeRange: TimeRange;
}

export default function ListeningStats({ timeRange }: ListeningStatsProps) {
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    totalDuration: 0,
    avgPopularity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tracks, artists] = await Promise.all([
          spotifyService.getTopTracks(timeRange, 50),
          spotifyService.getTopArtists(timeRange, 50),
        ]);

        const totalDuration = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
        const avgPopularity = tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length;

        setStats({
          totalTracks: tracks.length,
          totalArtists: artists.length,
          totalDuration,
          avgPopularity: Math.round(avgPopularity),
        });
      } catch (err) {
        setError('Failed to load listening stats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const statCards = [
    {
      icon: Music,
      label: 'Top Tracks',
      value: stats.totalTracks,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: Users,
      label: 'Top Artists',
      value: stats.totalArtists,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
    },
    {
      icon: Clock,
      label: 'Total Duration',
      value: formatDuration(stats.totalDuration),
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
    },
    {
      icon: TrendingUp,
      label: 'Avg Popularity',
      value: stats.avgPopularity,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div key={index} className="card hover:scale-105 transition-transform duration-200">
          <div className={`${stat.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
            <stat.icon className={stat.color} size={24} />
          </div>
          <p className="text-gray-400 text-sm">{stat.label}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
