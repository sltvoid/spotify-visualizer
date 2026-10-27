import { LoaderCircle } from 'lucide-react';
import { LOAD_LIMITS } from '../constants';

interface LoadLimitPickerProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Plural noun for the labels, e.g. "Tracks". */
  noun: string;
  /** True while a bigger list loads in the background. */
  loading: boolean;
}

export default function LoadLimitPicker({ value, onChange, noun, loading }: LoadLimitPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`${noun} to load`}>
      {LOAD_LIMITS.map((limit) => (
        <button
          key={limit ?? 'all'}
          type="button"
          onClick={() => onChange(limit)}
          className={`btn-secondary ${value === limit ? 'bg-spotify-green' : ''}`}
          aria-pressed={value === limit}
        >
          {limit === undefined ? `All ${noun}` : `${limit} ${noun}`}
        </button>
      ))}
      {loading && (
        <span className="flex items-center gap-2 text-sm text-gray-400" role="status">
          <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
          Loading more...
        </span>
      )}
    </div>
  );
}
