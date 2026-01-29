import React from "react";
// Assuming you have an icon library like lucide-react or heroicons
// import { Search } from 'lucide-react';

const MatchmakingOverlay = () => {
  return (
    // Full screen blurred overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl">
        {/* The Radar Animation */}
        <div className="relative flex items-center justify-center w-32 h-32 mb-8">
          {/* Outer rippling rings */}
          <div
            className="absolute w-full h-full bg-blue-500/30 rounded-full animate-ping-slow"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute w-full h-full bg-blue-500/20 rounded-full animate-ping-slow"
            style={{ animationDelay: "1s" }}
          ></div>

          {/* Core circle */}
          <div className="relative z-10 w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse-subtle">
            {/* Replace with an icon if you have one */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white opacity-90"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-white mb-2 tracking-wider">
          Finding Opponent
        </h2>
        <p className="text-blue-200/80 text-sm animate-pulse">
          Estimated wait: 15s...
        </p>

        {/* Cancel Button */}
        <button className="mt-8 px-6 py-2 rounded-full border border-white/20 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MatchmakingOverlay;
