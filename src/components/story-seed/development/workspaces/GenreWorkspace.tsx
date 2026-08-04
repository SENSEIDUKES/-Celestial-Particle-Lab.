import React from 'react';
import { Check, Drama } from 'lucide-react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { GENRE_PRESETS } from '../constants';
import { getSeedSection } from '../seedSections';
import { patchStoryRequired, storyRequired, type UpdateSeed } from '../seedState';
import { LibraryTextBox } from '../../../library';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface GenreWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

/**
 * Required Story workspace (`story.required.genre`). A single-choice preset
 * grid plus a free-form custom genre input — both bind the same value.
 */
export const GenreWorkspace = ({ seed, updateSeed }: GenreWorkspaceProps) => {
  const section = getSeedSection('genre');
  const genre = storyRequired(seed).genre;
  const selectedGenre = genre.trim();

  return (
    <WorkspaceShell section={section} complete={Boolean(selectedGenre)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {GENRE_PRESETS.map((preset) => {
          const isSelected = selectedGenre === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => updateSeed(patchStoryRequired({ genre: preset.id }))}
              aria-pressed={isSelected}
              className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-all duration-200 ${
                isSelected
                  ? 'border-portal bg-portal/10 text-signal shadow-[0_0_16px_rgba(4,172,255,0.15)]'
                  : 'border-neutral-900 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <span className="text-xl leading-none" aria-hidden="true">{preset.icon}</span>
              <span className="flex items-center gap-1.5 font-sc text-[11px] font-bold uppercase tracking-widest">
                {isSelected && <Check size={11} className="text-portal" aria-hidden="true" />}
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      <LibraryTextBox
        id="genre-custom-input"
        label="Or define your own genre"
        icon={Drama}
        value={genre}
        onChange={(val) => updateSeed(patchStoryRequired({ genre: val }))}
        placeholder="e.g., Demonic cultivation court drama"
      />

      <GuidanceNote title="How genre helps">
        Genre sets the world&rsquo;s logic — how power works, how people speak, which tropes are promises
        instead of clichés. The Library reads every other section through this lens.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
