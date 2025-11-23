import { Music2, BarChart3, Library, Clock, Mic2 } from 'lucide-react';

type TabId = 'overview' | 'insights' | 'artists' | 'tracks' | 'albums' | 'recent' | 'library' | 'playlists' | 'features' | 'genres' | 'advanced';

interface MobileTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const MOBILE_TABS = [
  { id: 'overview' as TabId, label: 'Overview', icon: Music2 },
  { id: 'insights' as TabId, label: 'Insights', icon: BarChart3 },
  { id: 'artists' as TabId, label: 'Artists', icon: Mic2 },
  { id: 'library' as TabId, label: 'Library', icon: Library },
  { id: 'recent' as TabId, label: 'Recent', icon: Clock },
];

export default function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="card rounded-t-3xl rounded-b-none border-t-2 border-white/20 pb-safe">
        <div className="flex justify-around items-center">
          {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === id
                  ? 'text-spotify-green'
                  : 'text-gray-400'
              }`}
            >
              <Icon
                size={24}
                className={`transition-all duration-300 ${
                  activeTab === id ? 'scale-110 drop-shadow-[0_0_8px_rgba(29,185,84,0.6)]' : ''
                }`}
              />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
