import { useEffect, useState } from 'react';

const MIN_BLINK_INTERVAL_MS = 2500;
const MAX_BLINK_INTERVAL_MS = 5500;
const BLINK_DURATION_MS = 140;

export function useBlink(enabled: boolean): boolean {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let timer = 0;
    const scheduleBlink = () => {
      const wait =
        MIN_BLINK_INTERVAL_MS + Math.random() * (MAX_BLINK_INTERVAL_MS - MIN_BLINK_INTERVAL_MS);
      timer = window.setTimeout(() => {
        setClosed(true);
        timer = window.setTimeout(() => {
          setClosed(false);
          scheduleBlink();
        }, BLINK_DURATION_MS);
      }, wait);
    };

    scheduleBlink();
    return () => window.clearTimeout(timer);
  }, [enabled]);

  return closed;
}
