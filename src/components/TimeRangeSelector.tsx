import type { TimeRange } from '../types/spotify';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TIME_RANGES: { value: TimeRange; label: string; description: string }[] = [
  { value: 'short_term', label: 'Last 4 Weeks', description: 'Recent trends' },
  { value: 'medium_term', label: 'Last 6 Months', description: 'Current favorites' },
  { value: 'long_term', label: 'All Time', description: 'Your classics' },
];

export default function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3">
      {TIME_RANGES.map(({ value, label, description }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`flex-1 px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-medium transition-all duration-300 ${
            selected === value
              ? 'bg-gradient-to-br from-spotify-green to-spotify-green-light text-white shadow-glow-green-strong border border-white/20'
              : 'bg-white/5 text-gray-300 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:shadow-glass'
          }`}
        >
          <div className="text-center md:text-left">
            <div className="font-semibold text-sm md:text-base">{label}</div>
            <div className={`text-xs ${selected === value ? 'text-green-100' : 'text-gray-400'}`}>
              {description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
