import React from 'react';
import { IntakeData } from '../../shared/types';
import { STYLE_SUGGESTIONS } from '../constants';
import { getSeedSection } from '../seedSections';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface StyleWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/**
 * Required Story workspace: prose style. Pre-filled with the Library default
 * so a fresh seed is valid; any preset chip or free edit replaces it.
 */
export const StyleWorkspace = ({ intake, updateIntake }: StyleWorkspaceProps) => {
  const section = getSeedSection('style');
  const style = intake.proseStyle || '';

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
          placeholder="e.g., Immersive character-focused light-novel prose"
          className="w-full resize-none rounded border border-neutral-800 bg-neutral-950/80 p-3 font-sans text-sm text-signal placeholder-neutral-600 focus:border-portal focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-2 block font-sc text-xs uppercase tracking-widest text-neutral-400">
          Style presets
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLE_SUGGESTIONS.map((suggestion) => {
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
        how humor and violence land. The Library default is already filled in; refine it only if the
        novel should sound different.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
