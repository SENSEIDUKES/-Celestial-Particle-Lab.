import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import type { IntakeData } from '../shared/types';
import {
  FAMILY_SECTIONS,
  REQUIRED_STORY_SECTIONS,
  type SeedSection,
} from './seedSections';

interface StorySeedSummaryProps {
  open: boolean;
  intake: IntakeData;
  onClose: () => void;
}

const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <span className="shrink-0 font-sc text-[10px] uppercase tracking-widest text-neutral-500">{label}</span>
    <span className="text-right font-sans text-xs text-neutral-300">{value}</span>
  </div>
);

const SectionStatus = ({ section, intake }: { section: SeedSection; intake: IntakeData }) => {
  const filled = section.isFilled(intake);
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="font-sc text-[10px] uppercase tracking-widest text-neutral-500">{section.label}</span>
      {filled ? (
        <span className="flex items-center gap-1.5 font-sans text-xs text-portal">
          <Check size={11} /> Filled
        </span>
      ) : (
        <span className="font-sans text-xs text-neutral-600">Library will generate</span>
      )}
    </div>
  );
};

const truncate = (value: string, length: number) =>
  value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;

/**
 * Read-only summary of the current Story Seed — what the Library knows so
 * far, what is still missing before generation, and what it will invent.
 */
export const StorySeedSummary = ({ open, intake, onClose }: StorySeedSummaryProps) => {
  const completedRequired = REQUIRED_STORY_SECTIONS.filter(section => section.isFilled(intake));
  const tags = intake.storyTags || [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[250] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Story Seed summary"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={event => event.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-neutral-800 bg-neutral-950 p-6 sm:rounded-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-signal sm:text-2xl">
                  Story Seed Summary
                </h2>
                <p className="mt-1 font-sans text-xs text-neutral-500">
                  {completedRequired.length} of {REQUIRED_STORY_SECTIONS.length} required Story inputs complete
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close summary"
                className="rounded-full border border-neutral-800 p-1.5 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-signal"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="border-b border-neutral-900 pb-2 font-sc text-[11px] font-bold uppercase tracking-widest text-portal">
                  Story — required
                </h3>
                {REQUIRED_STORY_SECTIONS.map(section => {
                  const filled = section.isFilled(intake);
                  return (
                    <div key={section.id} className="flex items-center justify-between gap-4 py-1.5">
                      <span className="font-sc text-[10px] uppercase tracking-widest text-neutral-500">{section.label}</span>
                      {filled ? (
                        <span className="flex items-center gap-1.5 font-sans text-xs text-portal">
                          <Check size={11} /> Complete
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-sans text-xs text-red-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-human" /> Missing
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 className="border-b border-neutral-900 pb-2 font-sc text-[11px] font-bold uppercase tracking-widest text-neutral-300">
                  Creator
                </h3>
                <SummaryRow label="Pen name" value={intake.creatorPenName?.trim() || 'Not set'} />
              </div>

              <div>
                <h3 className="border-b border-neutral-900 pb-2 font-sc text-[11px] font-bold uppercase tracking-widest text-neutral-300">
                  Story
                </h3>
                <SummaryRow
                  label="Tags"
                  value={tags.length > 0 ? truncate(tags.join(', '), 90) : 'None yet'}
                />
                <SummaryRow
                  label="Premise"
                  value={intake.corePremise?.trim() ? truncate(intake.corePremise.trim(), 110) : 'None yet'}
                />
                <SummaryRow label="Genre" value={intake.genrePath?.trim() || 'None yet'} />
                <SummaryRow label="Style" value={truncate(intake.proseStyle?.trim() || 'None yet', 80)} />
                <SummaryRow
                  label="Story Settings"
                  value={FAMILY_SECTIONS.story.find(s => s.id === 'story-settings')?.isFilled(intake)
                    ? 'Customized'
                    : 'Library defaults'}
                />
              </div>

              <div>
                <h3 className="border-b border-neutral-900 pb-2 font-sc text-[11px] font-bold uppercase tracking-widest text-gold-accent">
                  World — optional
                </h3>
                {FAMILY_SECTIONS.world.map(section => (
                  <SectionStatus key={section.id} section={section} intake={intake} />
                ))}
                <p className="pt-2 font-sans text-[11px] leading-relaxed text-neutral-600">
                  Empty World sections are valid — the Library generates the complete world automatically
                  from your Story direction.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
