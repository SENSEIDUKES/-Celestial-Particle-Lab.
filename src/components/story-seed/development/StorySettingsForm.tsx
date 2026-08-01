import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Settings, Zap } from 'lucide-react';
import { IntakeData } from '../shared/types';
import { FormSection, FormSectionId } from './FormSection';
import { GENRE_PRESETS } from './constants';
import { FateSurvivalExplanation } from './FateSurvivalExplanation';

interface StorySettingsFormProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
  activeSection: FormSectionId;
  setActiveSection: (id: FormSectionId) => void;
}

export const StorySettingsForm = ({ intake, updateIntake, activeSection, setActiveSection }: StorySettingsFormProps) => {
  return (
    <FormSection id="settings" title="1.5. Story Settings" icon={<Settings size={18} />} activeSection={activeSection} setActiveSection={setActiveSection}>
      <div>
        <span className="block font-sc text-xs text-neutral-400 uppercase tracking-widest mb-2">Genre Path</span>
        <div className="flex flex-wrap gap-2 mb-3">
          {GENRE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
               tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => updateIntake('genrePath', p.id)}
              className={`px-3 py-1.5 rounded border text-xs font-sans transition-colors flex items-center gap-1.5 ${intake.genrePath === p.id ? 'bg-neutral-900 border-portal text-signal shadow-[0_0_10px_rgba(4,172,255,0.1)]' : 'bg-transparent border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
            >
              {p.id === 'Fate Survival' ? (
                <div className="relative flex items-center justify-center">
                  <Cloud size={14} className={intake.genrePath === p.id ? "text-red-500" : "text-neutral-500"} />
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
          {intake.genrePath === 'Fate Survival' && (
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
    </FormSection>
  );
};
