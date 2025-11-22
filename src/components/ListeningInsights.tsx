import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Award, Music2, Calendar, Sparkles } from 'lucide-react';
import { spotifyService } from '../services/spotify';
import type { TimeRange, SpotifyTrack, AudioFeatures, SpotifyArtist } from '../types/spotify';
import LoadingSpinner from './LoadingSpinner';

interface ListeningInsightsProps {
  timeRange: TimeRange;
}

export default function ListeningInsights({ timeRange }: ListeningInsightsProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tracksData, artistsData] = await Promise.all([
          spotifyService.getTopTracks(timeRange, 50),
          spotifyService.getTopArtists(timeRange, 50),
        ]);

        setTracks(tracksData);
        setArtists(artistsData);

        // Fetch audio features
        try {
          const trackIds = tracksData.map((t) => t.id);
          const features = await spotifyService.getAudioFeatures(trackIds);
          setAudioFeatures(features);
        } catch (err) {
          console.warn('Could not fetch audio features:', err);
          setAudioFeatures([]);
        }
      } catch (err) {
        setError('Failed to load listening insights');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-400 text-center p-4">{error}</div>;

  // Calculate Obscurity Score (0-100, lower = more mainstream)
  const obscurityScore = artists.length > 0
    ? Math.round(100 - artists.reduce((sum, a) => sum + a.popularity, 0) / artists.length)
    : 0;

  // Calculate Genre Diversity Index
  const allGenres = artists.flatMap((a) => a.genres);
  const uniqueGenres = new Set(allGenres);
  const genreDiversityScore = allGenres.length > 0
    ? Math.min(100, Math.round((uniqueGenres.size / allGenres.length) * 200))
    : 0;

  // Calculate Artist Loyalty Score (how much repetition vs discovery)
  const artistAppearances = new Map<string, number>();
  tracks.forEach((track) => {
    track.artists.forEach((artist) => {
      artistAppearances.set(artist.id, (artistAppearances.get(artist.id) || 0) + 1);
    });
  });
  const avgAppearances = Array.from(artistAppearances.values()).reduce((a, b) => a + b, 0) / artistAppearances.size;
  const loyaltyScore = Math.min(100, Math.round(avgAppearances * 20));

  // Decade Distribution
  const decadeCounts = new Map<string, number>();
  tracks.forEach((track) => {
    const year = new Date(track.album.release_date).getFullYear();
    const decade = Math.floor(year / 10) * 10;
    decadeCounts.set(`${decade}s`, (decadeCounts.get(`${decade}s`) || 0) + 1);
  });
  const decadeData = Array.from(decadeCounts.entries())
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Mood Analysis (if audio features available)
  let moodData: { name: string; value: number; color: string }[] = [];
  let energyScore = 0;

  if (audioFeatures.length > 0) {
    const avgValence = audioFeatures.reduce((sum, f) => sum + f.valence, 0) / audioFeatures.length;
    const avgEnergy = audioFeatures.reduce((sum, f) => sum + f.energy, 0) / audioFeatures.length;
    energyScore = Math.round(avgEnergy * 100);

    // Categorize mood
    const happy = audioFeatures.filter((f) => f.valence > 0.6).length;
    const neutral = audioFeatures.filter((f) => f.valence >= 0.4 && f.valence <= 0.6).length;
    const sad = audioFeatures.filter((f) => f.valence < 0.4).length;

    moodData = [
      { name: 'Happy', value: happy, color: '#1DB954' },
      { name: 'Neutral', value: neutral, color: '#FFD700' },
      { name: 'Sad', value: sad, color: '#6B7280' },
    ];
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Low';
    return 'Very Low';
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-spotify-green';
    if (score >= 40) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Sparkles size={16} />
                <span>Obscurity Score</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(obscurityScore)}`}>
                {obscurityScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {obscurityScore >= 60 ? 'Hipster' : obscurityScore >= 40 ? 'Balanced' : 'Mainstream'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Avg Popularity</div>
              <div className="text-sm font-medium">{Math.round(100 - obscurityScore)}</div>
            </div>
          </div>
          <div className="mt-3 bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${obscurityScore}%` }}
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Music2 size={16} />
                <span>Genre Diversity</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(genreDiversityScore)}`}>
                {genreDiversityScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getScoreLabel(genreDiversityScore)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Unique Genres</div>
              <div className="text-sm font-medium">{uniqueGenres.size}</div>
            </div>
          </div>
          <div className="mt-3 bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${genreDiversityScore}%` }}
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <Award size={16} />
                <span>Artist Loyalty</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(loyaltyScore)}`}>
                {loyaltyScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {loyaltyScore >= 60 ? 'Very Loyal' : loyaltyScore >= 40 ? 'Balanced' : 'Explorer'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Avg Repeats</div>
              <div className="text-sm font-medium">{avgAppearances.toFixed(1)}</div>
            </div>
          </div>
          <div className="mt-3 bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${loyaltyScore}%` }}
            />
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                {energyScore >= 60 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>Energy Level</span>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(energyScore)}`}>
                {energyScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {energyScore >= 70 ? 'High Energy' : energyScore >= 40 ? 'Balanced' : 'Chill'}
              </div>
            </div>
          </div>
          <div className="mt-3 bg-gray-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${energyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decade Distribution */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-spotify-green" />
            <h3 className="text-xl font-bold">Decade Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={decadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="decade" stroke="#9CA3AF" />
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

        {/* Mood Distribution */}
        {moodData.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Mood Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {moodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Insights Summary */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Your Listening Profile</h3>
        <div className="space-y-3 text-gray-300">
          <p>
            🎵 You have a <strong className={getScoreColor(obscurityScore)}>
              {obscurityScore >= 60 ? 'niche' : obscurityScore >= 40 ? 'balanced' : 'mainstream'}
            </strong> taste in music with an obscurity score of {obscurityScore}.
          </p>
          <p>
            🎨 Your genre diversity is <strong className={getScoreColor(genreDiversityScore)}>
              {getScoreLabel(genreDiversityScore).toLowerCase()}
            </strong>, exploring {uniqueGenres.size} unique genres.
          </p>
          <p>
            ⭐ You show <strong className={getScoreColor(loyaltyScore)}>
              {loyaltyScore >= 60 ? 'high loyalty' : loyaltyScore >= 40 ? 'balanced loyalty' : 'strong exploration'}
            </strong> to your favorite artists.
          </p>
          {energyScore > 0 && (
            <p>
              ⚡ Your music energy level is <strong className={getScoreColor(energyScore)}>
                {energyScore >= 70 ? 'very high' : energyScore >= 40 ? 'moderate' : 'low and chill'}
              </strong> at {energyScore}/100.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
