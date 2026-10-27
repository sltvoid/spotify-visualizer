import type { ReactNode } from 'react';

export default function EmptyState({ children }: { children: ReactNode }) {
  return <p className="p-4 text-center text-gray-400">{children}</p>;
}
