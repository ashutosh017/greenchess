import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility, if not, standard string interpolation works

const VersusMatchmaking = ({
  userAvatarUrl,
  userName = "You",
  opponent, // null = searching, string = opponent name found
  opponentAvatarUrl, // Optional: Pass this if you have it, otherwise we generate a placeholder
}: {
  userAvatarUrl: string;
  userName: string;
  opponent: string | null;
  opponentAvatarUrl?: string;
}) => {
  const [showMatchFound, setShowMatchFound] = useState(false);

  // Effect to trigger a small visual "pop" or delay when opponent is found
  useEffect(() => {
    if (opponent) {
      setShowMatchFound(true);
    }
  }, [opponent]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm overflow-hidden font-sans select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-blue-900/20 blur-[100px] transition-all duration-1000 ${showMatchFound ? "opacity-100" : "opacity-60"}`}
        />
        <div
          className={`absolute bottom-0 right-0 w-1/2 h-full bg-red-900/20 blur-[100px] transition-all duration-1000 ${showMatchFound ? "opacity-100" : "opacity-60"}`}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col space-y-4 md:flex-row items-center justify-between px-4 sm:px-12">
        {/* LEFT SIDE: PLAYER (YOU) */}
        <div className="flex flex-col items-center gap-6 animate-in slide-in-from-left-10 duration-700 fade-in">
          {/* Avatar Ring */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.6)] overflow-hidden bg-zinc-900 relative z-10">
              {userAvatarUrl ? (
                <img
                  src={userAvatarUrl}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-950 text-blue-200 text-2xl font-bold">
                  YOU
                </div>
              )}
            </div>
            {/* Ambient glow behind avatar */}
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 -z-10 rounded-full"></div>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider uppercase drop-shadow-lg">
              {userName}
            </h2>
            <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-400 font-bold text-sm tracking-wide">
                RATING: 1200
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: VS BADGE */}
        <div className="relative flex flex-col items-center justify-center mx-4">
          <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full"></div>
          <span className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 drop-shadow-2xl z-20 skew-x-[-10deg]">
            VS
          </span>
        </div>

        {/* RIGHT SIDE: OPPONENT */}
        <div className="flex flex-col items-center gap-6 w-[200px] md:w-[240px]">
          {" "}
          {/* Fixed width to prevent jumping */}
          {/* Avatar Container */}
          <div className="relative">
            <div
              className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 shadow-[0_0_40px_rgba(239,68,68,0.4)] overflow-hidden bg-zinc-900 relative z-10 transition-all duration-500 ${
                showMatchFound
                  ? "border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]" // Green glow on match
                  : "border-red-500" // Red glow while searching
              }`}
            >
              {showMatchFound ? (
                // MATCH FOUND STATE: Show Opponent Avatar (or placeholder letter)
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 animate-in zoom-in-50 duration-300">
                  {opponentAvatarUrl ? (
                    <img
                      src={opponentAvatarUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white uppercase">
                      {opponent?.charAt(0) || "?"}
                    </span>
                  )}
                </div>
              ) : (
                // SEARCHING STATE: Radar / Spinner Animation
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  {/* Radar Sweep Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent animate-[spin_2s_linear_infinite]" />
                  <div className="w-full h-full absolute border-t-2 border-red-500 rounded-full animate-spin"></div>
                  <div className="text-red-500/50 font-mono text-4xl">?</div>
                </div>
              )}
            </div>

            {/* Ambient glow behind avatar */}
            <div
              className={`absolute inset-0 blur-2xl opacity-40 -z-10 rounded-full transition-colors duration-500 ${showMatchFound ? "bg-green-500" : "bg-red-500"}`}
            ></div>
          </div>
          <div className="text-center space-y-1 min-h-[80px]">
            {" "}
            {/* Min-height preserves layout */}
            {showMatchFound ? (
              // MATCH FOUND TEXT
              <div className="animate-in slide-in-from-bottom-5 fade-in duration-500">
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-wider uppercase drop-shadow-lg truncate max-w-[250px]">
                  {opponent}
                </h2>
                <div className="inline-block mt-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 font-bold text-sm tracking-wide animate-pulse">
                    MATCH FOUND!
                  </p>
                </div>
              </div>
            ) : (
              // SEARCHING TEXT
              <div className="flex flex-col items-center">
                <h2 className="text-2xl md:text-3xl font-black text-zinc-500 uppercase tracking-widest">
                  Searching
                </h2>
                <div className="flex gap-1 mt-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional: Close / Cancel Button at bottom */}
      {!showMatchFound && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button className="px-8 py-2 rounded-full border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">
            Cancel Search
          </button>
        </div>
      )}
    </div>
  );
};

export default VersusMatchmaking;
