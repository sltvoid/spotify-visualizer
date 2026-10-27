import type { TimeRange } from '../types/spotify';
import { TIME_RANGES } from '../constants';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    // Phones: one full-width row of three segments. Larger screens: labelled pills.
    <div
      className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3"
      role="group"
      aria-labelledby="time-period-label"
    >
      {TIME_RANGES.map(({ value, label, shortLabel, description }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isSelected}
            className={`rounded-xl px-2 py-2.5 text-center font-medium transition-all duration-300 sm:px-5 sm:py-3 sm:text-left ${
              isSelected
                ? 'border border-white/20 bg-linear-to-br from-spotify-green to-spotify-green-light text-black shadow-glow-green-strong'
                : 'border border-white/10 bg-white/5 text-gray-300 backdrop-blur-sm hover:border-white/20 hover:bg-white/10 hover:shadow-glass'
            }`}
          >
            <span className="block text-sm font-semibold sm:hidden">{shortLabel}</span>
            <span className="hidden font-semibold sm:block">{label}</span>
            <span
              className={`hidden text-xs sm:block ${isSelected ? 'text-black/75' : 'text-gray-400'}`}
            >
              {description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
