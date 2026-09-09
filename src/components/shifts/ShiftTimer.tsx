import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

const formatDuration = (ms: number) => {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

interface ShiftTimerProps {
  startTime?: string | null;
  className?: string;
}

const ShiftTimer = ({ startTime, className }: ShiftTimerProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return null;

  const start = new Date(startTime).getTime();
  const elapsed = now - start;

  return (
    <span className={className} dir="ltr">
      {formatDuration(elapsed)}
    </span>
  );
};

export default ShiftTimer;