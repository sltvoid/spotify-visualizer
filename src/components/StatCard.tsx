import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

export default function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className="card">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-spotify-green' : ''}`}>{value}</p>
    </div>
  );
}
