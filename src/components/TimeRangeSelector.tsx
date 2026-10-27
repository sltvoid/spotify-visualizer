import type { TimeRange } from '../types/spotify';
import { TIME_RANGES } from '../constants';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3" role="group" aria-labelledby="time-period-label">
      {TIME_RANGES.map(({ value, label, description }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isSelected}
            className={`rounded-xl px-5 py-3 text-left font-medium transition-all duration-300 ${
              isSelected
                ? 'border border-white/20 bg-linear-to-br from-spotify-green to-spotify-green-light text-white shadow-glow-green-strong'
                : 'border border-white/10 bg-white/5 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:shadow-glass'
            }`}
          >
            <span className="block font-semibold">{label}</span>
            <span className={`block text-xs ${isSelected ? 'text-green-100' : 'text-gray-400'}`}>
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
