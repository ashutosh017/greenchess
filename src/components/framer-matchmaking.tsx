import React from "react";
import { motion } from "framer-motion";

const FramerMatchmaking = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Central User Node */}
        <motion.div
          className="absolute z-20 w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 border-4 border-slate-900"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              "0px 0px 20px rgba(99, 102, 241, 0.5)",
              "0px 0px 40px rgba(99, 102, 241, 0.8)",
              "0px 0px 20px rgba(99, 102, 241, 0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white font-bold">YOU</span>
        </motion.div>

        {/* Orbiting Ring 1 */}
        <motion.div
          className="absolute w-40 h-40 border-2 border-indigo-400/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {/* The orbiting "searching" dot */}
          <motion.div
            className="w-6 h-6 bg-cyan-400 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        {/* Orbiting Ring 2 (Opposite direction, larger) */}
        <motion.div
          className="absolute w-60 h-60 border-2 border-purple-400/20 rounded-full border-dashed"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.h2
        className="text-white text-xl mt-12 font-light tracking-[0.2em] uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Establishing Connection
      </motion.h2>
    </div>
  );
};

export default FramerMatchmaking;
