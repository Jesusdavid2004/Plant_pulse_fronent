import { useCallback, useEffect, useState } from 'react';

export type ResourceStatus = 'loading' | 'ready' | 'error';

export interface AsyncResource<T> {
  data: T | null;
  status: ResourceStatus;
  reload: () => Promise<void>;
}

export function useAsyncResource<T>(load: () => Promise<T>): AsyncResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ResourceStatus>('loading');

  const reload = useCallback(async () => {
    try {
      setData(await load());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { data, status, reload };
}
