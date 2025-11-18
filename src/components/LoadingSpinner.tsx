import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin text-spotify-green" size={48} />
    </div>
  );
}
