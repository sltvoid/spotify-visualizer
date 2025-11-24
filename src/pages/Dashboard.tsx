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
import ListeningInsights from '../components/ListeningInsights';

type TabId = 'overview' | 'insights' | 'artists' | 'tracks' | 'albums' | 'recent' | 'library' | 'playlists' | 'features' | 'genres' | 'advanced';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'insights', label: 'Insights' },
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
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1 animate-float">
            <SpotifyLogo size={64} className="text-spotify-green drop-shadow-[0_0_15px_rgba(29,185,84,0.5)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-1 bg-gradient-to-r from-spotify-green via-green-400 to-spotify-green-light bg-clip-text text-transparent drop-shadow-lg">
            Your Spotify Stats
          </h1>
          <p className="text-gray-300">Discover your music insights and listening habits</p>
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
        <div className="card">
          {/* Mobile: Dropdown Select */}
          <div className="md:hidden">
            <label className="block text-sm font-medium text-gray-400 mb-2">Section</label>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabId)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id} className="bg-gray-800">
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop: Tab Buttons */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-spotify-green to-spotify-green-light text-white shadow-glow-green-strong border border-white/20'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20'
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

          {activeTab === 'insights' && <ListeningInsights timeRange={timeRange} />}

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
