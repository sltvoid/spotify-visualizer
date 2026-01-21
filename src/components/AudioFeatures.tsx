import { useEffect, useState, useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { AudioFeatures as AudioFeaturesType, TimeRange } from '../types/spotify';
import { useSpotifyData } from '../contexts';
import { CHART_TOOLTIP_STYLE, CHART_COLORS, CHART_GRID_STROKE, CHART_AXIS_STROKE } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { ErrorMessage } from './ErrorBoundary';

interface AudioFeaturesProps {
  timeRange: TimeRange;
}

const FEATURE_DESCRIPTIONS = [
  {
    key: 'danceability',
    name: 'Danceability',
    description: 'How suitable a track is for dancing',
  },
  {
    key: 'energy',
    name: 'Energy',
    description: 'Intensity and activity level',
  },
  {
    key: 'valence',
    name: 'Valence',
    description: 'Musical positiveness (happy vs sad)',
  },
  {
    key: 'acousticness',
    name: 'Acousticness',
    description: 'Confidence the track is acoustic',
  },
  {
    key: 'instrumentalness',
    name: 'Instrumentalness',
    description: 'Predicts if track contains no vocals',
  },
  {
    key: 'liveness',
    name: 'Liveness',
    description: 'Presence of an audience',
  },
  {
    key: 'speechiness',
    name: 'Speechiness',
    description: 'Presence of spoken words',
  },
] as const;

type FeatureKey = (typeof FEATURE_DESCRIPTIONS)[number]['key'];

export default function AudioFeatures({ timeRange }: AudioFeaturesProps) {
  const { fetchAudioFeatures, getAudioFeatures, fetchTopTracks, loading, errors } = useSpotifyData();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await fetchTopTracks(timeRange);
        await fetchAudioFeatures(timeRange);
      } catch (err) {
        if (err instanceof Error && err.message.includes('403')) {
          setLocalError(
            'Audio features unavailable. This may be due to Spotify Development Mode restrictions.'
          );
        } else {
          setLocalError(err instanceof Error ? err.message : 'Failed to load audio features');
        }
      }
    };
    loadData();
  }, [timeRange, fetchTopTracks, fetchAudioFeatures]);

  const features = getAudioFeatures(timeRange) || [];
  const isLoading = loading.audioFeatures && features.length === 0;
  const error = localError || errors.audioFeatures;

  const averageFeatures = useMemo(() => {
    if (features.length === 0) return null;

    const avg = (key: keyof AudioFeaturesType) =>
      features.reduce((sum, f) => sum + (f[key] as number), 0) / features.length;

    return {
      danceability: avg('danceability'),
      energy: avg('energy'),
      speechiness: avg('speechiness'),
      acousticness: avg('acousticness'),
      instrumentalness: avg('instrumentalness'),
      liveness: avg('liveness'),
      valence: avg('valence'),
    };
  }, [features]);

  const radarData = useMemo(() => {
    if (!averageFeatures) return [];
    return FEATURE_DESCRIPTIONS.map(({ key, name }) => ({
      feature: name,
      value: averageFeatures[key as FeatureKey] * 100,
    }));
  }, [averageFeatures]);

  const retryFetch = async () => {
    setLocalError(null);
    await fetchAudioFeatures(timeRange);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={retryFetch} />;
  if (!averageFeatures || features.length === 0) {
    return <div className="text-gray-400 text-center p-4">No audio feature data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Average Audio Features</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={CHART_GRID_STROKE} />
            <PolarAngleAxis dataKey="feature" stroke={CHART_AXIS_STROKE} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke={CHART_AXIS_STROKE} />
            <Radar
              name="Features"
              dataKey="value"
              stroke={CHART_COLORS.SPOTIFY_GREEN}
              fill={CHART_COLORS.SPOTIFY_GREEN}
              fillOpacity={0.6}
            />
            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        role="list"
        aria-label="Audio feature breakdown"
      >
        {FEATURE_DESCRIPTIONS.map(({ key, name, description }) => {
          const value = (averageFeatures[key as FeatureKey] * 100).toFixed(1);
          return (
            <div key={key} className="card" role="listitem">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{name}</h4>
                <span className="text-spotify-green font-bold text-lg">{value}%</span>
              </div>
              <p className="text-sm text-gray-400">{description}</p>
              <div
                className="mt-3 bg-gray-700 rounded-full h-2"
                role="progressbar"
                aria-valuenow={parseFloat(value)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${name}: ${value}%`}
              >
                <div
                  className="bg-spotify-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
