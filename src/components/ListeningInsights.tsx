import { useMemo, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, Calendar, Music2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import type { TimeRange } from '../types/spotify';
import { useAudioFeatures, useTopArtists, useTopTracks } from '../hooks/useSpotify';
import {
  average,
  averagePopularity,
  getArtistLoyalty,
  getDecadeDistribution,
  getGenreDiversity,
  getMoodDistribution,
  getScoreLabel,
} from '../utils/stats';
import {
  CHART_AXIS_STROKE,
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_HEIGHT,
  CHART_TOOLTIP_STYLE,
  PIE_CHART_OUTER_RADIUS,
} from '../constants';
import ChartCard from './ChartCard';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

function scoreColor(score: number): string {
  if (score >= 60) return 'text-spotify-green';
  if (score >= 40) return 'text-yellow-400';
  return 'text-gray-400';
}

interface ScoreCardProps {
  icon: ReactNode;
  title: string;
  score: number;
  caption: string;
  barColor: string;
  detail?: { label: string; value: ReactNode };
}

function ScoreCard({ icon, title, score, caption, barColor, detail }: ScoreCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
            {icon}
            <span>{title}</span>
          </div>
          <div className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</div>
          <div className="mt-1 text-xs text-gray-500">{caption}</div>
        </div>
        {detail && (
          <div className="text-right">
            <div className="text-xs text-gray-500">{detail.label}</div>
            <div className="text-sm font-medium">{detail.value}</div>
          </div>
        )}
      </div>
      <div
        className="mt-3 h-2 rounded-full bg-gray-700"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={title}
      >
        <div
          className={`${barColor} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ListeningInsights({ timeRange }: { timeRange: TimeRange }) {
  const tracksQuery = useTopTracks(timeRange);
  const artistsQuery = useTopArtists(timeRange);
  // Optional: most apps can no longer read audio features, so failures are ignored.
  const featuresQuery = useAudioFeatures(timeRange);

  const insights = useMemo(() => {
    if (!tracksQuery.data || !artistsQuery.data) return null;
    const tracks = tracksQuery.data;
    const artists = artistsQuery.data;
    const features = featuresQuery.data ?? [];

    const avgPopularity = averagePopularity(artists);
    const avgEnergy = average(features.map((f) => f.energy));
    const mood = getMoodDistribution(features);

    return {
      obscurity: avgPopularity === null ? null : Math.round(100 - avgPopularity),
      diversity: getGenreDiversity(artists),
      loyalty: getArtistLoyalty(tracks),
      decades: getDecadeDistribution(tracks),
      energy: avgEnergy === null ? null : Math.round(avgEnergy * 100),
      mood:
        features.length === 0
          ? []
          : [
              { name: 'Happy', value: mood.happy, color: CHART_COLORS.HAPPY },
              { name: 'Neutral', value: mood.neutral, color: CHART_COLORS.NEUTRAL },
              { name: 'Sad', value: mood.sad, color: CHART_COLORS.SAD },
            ],
    };
  }, [tracksQuery.data, artistsQuery.data, featuresQuery.data]);

  if (tracksQuery.isError) {
    return <ErrorMessage error={tracksQuery.error} onRetry={() => tracksQuery.refetch()} />;
  }
  if (artistsQuery.isError) {
    return <ErrorMessage error={artistsQuery.error} onRetry={() => artistsQuery.refetch()} />;
  }
  if (!insights) return <LoadingSpinner />;

  const { obscurity, diversity, loyalty, decades, energy, mood } = insights;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {obscurity !== null && (
          <ScoreCard
            icon={<Sparkles size={16} aria-hidden="true" />}
            title="Obscurity Score"
            score={obscurity}
            caption={obscurity >= 60 ? 'Hipster' : obscurity >= 40 ? 'Balanced' : 'Mainstream'}
            barColor="bg-purple-500"
            detail={{ label: 'Avg Popularity', value: 100 - obscurity }}
          />
        )}
        <ScoreCard
          icon={<Music2 size={16} aria-hidden="true" />}
          title="Genre Diversity"
          score={diversity.score}
          caption={getScoreLabel(diversity.score)}
          barColor="bg-blue-500"
          detail={{ label: 'Unique Genres', value: diversity.uniqueGenres }}
        />
        <ScoreCard
          icon={<Award size={16} aria-hidden="true" />}
          title="Artist Loyalty"
          score={loyalty.score}
          caption={
            loyalty.score >= 60 ? 'Very Loyal' : loyalty.score >= 40 ? 'Balanced' : 'Explorer'
          }
          barColor="bg-orange-500"
          detail={{ label: 'Avg Repeats', value: loyalty.avgAppearances.toFixed(1) }}
        />
        {energy !== null && (
          <ScoreCard
            icon={
              energy >= 60 ? (
                <TrendingUp size={16} aria-hidden="true" />
              ) : (
                <TrendingDown size={16} aria-hidden="true" />
              )
            }
            title="Energy Level"
            score={energy}
            caption={energy >= 70 ? 'High Energy' : energy >= 40 ? 'Balanced' : 'Chill'}
            barColor="bg-red-500"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title={
            <span className="flex items-center gap-2">
              <Calendar size={20} className="text-spotify-green" aria-hidden="true" />
              Decade Distribution
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={decades}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              <XAxis dataKey="decade" stroke={CHART_AXIS_STROKE} />
              <YAxis stroke={CHART_AXIS_STROKE} allowDecimals={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Bar dataKey="count" fill={CHART_COLORS.SPOTIFY_GREEN} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {mood.length > 0 && (
          <ChartCard title="Mood Distribution">
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={mood}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={PIE_CHART_OUTER_RADIUS}
                  label={false}
                >
                  {mood.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      <ChartCard title="Your Listening Profile">
        <div className="space-y-3 text-gray-300">
          {obscurity !== null && (
            <p>
              🎵 You have a{' '}
              <strong className={scoreColor(obscurity)}>
                {obscurity >= 60 ? 'niche' : obscurity >= 40 ? 'balanced' : 'mainstream'}
              </strong>{' '}
              taste in music with an obscurity score of {obscurity}.
            </p>
          )}
          <p>
            🎨 Your genre diversity is{' '}
            <strong className={scoreColor(diversity.score)}>
              {getScoreLabel(diversity.score).toLowerCase()}
            </strong>
            , exploring {diversity.uniqueGenres} unique genres.
          </p>
          <p>
            ⭐ You show{' '}
            <strong className={scoreColor(loyalty.score)}>
              {loyalty.score >= 60
                ? 'high loyalty'
                : loyalty.score >= 40
                  ? 'balanced loyalty'
                  : 'strong exploration'}
            </strong>{' '}
            to your favorite artists.
          </p>
          {energy !== null && (
            <p>
              ⚡ Your music energy level is{' '}
              <strong className={scoreColor(energy)}>
                {energy >= 70 ? 'very high' : energy >= 40 ? 'moderate' : 'low and chill'}
              </strong>{' '}
              at {energy}/100.
            </p>
          )}
        </div>
      </ChartCard>
    </div>
  );
}
