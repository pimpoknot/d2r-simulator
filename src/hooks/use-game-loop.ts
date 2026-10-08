import { useState, useEffect, useRef } from "react";

interface UseGameLoopProps {
  runTimeMs: number;
  onRunComplete: () => void;
  isActive: boolean;
}

export function useGameLoop({ runTimeMs, onRunComplete, isActive }: UseGameLoopProps) {
  const [timeLeftMs, setTimeLeftMs] = useState(runTimeMs);
  const [progress, setProgress] = useState(0);

  const onRunCompleteRef = useRef(onRunComplete);
  const runTimeMsRef = useRef(runTimeMs);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    onRunCompleteRef.current = onRunComplete;
  }, [onRunComplete]);

  useEffect(() => {
    runTimeMsRef.current = runTimeMs;
  }, [runTimeMs]);

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const totalMs = runTimeMsRef.current;
      const elapsed = timestamp - startTimeRef.current;
      const remaining = Math.max(0, totalMs - elapsed);

      setTimeLeftMs(remaining);
      setProgress(totalMs > 0 ? Math.min(100, (elapsed / totalMs) * 100) : 100);

      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        onRunCompleteRef.current();
        startTimeRef.current = null;
        rafRef.current = requestAnimationFrame(step);
      }
    };

    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive]);

  const displayTime = isActive ? timeLeftMs : runTimeMs;
  const displayProgress = isActive ? progress : 0;

  return {
    timeLeftMs: displayTime,
    progress: displayProgress,
    timeLeftSeconds: (displayTime / 1000).toFixed(1),
  };
}
