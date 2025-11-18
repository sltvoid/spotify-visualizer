import { useState } from 'react';
import type { TimeRange } from '../types/spotify';
import UserProfile from '../components/UserProfile';
import TimeRangeSelector from '../components/TimeRangeSelector';
import ListeningStats from '../components/ListeningStats';
import TopArtists from '../components/TopArtists';
import TopTracks from '../components/TopTracks';
import RecentlyPlayed from '../components/RecentlyPlayed';
import AudioFeatures from '../components/AudioFeatures';
import GenreDistribution from '../components/GenreDistribution';
import SavedLibrary from '../components/SavedLibrary';
import TopAlbums from '../components/TopAlbums';
import AdvancedAudioAnalysis from '../components/AdvancedAudioAnalysis';
import Playlists from '../components/Playlists';
import SpotifyLogo from '../components/SpotifyLogo';

type TabId = 'overview' | 'artists' | 'tracks' | 'albums' | 'recent' | 'library' | 'playlists' | 'features' | 'genres' | 'advanced';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'artists', label: 'Top Artists' },
    { id: 'tracks', label: 'Top Tracks' },
    { id: 'albums', label: 'Top Albums' },
    { id: 'library', label: 'Library' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'recent', label: 'Recently Played' },
    { id: 'features', label: 'Audio Features' },
    { id: 'advanced', label: 'Advanced Audio' },
    { id: 'genres', label: 'Genres' },
  ];

  // Tabs that don't use time range
  const noTimeRangeTabs: TabId[] = ['recent', 'library', 'playlists'];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <SpotifyLogo size={64} className="text-spotify-green" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
            Your Spotify Stats
          </h1>
          <p className="text-gray-400">Discover your music insights and listening habits</p>
        </div>

        {/* User Profile */}
        <UserProfile />

        {/* Time Range Selector (not shown for certain tabs) */}
        {!noTimeRangeTabs.includes(activeTab) && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Time Period</h3>
            <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
          </div>
        )}

        {/* Tabs */}
        <div className="card overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-spotify-green text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ListeningStats timeRange={timeRange} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Top Artists Preview</h3>
                  <TopArtists timeRange={timeRange} />
                </div>
                <div className="card">
                  <h3 className="text-xl font-bold mb-4">Genre Distribution Preview</h3>
                  <GenreDistribution timeRange={timeRange} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'artists' && <TopArtists timeRange={timeRange} />}

          {activeTab === 'tracks' && <TopTracks timeRange={timeRange} />}

          {activeTab === 'albums' && <TopAlbums timeRange={timeRange} />}

          {activeTab === 'library' && <SavedLibrary />}

          {activeTab === 'playlists' && <Playlists />}

          {activeTab === 'recent' && <RecentlyPlayed />}

          {activeTab === 'features' && <AudioFeatures timeRange={timeRange} />}

          {activeTab === 'advanced' && <AdvancedAudioAnalysis timeRange={timeRange} />}

          {activeTab === 'genres' && <GenreDistribution timeRange={timeRange} />}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-8">
          <p>Made with Spotify Web API</p>
          <p className="mt-2">Your data is never stored or shared</p>
        </div>
      </div>
    </div>
  );
}
