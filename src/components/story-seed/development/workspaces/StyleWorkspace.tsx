import React from 'react';
import { Check } from 'lucide-react';
import { IntakeData } from '../../shared/types';
import { STYLE_SUGGESTIONS } from '../constants';
import { DEFAULT_STORY_STYLE } from '../../shared/storySeedSchema';
import { getSeedSection } from '../seedSections';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface StyleWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/**
 * Required Story workspace: prose style.
 *
 * Style starts empty and stays incomplete until the creator makes a real
 * choice — the Library default is offered as an explicit, visible option they
 * can accept, never as an invisible prefill that silently marks the section
 * done.
 */
export const StyleWorkspace = ({ intake, updateIntake }: StyleWorkspaceProps) => {
  const section = getSeedSection('style');
  const style = intake.proseStyle || '';
  const defaultAccepted = style.trim() === DEFAULT_STORY_STYLE;
  const presets = STYLE_SUGGESTIONS.filter(suggestion => suggestion !== DEFAULT_STORY_STYLE);

  return (
    <WorkspaceShell section={section} complete={Boolean(style.trim())}>
      <div>
        <div className="mb-2 flex items-end justify-between">
          <label htmlFor="story-style-input" className="block font-sc text-xs uppercase tracking-widest text-neutral-400">
            Prose Style
          </label>
          <span className="font-mono text-[10px] text-neutral-500">{style.length} / 600</span>
        </div>
        <textarea
          id="story-style-input"
          maxLength={600}
          value={style}
          onChange={(e) => updateIntake('proseStyle', e.target.value)}
          rows={3}
          placeholder="Describe the voice every chapter should be written in..."
          className="w-full resize-none rounded border border-neutral-800 bg-neutral-950/80 p-3 font-sans text-sm text-signal placeholder-neutral-600 focus:border-portal focus:outline-none"
        />
      </div>

      {/* The Library default as an explicit choice the creator confirms. */}
      <button
        type="button"
        id="accept-default-style-button"
        onClick={() => updateIntake('proseStyle', defaultAccepted ? '' : DEFAULT_STORY_STYLE)}
        aria-pressed={defaultAccepted}
        className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
          defaultAccepted
            ? 'border-portal/50 bg-portal/10'
            : 'border-neutral-800 bg-neutral-950/40 hover:border-portal/40'
        }`}
      >
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            defaultAccepted ? 'border-portal bg-portal text-void' : 'border-neutral-700'
          }`}
          aria-hidden="true"
        >
          {defaultAccepted && <Check size={11} strokeWidth={3} />}
        </span>
        <span className="min-w-0">
          <span className="block font-sc text-[11px] font-bold uppercase tracking-widest text-signal">
            Use the Library default
          </span>
          <span className="mt-0.5 block font-sans text-xs text-neutral-400">{DEFAULT_STORY_STYLE}</span>
        </span>
      </button>

      <div>
        <p className="mb-2 block font-sc text-xs uppercase tracking-widest text-neutral-400">
          Or choose a voice
        </p>
        <div className="flex flex-wrap gap-2">
          {presets.map((suggestion) => {
            const isSelected = style.trim() === suggestion;
            return (
              <button
                key={suggestion}
                type="button"
                onClick={() => updateIntake('proseStyle', suggestion)}
                aria-pressed={isSelected}
                className={`rounded border px-2.5 py-1 font-sans text-xs transition-all duration-200 ${
                  isSelected
                    ? 'border-portal bg-portal/10 font-semibold text-portal shadow-[0_0_8px_rgba(4,172,255,0.15)]'
                    : 'border-neutral-900 bg-void text-neutral-400 hover:border-neutral-800 hover:text-signal'
                }`}
              >
                {suggestion}
              </button>
            );
          })}
        </div>
      </div>

      <GuidanceNote title="How style helps">
        Style is the voice every chapter is written in — pacing of sentences, density of description,
        how humor and violence land. Accept the Library default or write your own; either counts as
        your choice.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
