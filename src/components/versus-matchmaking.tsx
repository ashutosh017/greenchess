import React from "react";

const VersusMatchmaking = ({
  userAvatarUrl,
  userName = "user",
}: {
  userAvatarUrl: string;
  userName: string;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex bg-[#1a1a2e] overflow-hidden font-sans">
      {/* Left Side - YOU */}
      <div className="w-1/2 h-full relative flex flex-col items-end justify-center pr-16 bg-gradient-to-r from-blue-900/20 to-transparent">
        {/* Decorative skewed background element */}
        <div className="absolute inset-0 bg-blue-600/10 -skew-x-12 -translate-x-20"></div>

        <div className="relative z-10 flex flex-col items-end">
          {/* Avatar Placeholder */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-1 shadow-[0_0_30px_rgba(59,130,246,0.5)] mb-4">
            {userAvatarUrl ? (
              <img
                src={userAvatarUrl}
                alt={userName}
                className="w-full h-full rounded-full object-cover border-4 border-[#1a1a2e]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#2a2a4e] border-4 border-[#1a1a2e] flex items-center justify-center text-white/50">
                Here
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            {userName}
          </h2>
          <p className="text-blue-300 font-semibold">Rating: 1200</p>
        </div>
      </div>

      {/* Center VS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 italic font-black text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
        VS
      </div>

      {/* Right Side - OPPONENT (Searching) */}
      <div className="w-1/2 h-full relative flex flex-col items-start justify-center pl-16">
        {/* Decorative skewed background element */}
        <div className="absolute inset-0 bg-red-600/10 -skew-x-12 translate-x-20"></div>

        <div className="relative z-10 flex flex-col items-start">
          {/* Searching Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-bl from-red-500 to-orange-400 p-1 shadow-[0_0_30px_rgba(239,68,68,0.5)] mb-4 relative overflow-hidden">
            <div className="w-full h-full rounded-full bg-[#2a2a4e] border-4 border-[#1a1a2e] flex items-center justify-center relative">
              {/* A simple CSS spinner inside the empty avatar slot */}
              <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            </div>
            {/* Scan effect over avatar */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-y-full animate-[shimmer_2s_infinite]"></div>
          </div>

          {/* Animated Dots text */}
          <h2 className="text-3xl font-black text-white uppercase tracking-wider flex">
            Searching
            <span className="animate-[bounce_1s_infinite_0ms]">.</span>
            <span className="animate-[bounce_1s_infinite_200ms]">.</span>
            <span className="animate-[bounce_1s_infinite_400ms]">.</span>
          </h2>
          <p className="text-red-300 font-semibold">Scanning pool...</p>
        </div>
      </div>

      {/* Add the shimmer animation to global css if using Option 2 */}
      {/* @keyframes shimmer {
         100% { transform: translateY(100%); }
       }
       */}
    </div>
  );
};

export default VersusMatchmaking;
