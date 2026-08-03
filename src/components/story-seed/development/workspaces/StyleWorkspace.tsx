import React from 'react';
import { Check, Flower2, Gem, Scroll, type LucideIcon } from 'lucide-react';
import { IntakeData } from '../../shared/types';
import { normalizeStoryStyle, STORY_STYLE_OPTIONS, type StoryStyle } from '../../shared/storyStyle';
import { getSeedSection } from '../seedSections';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface StyleWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/**
 * Per-tradition presentation for the glass choice cards: a custom icon and
 * the tradition's accent color (Chinese blue, Korean red, Japanese green).
 * Purely visual — the stored values stay the stable `StoryStyle` keys.
 */
const STYLE_PRESENTATION: Record<StoryStyle, { icon: LucideIcon; accent: string }> = {
  chinese: { icon: Scroll, accent: '#04ACFF' },
  korean: { icon: Gem, accent: '#FF4545' },
  japanese: { icon: Flower2, accent: '#34D399' },
};

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
          const { icon: Icon, accent } = STYLE_PRESENTATION[option.value];
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              id={`story-style-${option.value}`}
              onClick={() => updateIntake('proseStyle', option.value)}
              data-selected={isSelected}
              style={{ '--choice-accent': accent } as React.CSSProperties}
              className="glass-choice flex min-h-[5.5rem] flex-col items-center justify-center gap-2.5 px-4 py-4"
            >
              <Icon size={19} aria-hidden="true" className="glass-choice-icon" />
              <span
                className={`flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.12em] transition-colors ${
                  isSelected ? 'text-signal' : 'text-neutral-300'
                }`}
              >
                {isSelected && (
                  <Check size={14} aria-hidden="true" style={{ color: accent }} />
                )}
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
