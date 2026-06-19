import { useCallback, useEffect, useState } from "react";

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncDataState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    loader()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey]);

  return { data, loading, error, reload };
}
