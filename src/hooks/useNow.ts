import { useEffect, useState } from 'react';

/** Current time in ms, updated every `intervalMs` while `active` is true. */
export function useNow(intervalMs: number, active = true): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);

  return now;
}
