import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Zap } from 'lucide-react';
import { GENRE_PRESETS } from './constants';
import { FateSurvivalExplanation } from './FateSurvivalExplanation';

export const StorySettingsPanel = () => {
  const [genrePath, setGenrePath] = useState<string>('Fate Survival');

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="border rounded-lg overflow-hidden bg-neutral-950/40 border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6 sm:p-8 space-y-8">
        <div>
          <span className="block font-sc text-xs text-neutral-400 uppercase tracking-widest mb-2">Genre Path</span>
          <div className="flex flex-wrap gap-2 mb-3">
            {GENRE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                 tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => setGenrePath(p.id)}
                className={`px-3 py-1.5 rounded border text-xs font-sans transition-colors flex items-center gap-1.5 ${genrePath === p.id ? 'bg-neutral-900 border-portal text-signal shadow-[0_0_10px_rgba(4,172,255,0.1)]' : 'bg-transparent border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
              >
                {p.id === 'Fate Survival' ? (
                  <div className="relative flex items-center justify-center">
                    <Cloud size={14} className={genrePath === p.id ? "text-red-500" : "text-neutral-500"} />
                    <motion.div
                      className="absolute"
                      animate={{ opacity: [0, 0, 1, 0, 1, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 0.95, 1], ease: "linear" }}
                    >
                      <Zap size={8} className="text-yellow-400 fill-yellow-400 mt-[2px]" />
                    </motion.div>
                  </div>
                ) : (
                  p.icon
                )}
                {p.name}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {genrePath === 'Fate Survival' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 mb-4 overflow-hidden"
              >
                <FateSurvivalExplanation />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StorySettingsPanel;
