import React from 'react';
import { Check } from 'lucide-react';
import { IntakeData } from '../../shared/types';
import { normalizeStoryStyle, STORY_STYLE_OPTIONS } from '../../shared/storyStyle';
import { getSeedSection } from '../seedSections';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface StyleWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/**
 * The first required Story workspace: the novel's storytelling tradition.
 *
 * Three foundational choices, nothing more. This is the structural skeleton —
 * the tradition is stored and carried through save, export, and generation,
 * but no tradition-specific generation behavior exists yet (see
 * `shared/storyStyle.ts` for where that will attach).
 */
export const StyleWorkspace = ({ intake, updateIntake }: StyleWorkspaceProps) => {
  const section = getSeedSection('style');
  const selected = normalizeStoryStyle(intake.proseStyle);

  return (
    <WorkspaceShell section={section} complete={Boolean(selected)}>
      <div
        role="radiogroup"
        aria-label="Novel tradition"
        id="story-style-options"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {STORY_STYLE_OPTIONS.map(option => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              id={`story-style-${option.value}`}
              onClick={() => updateIntake('proseStyle', option.value)}
              className={`flex min-h-[5rem] flex-col items-center justify-center gap-2 rounded-xl border px-4 py-4 transition-all duration-200 ${
                isSelected
                  ? 'border-portal bg-portal/10 text-signal shadow-[0_0_16px_rgba(4,172,255,0.15)]'
                  : 'border-neutral-900 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <span className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.12em]">
                {isSelected && <Check size={14} className="text-portal" aria-hidden="true" />}
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <GuidanceNote title="How style helps">
        Style is the storytelling tradition your novel belongs to. It is the first decision because
        everything after it — genre, premise, tags, the world — is read through that tradition.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
