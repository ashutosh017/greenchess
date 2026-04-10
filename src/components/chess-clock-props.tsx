"use client";

import { memo, useEffect, useState } from "react";

interface ChessClockProps {
  initialTimeInSeconds: number; // The time left from your Prisma DB
  lastMoveAt: number; // The local timestamp of the last turn change
  isActive: boolean; // Is it this player's turn?
}

const ChessClock = memo(({
  initialTimeInSeconds,
  lastMoveAt,
  isActive,
}: ChessClockProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);

  // Authoritatively update timeLeft whenever the initial value from the server changes
  useEffect(() => {
    setTimeLeft(initialTimeInSeconds);
  }, [initialTimeInSeconds]);

  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastMoveAt) / 1000);

      // Ensure time doesn't go below 0
      setTimeLeft(Math.max(0, initialTimeInSeconds - elapsed));
    };

    tick(); // Run immediately to avoid 1s delay
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isActive, initialTimeInSeconds, lastMoveAt]);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // UI - Chess.com style colors (Red when low time)
  const isLowTime = timeLeft < 30;

  return (
    <div
      className={`
      px-3 py-1 rounded-sm font-mono text-xl font-bold shadow-inner border-b-2 
      ${isLowTime && isActive ? "bg-[#b33430] text-white" : "bg-[#262421] text-[#fff] border-white/5"}
      ${!isActive ? "opacity-70" : "opacity-100"}
      transition-colors duration-300
    `}
    >
      {formatTime(timeLeft)}
    </div>
  );
});

ChessClock.displayName = "ChessClock";

export default ChessClock;
