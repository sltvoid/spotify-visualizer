import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import SpotifyLogo from './SpotifyLogo';

type TabId = 'overview' | 'insights' | 'artists' | 'tracks' | 'albums' | 'recent' | 'library' | 'playlists' | 'features' | 'genres' | 'advanced';

interface MobileHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  allTabs: { id: TabId; label: string }[];
}

export default function MobileHeader({ activeTab, onTabChange, allTabs }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleTabSelect = (tabId: TabId) => {
    onTabChange(tabId);
    setIsMenuOpen(false);
  };

  const currentTabLabel = allTabs.find(tab => tab.id === activeTab)?.label || 'Overview';

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 md:hidden">
        <div className="card rounded-none border-b-2 border-white/20 backdrop-blur-glass-strong">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SpotifyLogo size={32} className="text-spotify-green drop-shadow-[0_0_10px_rgba(29,185,84,0.5)]" />
              <div>
                <h2 className="text-lg font-bold text-white">{currentTabLabel}</h2>
                <p className="text-xs text-gray-400">Your Spotify Stats</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-glass-strong border-l border-white/20 shadow-2xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Navigation</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-2">
                {allTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabSelect(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-br from-spotify-green to-spotify-green-light text-white shadow-glow-green-strong'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
