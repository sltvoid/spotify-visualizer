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
    <div className="flex gap-3 flex-wrap">
      {TIME_RANGES.map(({ value, label, description }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
            selected === value
              ? 'bg-spotify-green text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-left">
            <div className="font-semibold">{label}</div>
            <div className={`text-xs ${selected === value ? 'text-green-100' : 'text-gray-400'}`}>
              {description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
