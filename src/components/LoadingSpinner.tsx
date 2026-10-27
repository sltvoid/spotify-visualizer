import { LoaderCircle } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center p-12" role="status">
      <LoaderCircle className="animate-spin text-spotify-green" size={48} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
