import { useEffect, useRef } from 'react';

const MILLISECONDS_PER_SECOND = 1000;
const MAX_FRAME_SECONDS = 0.1;

export function useAnimationLoop(active: boolean, onFrame: (deltaSeconds: number) => void): void {
  const frameCallback = useRef(onFrame);

  useEffect(() => {
    frameCallback.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!active) return;

    let previous = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const delta = Math.min((now - previous) / MILLISECONDS_PER_SECOND, MAX_FRAME_SECONDS);
      previous = now;
      frameCallback.current(delta);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);
}
