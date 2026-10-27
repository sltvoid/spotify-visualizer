import { useRef, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import type { TimeRange } from '../types/spotify';
import { DASHBOARD_TABS, DEFAULT_TIME_RANGE, TIME_RANGES, type DashboardTabId } from '../constants';
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

function isTabId(value: string | null): value is DashboardTabId {
  return DASHBOARD_TABS.some((tab) => tab.id === value);
}

function isTimeRange(value: string | null): value is TimeRange {
  return TIME_RANGES.some((range) => range.value === value);
}

function TabPanel({ tab, timeRange }: { tab: DashboardTabId; timeRange: TimeRange }) {
  switch (tab) {
    case 'overview':
      return (
        <div className="space-y-6">
          <ListeningStats timeRange={timeRange} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card">
              <h3 className="mb-4 text-xl font-bold">Top Artists</h3>
              <TopArtists timeRange={timeRange} preview />
            </section>
            <section className="card">
              <h3 className="mb-4 text-xl font-bold">Top Genres</h3>
              <GenreDistribution timeRange={timeRange} preview />
            </section>
          </div>
        </div>
      );
    case 'insights':
      return <ListeningInsights timeRange={timeRange} />;
    case 'artists':
      return <TopArtists timeRange={timeRange} />;
    case 'tracks':
      return <TopTracks timeRange={timeRange} />;
    case 'albums':
      return <TopAlbums timeRange={timeRange} />;
    case 'library':
      return <SavedLibrary />;
    case 'playlists':
      return <Playlists />;
    case 'recent':
      return <RecentlyPlayed />;
    case 'features':
      return <AudioFeatures timeRange={timeRange} />;
    case 'advanced':
      return <AdvancedAudioAnalysis timeRange={timeRange} />;
    case 'genres':
      return <GenreDistribution timeRange={timeRange} />;
  }
}

export default function Dashboard() {
  // Tab and time range live in the URL so refresh, back/forward, and shared links work.
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const rangeParam = searchParams.get('range');
  const activeTab: DashboardTabId = isTabId(tabParam) ? tabParam : 'overview';
  const timeRange: TimeRange = isTimeRange(rangeParam) ? rangeParam : DEFAULT_TIME_RANGE;
  const tabRefs = useRef<Partial<Record<DashboardTabId, HTMLButtonElement | null>>>({});

  const updateParam = (key: 'tab' | 'range', value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  const setActiveTab = (tab: DashboardTabId) => updateParam('tab', tab);
  const setTimeRange = (range: TimeRange) => updateParam('range', range);

  // Arrow-key navigation between tabs (WAI-ARIA tabs pattern).
  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = DASHBOARD_TABS.findIndex((tab) => tab.id === activeTab);
    const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    let nextIndex: number;
    if (event.key in offsets) {
      nextIndex = (index + offsets[event.key] + DASHBOARD_TABS.length) % DASHBOARD_TABS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = DASHBOARD_TABS.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const nextTab = DASHBOARD_TABS[nextIndex].id;
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  const showTimeRange = DASHBOARD_TABS.find((tab) => tab.id === activeTab)?.usesTimeRange;

  return (
    <div className="relative z-10 min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="mb-8 text-center">
          <div className="mb-1 flex animate-float justify-center">
            <SpotifyLogo
              size={64}
              className="text-spotify-green drop-shadow-[0_0_15px_rgba(29,185,84,0.5)]"
            />
          </div>
          <h1 className="mb-1 bg-linear-to-r from-spotify-green via-green-400 to-spotify-green-light bg-clip-text text-4xl font-bold text-transparent drop-shadow-lg md:text-5xl">
            Your Spotify Stats
          </h1>
          <p className="text-gray-300">Discover your music insights and listening habits</p>
        </header>

        <UserProfile />

        {showTimeRange && (
          <section className="card" aria-labelledby="time-period-label">
            <h2 className="mb-3 text-lg font-semibold" id="time-period-label">
              Time Period
            </h2>
            <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
          </section>
        )}

        <nav className="card" aria-label="Dashboard sections">
          {/* Mobile: dropdown */}
          <div className="md:hidden">
            <label
              htmlFor="section-select"
              className="mb-2 block text-sm font-medium text-gray-400"
            >
              Section
            </label>
            <select
              id="section-select"
              value={activeTab}
              onChange={(e) => isTabId(e.target.value) && setActiveTab(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white focus:border-transparent focus:ring-2 focus:ring-spotify-green focus:outline-none"
            >
              {DASHBOARD_TABS.map((tab) => (
                <option key={tab.id} value={tab.id} className="bg-gray-800">
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop: tabs */}
          <div
            className="hidden flex-wrap gap-2 md:flex"
            role="tablist"
            aria-label="Dashboard sections"
            onKeyDown={handleTabKeyDown}
          >
            {DASHBOARD_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls="dashboard-panel"
                  tabIndex={selected ? 0 : -1}
                  className={`rounded-xl px-4 py-2 font-medium whitespace-nowrap transition-all duration-300 ${
                    selected
                      ? 'border border-white/20 bg-linear-to-br from-spotify-green to-spotify-green-light text-white shadow-glow-green-strong'
                      : 'border border-white/10 bg-white/5 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        <main id="dashboard-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {/* Reset the boundary when the user switches tab or time range. */}
          <ErrorBoundary key={`${activeTab}-${timeRange}`}>
            <TabPanel tab={activeTab} timeRange={timeRange} />
          </ErrorBoundary>
        </main>

        <footer className="py-8 text-center text-sm text-gray-500">
          <p>Made with the Spotify Web API</p>
          <p className="mt-2">Your data stays in your browser and is never stored or shared</p>
        </footer>
      </div>
    </div>
  );
}
