import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchOptions {
  enabled?: boolean;
}

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for data fetching with loading, error states, and caching.
 * Eliminates duplicate fetch logic across components.
 *
 * @param fetchFn - Async function that fetches data
 * @param deps - Dependencies array that triggers refetch when changed
 * @param options - Optional configuration
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = [],
  options: UseDataFetchOptions = {}
): UseDataFetchResult<T> {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred while fetching data';
        setError(errorMessage);
        console.error('Data fetch error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Custom hook for fetching multiple data sources in parallel.
 * Useful when a component needs data from several endpoints.
 *
 * @param fetchFns - Object mapping keys to fetch functions
 * @param deps - Dependencies array that triggers refetch when changed
 * @returns Object containing data, loading state, errors, and refetch function
 */
export function useMultiDataFetch<T extends Record<string, unknown>>(
  fetchFns: { [K in keyof T]: () => Promise<T[K]> },
  deps: unknown[] = []
): {
  data: Partial<T>;
  loading: boolean;
  errors: Partial<Record<keyof T, string>>;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const keys = Object.keys(fetchFns) as (keyof T)[];
    const results: Partial<T> = {};
    const newErrors: Partial<Record<keyof T, string>> = {};

    await Promise.all(
      keys.map(async (key) => {
        try {
          const result = await fetchFns[key]();
          results[key] = result;
        } catch (err) {
          newErrors[key] =
            err instanceof Error ? err.message : `Failed to fetch ${String(key)}`;
          console.error(`Error fetching ${String(key)}:`, err);
        }
      })
    );

    if (mountedRef.current) {
      setData(results);
      setErrors(newErrors);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchAll]);

  const refetch = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  return { data, loading, errors, refetch };
}
