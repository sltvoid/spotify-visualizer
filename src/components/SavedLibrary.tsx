import { useSearchParams } from 'react-router';
import SavedAlbums from './SavedAlbums';
import SavedTracks from './SavedTracks';

const VIEWS = [
  { id: 'tracks', label: 'Tracks' },
  { id: 'albums', label: 'Albums' },
] as const;

/** Library tab: saved tracks or saved albums (kept in the URL as `?view=`). */
export default function SavedLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'albums' ? 'albums' : 'tracks';

  const setView = (next: (typeof VIEWS)[number]['id']) =>
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.set('view', next);
        return params;
      },
      { replace: true },
    );

  return (
    <div className="space-y-6">
      <div
        className="inline-flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
        role="group"
        aria-label="Library view"
      >
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              view === id ? 'bg-spotify-green text-white' : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'albums' ? <SavedAlbums /> : <SavedTracks />}
    </div>
  );
}
