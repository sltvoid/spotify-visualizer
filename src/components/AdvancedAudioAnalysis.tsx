import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { spotifyService } from '../services/spotify';
import type { TimeRange, AudioFeatures } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface AdvancedAudioAnalysisProps {
  timeRange: TimeRange;
}

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const COLORS = ['#1DB954', '#1ED760', '#2EBD59', '#1AA34A', '#158940', '#117A37', '#0D6B2E', '#095C25', '#05481C', '#023913', '#1DB954', '#1ED760'];

export default function AdvancedAudioAnalysis({ timeRange }: AdvancedAudioAnalysisProps) {
  const [features, setFeatures] = useState<AudioFeatures[]>([]);
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
      } catch (err) {
        setError('Failed to load audio analysis');
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

  // Key distribution
  const keyCount = new Map<number, number>();
  features.forEach((f) => {
    keyCount.set(f.key, (keyCount.get(f.key) || 0) + 1);
  });
  const keyData = Array.from(keyCount.entries())
    .map(([key, count]) => ({ name: KEY_NAMES[key] || 'Unknown', value: count }))
    .sort((a, b) => b.value - a.value);

  // Mode distribution (Major vs Minor)
  const majorCount = features.filter((f) => f.mode === 1).length;
  const minorCount = features.filter((f) => f.mode === 0).length;
  const modeData = [
    { name: 'Major', value: majorCount },
    { name: 'Minor', value: minorCount },
  ];

  // Tempo ranges
  const tempoRanges = [
    { name: '< 80 BPM (Slow)', min: 0, max: 80 },
    { name: '80-100 BPM', min: 80, max: 100 },
    { name: '100-120 BPM', min: 100, max: 120 },
    { name: '120-140 BPM', min: 120, max: 140 },
    { name: '140-160 BPM', min: 140, max: 160 },
    { name: '> 160 BPM (Fast)', min: 160, max: 300 },
  ];
  const tempoData = tempoRanges.map((range) => ({
    name: range.name,
    count: features.filter((f) => f.tempo >= range.min && f.tempo < range.max).length,
  }));

  // Time signature distribution
  const timeSigCount = new Map<number, number>();
  features.forEach((f) => {
    timeSigCount.set(f.time_signature, (timeSigCount.get(f.time_signature) || 0) + 1);
  });
  const timeSigData = Array.from(timeSigCount.entries())
    .map(([sig, count]) => ({ name: `${sig}/4`, value: count }))
    .sort((a, b) => b.value - a.value);

  // Average stats
  const avgTempo = features.reduce((sum, f) => sum + f.tempo, 0) / features.length;
  const avgLoudness = features.reduce((sum, f) => sum + f.loudness, 0) / features.length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-sm">Average Tempo</p>
          <p className="text-3xl font-bold text-spotify-green">{avgTempo.toFixed(1)} BPM</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Average Loudness</p>
          <p className="text-3xl font-bold">{avgLoudness.toFixed(1)} dB</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Most Common Key</p>
          <p className="text-3xl font-bold">{keyData[0]?.name || 'N/A'}</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-sm">Mode Preference</p>
          <p className="text-3xl font-bold">{majorCount > minorCount ? 'Major' : 'Minor'}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Musical Key Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="#1DB954" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mode Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Major vs Minor Keys</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {modeData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#1DB954' : '#1AA34A'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tempo Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Tempo Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tempoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#1DB954" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Time Signature */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Time Signature</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeSigData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {timeSigData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
