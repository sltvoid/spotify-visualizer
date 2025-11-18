import { useState, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { spotifyService } from '../services/spotify';
import type { AudioFeatures as AudioFeaturesType, TimeRange } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface AudioFeaturesProps {
  timeRange: TimeRange;
}

export default function AudioFeatures({ timeRange }: AudioFeaturesProps) {
  const [features, setFeatures] = useState<AudioFeaturesType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      setLoading(true);
      setError(null);
      try {
        const tracks = await spotifyService.getTopTracks(timeRange, 50);
        const trackIds = tracks.map((t) => t.id);
        const audioFeatures = await spotifyService.getAudioFeatures(trackIds);
        setFeatures(audioFeatures);
      } catch (err: any) {
        if (err?.response?.status === 403) {
          setError('Audio features unavailable. This may be due to Spotify Development Mode restrictions. Try with fewer tracks or contact Spotify to enable Extended Quota Mode.');
        } else {
          setError('Failed to load audio features');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;
  if (features.length === 0) return <div className="text-gray-400 text-center p-4">No data available</div>;

  const averageFeatures = {
    danceability: features.reduce((sum, f) => sum + f.danceability, 0) / features.length,
    energy: features.reduce((sum, f) => sum + f.energy, 0) / features.length,
    speechiness: features.reduce((sum, f) => sum + f.speechiness, 0) / features.length,
    acousticness: features.reduce((sum, f) => sum + f.acousticness, 0) / features.length,
    instrumentalness: features.reduce((sum, f) => sum + f.instrumentalness, 0) / features.length,
    liveness: features.reduce((sum, f) => sum + f.liveness, 0) / features.length,
    valence: features.reduce((sum, f) => sum + f.valence, 0) / features.length,
  };

  const radarData = [
    { feature: 'Danceability', value: averageFeatures.danceability * 100 },
    { feature: 'Energy', value: averageFeatures.energy * 100 },
    { feature: 'Speechiness', value: averageFeatures.speechiness * 100 },
    { feature: 'Acousticness', value: averageFeatures.acousticness * 100 },
    { feature: 'Instrumentalness', value: averageFeatures.instrumentalness * 100 },
    { feature: 'Liveness', value: averageFeatures.liveness * 100 },
    { feature: 'Valence', value: averageFeatures.valence * 100 },
  ];

  const featureDescriptions = [
    {
      name: 'Danceability',
      value: (averageFeatures.danceability * 100).toFixed(1),
      description: 'How suitable a track is for dancing',
    },
    {
      name: 'Energy',
      value: (averageFeatures.energy * 100).toFixed(1),
      description: 'Intensity and activity level',
    },
    {
      name: 'Valence',
      value: (averageFeatures.valence * 100).toFixed(1),
      description: 'Musical positiveness (happy vs sad)',
    },
    {
      name: 'Acousticness',
      value: (averageFeatures.acousticness * 100).toFixed(1),
      description: 'Confidence the track is acoustic',
    },
    {
      name: 'Instrumentalness',
      value: (averageFeatures.instrumentalness * 100).toFixed(1),
      description: 'Predicts if track contains no vocals',
    },
    {
      name: 'Liveness',
      value: (averageFeatures.liveness * 100).toFixed(1),
      description: 'Presence of an audience',
    },
    {
      name: 'Speechiness',
      value: (averageFeatures.speechiness * 100).toFixed(1),
      description: 'Presence of spoken words',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Average Audio Features</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="feature" stroke="#9CA3AF" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
            <Radar
              name="Features"
              dataKey="value"
              stroke="#1DB954"
              fill="#1DB954"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureDescriptions.map((feature) => (
          <div key={feature.name} className="card">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{feature.name}</h4>
              <span className="text-spotify-green font-bold text-lg">
                {feature.value}%
              </span>
            </div>
            <p className="text-sm text-gray-400">{feature.description}</p>
            <div className="mt-3 bg-gray-700 rounded-full h-2">
              <div
                className="bg-spotify-green h-2 rounded-full transition-all duration-500"
                style={{ width: `${feature.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
