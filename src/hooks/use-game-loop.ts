import { useState, useEffect, useRef, useCallback } from "react";

interface UseGameLoopProps {
  runTimeMs: number;
  onRunComplete: () => void;
  isActive: boolean;
}

export function useGameLoop({ runTimeMs, onRunComplete, isActive }: UseGameLoopProps) {
  const [timeLeftMs, setTimeLeftMs] = useState(runTimeMs);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const loop = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const remaining = Math.max(0, runTimeMs - elapsed);

      setTimeLeftMs(remaining);
      setProgress(Math.min(100, (elapsed / runTimeMs) * 100));

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        // Run is complete
        onRunComplete();
        // Reset for the next run if it stays active
        startTimeRef.current = null;
        if (isActive) {
          rafRef.current = requestAnimationFrame(loop);
        }
      }
    },
    [runTimeMs, onRunComplete, isActive]
  );

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = null; // Reset start time when activated
      rafRef.current = requestAnimationFrame(loop);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setTimeLeftMs(runTimeMs);
      setProgress(0);
      startTimeRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, loop, runTimeMs]);

  return {
    timeLeftMs,
    progress,
    timeLeftSeconds: (timeLeftMs / 1000).toFixed(1),
  };
}
