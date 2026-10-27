import type { ReactNode } from 'react';

export default function ChartCard({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      {children}
    </section>
  );
}
