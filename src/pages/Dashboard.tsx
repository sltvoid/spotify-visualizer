import { useState } from 'react';
import type { TimeRange } from '../types/spotify';
import { DASHBOARD_TABS, NO_TIME_RANGE_TABS } from '../constants';
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
import ErrorBoundary from '../components/ErrorBoundary';

type TabId = (typeof DASHBOARD_TABS)[number]['id'];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const showTimeRange = !NO_TIME_RANGE_TABS.includes(activeTab as (typeof NO_TIME_RANGE_TABS)[number]);

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center mb-1 animate-float">
            <SpotifyLogo
              size={64}
              className="text-spotify-green drop-shadow-[0_0_15px_rgba(29,185,84,0.5)]"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-1 bg-gradient-to-r from-spotify-green via-green-400 to-spotify-green-light bg-clip-text text-transparent drop-shadow-lg">
            Your Spotify Stats
          </h1>
          <p className="text-gray-300">Discover your music insights and listening habits</p>
        </header>

        {/* User Profile */}
        <UserProfile />

        {/* Time Range Selector */}
        {showTimeRange && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-3" id="time-period-label">
              Time Period
            </h3>
            <TimeRangeSelector
              selected={timeRange}
              onChange={setTimeRange}
            />
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="card" aria-label="Dashboard sections">
          {/* Mobile: Dropdown Select */}
          <div className="md:hidden">
            <label htmlFor="section-select" className="block text-sm font-medium text-gray-400 mb-2">
              Section
            </label>
            <select
              id="section-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabId)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
            >
              {DASHBOARD_TABS.map((tab) => (
                <option key={tab.id} value={tab.id} className="bg-gray-800">
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop: Tab Buttons */}
          <div className="hidden md:flex gap-2 flex-wrap" role="tablist" aria-label="Dashboard sections">
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
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
        </nav>

        {/* Content Panels */}
        <main>
          <ErrorBoundary>
            {activeTab === 'overview' && (
              <div
                id="panel-overview"
                role="tabpanel"
                aria-labelledby="tab-overview"
                className="space-y-6"
              >
                <ListeningStats timeRange={timeRange} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4">Top Artists Preview</h3>
                    <TopArtists timeRange={timeRange} preview />
                  </div>
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4">Genre Distribution Preview</h3>
                    <GenreDistribution timeRange={timeRange} preview />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div id="panel-insights" role="tabpanel" aria-labelledby="tab-insights">
                <ListeningInsights timeRange={timeRange} />
              </div>
            )}

            {activeTab === 'artists' && (
              <div id="panel-artists" role="tabpanel" aria-labelledby="tab-artists">
                <TopArtists timeRange={timeRange} />
              </div>
            )}

            {activeTab === 'tracks' && (
              <div id="panel-tracks" role="tabpanel" aria-labelledby="tab-tracks">
                <TopTracks timeRange={timeRange} />
              </div>
            )}

            {activeTab === 'albums' && (
              <div id="panel-albums" role="tabpanel" aria-labelledby="tab-albums">
                <TopAlbums timeRange={timeRange} />
              </div>
            )}

            {activeTab === 'library' && (
              <div id="panel-library" role="tabpanel" aria-labelledby="tab-library">
                <SavedLibrary />
              </div>
            )}

            {activeTab === 'playlists' && (
              <div id="panel-playlists" role="tabpanel" aria-labelledby="tab-playlists">
                <Playlists />
              </div>
            )}

            {activeTab === 'recent' && (
              <div id="panel-recent" role="tabpanel" aria-labelledby="tab-recent">
                <RecentlyPlayed />
              </div>
            )}

            {activeTab === 'features' && (
              <div id="panel-features" role="tabpanel" aria-labelledby="tab-features">
                <AudioFeatures timeRange={timeRange} />
              </div>
            )}

            {activeTab === 'advanced' && (
              <div id="panel-advanced" role="tabpanel" aria-labelledby="tab-advanced">
                <AdvancedAudioAnalysis timeRange={timeRange} />
              </div>
            )}

            {activeTab === 'genres' && (
              <div id="panel-genres" role="tabpanel" aria-labelledby="tab-genres">
                <GenreDistribution timeRange={timeRange} />
              </div>
            )}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-8">
          <p>Made with Spotify Web API</p>
          <p className="mt-2">Your data is never stored or shared</p>
        </footer>
      </div>
    </div>
  );
}
