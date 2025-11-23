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
import MobileTabBar from '../components/MobileTabBar';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useIsMobile';

type TabId = 'overview' | 'insights' | 'artists' | 'tracks' | 'albums' | 'recent' | 'library' | 'playlists' | 'features' | 'genres' | 'advanced';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const isMobile = useIsMobile();

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
    <div className="min-h-screen relative z-10">
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          {/* Mobile Header with Menu */}
          <MobileHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            allTabs={tabs}
          />

          {/* Mobile Content with bottom padding for tab bar */}
          <div className="px-3 py-3 pb-24 space-y-3">
            {/* Time Range Selector for Mobile (shown above content) */}
            {!noTimeRangeTabs.includes(activeTab) && (
              <div className="card">
                <h3 className="text-xs font-semibold mb-2.5 text-gray-300 uppercase tracking-wide">Time Period</h3>
                <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
              </div>
            )}

            {/* Content */}
            {renderContent()}
          </div>

          {/* Mobile Bottom Tab Bar */}
          <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      ) : (
        /* Desktop Layout */
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Desktop Header */}
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

            {/* Desktop Tabs */}
            <div className="card overflow-x-auto">
              <div className="flex gap-2 pb-2 min-w-max">
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

              {/* Time Range Selector (shown inline for relevant tabs) */}
              {!noTimeRangeTabs.includes(activeTab) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold mb-3 text-gray-300">Time Period</h3>
                  <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
                </div>
              )}
            </div>

            {/* Content */}
            {renderContent()}

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm py-8">
              <p>Made with Spotify Web API</p>
              <p className="mt-2">Your data is never stored or shared</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render content based on active tab
  function renderContent() {
    if (activeTab === 'overview') {
      return (
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
      );
    }
    if (activeTab === 'insights') return <ListeningInsights timeRange={timeRange} />;
    if (activeTab === 'artists') return <TopArtists timeRange={timeRange} />;
    if (activeTab === 'tracks') return <TopTracks timeRange={timeRange} />;
    if (activeTab === 'albums') return <TopAlbums timeRange={timeRange} />;
    if (activeTab === 'library') return <SavedLibrary />;
    if (activeTab === 'playlists') return <Playlists />;
    if (activeTab === 'recent') return <RecentlyPlayed />;
    if (activeTab === 'features') return <AudioFeatures timeRange={timeRange} />;
    if (activeTab === 'advanced') return <AdvancedAudioAnalysis timeRange={timeRange} />;
    if (activeTab === 'genres') return <GenreDistribution timeRange={timeRange} />;
    return null;
  }
}
