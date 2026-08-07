import { BookOpen } from 'lucide-react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { normalizeStoryStyle } from '../../shared/storyStyle';
import { getSeedSection } from '../seedSections';
import {
  patchStoryRequired,
  patchWorldIdentity,
  storyRequired,
  worldIdentity,
  type UpdateSeed,
} from '../seedState';
import { LibraryTextBox } from '../../../library';
import { WorkspaceShell } from './WorkspaceShell';
import { OriginGenrePicker } from './origin/OriginGenrePicker';
import { OriginPremiseAndTags } from './origin/OriginPremiseAndTags';
import { OriginStyleSelector } from './origin/OriginStyleSelector';

interface OriginWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

/** Keeps all four Story essentials in one mobile-first creation flow. */
export const OriginWorkspace = ({ seed, updateSeed }: OriginWorkspaceProps) => {
  const section = getSeedSection('origin');
  const { premise, genre, storyTags } = storyRequired(seed);
  const identity = worldIdentity(seed);
  const selectedStyle = normalizeStoryStyle(storyRequired(seed).style);
  const originComplete = Boolean(selectedStyle && genre.trim() && premise.trim());

  return (
    <WorkspaceShell section={section} complete={originComplete}>
      <LibraryTextBox
        id="origin-story-title-input"
        label="Story Title"
        icon={BookOpen}
        helpText="Optional — the Library will generate a title if you leave this blank."
        value={identity.title || ''}
        onChange={value => updateSeed(patchWorldIdentity({ title: value }))}
        placeholder="e.g., Ashes of the Ninth Meridian"
      />

      <OriginStyleSelector
        selectedStyle={selectedStyle}
        onSelect={style => updateSeed(patchStoryRequired({ style }))}
      />

      <OriginPremiseAndTags
        premise={premise}
        storyTags={storyTags}
        selectedStyle={selectedStyle}
        onPremiseChange={value => updateSeed(patchStoryRequired({ premise: value }))}
        updateSeed={updateSeed}
        genrePicker={(
          <OriginGenrePicker
            genre={genre}
            onChange={value => updateSeed(patchStoryRequired({ genre: value }))}
          />
        )}
      />
    </WorkspaceShell>
  );
};
