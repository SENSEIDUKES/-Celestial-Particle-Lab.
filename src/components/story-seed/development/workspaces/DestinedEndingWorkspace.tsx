import React from 'react';
import { Hourglass } from 'lucide-react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { getSeedSection } from '../seedSections';
import { patchWorldFoundations, worldFoundations, type UpdateSeed } from '../seedState';
import { LibraryTextArea } from '../library';
import { WorkspaceShell } from './WorkspaceShell';

interface DestinedEndingWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

/** Optional World workspace (`world.optional.worldFoundations.destinedEnding`). */
export const DestinedEndingWorkspace = ({ seed, updateSeed }: DestinedEndingWorkspaceProps) => {
  const section = getSeedSection('destined-ending');

  return (
    <WorkspaceShell section={section} complete={section.isFilled(seed)}>
      <LibraryTextArea
        id="destined-ending-input"
        label="Destined Ending"
        icon={Hourglass}
        maxLength={1500}
        helpText="The intended final destination of this story or arc. If left blank, the Library recommends a fitting destined ending (e.g., Kingdom Collapse, Final Ascension, or Fated Separation) based on your genre and premise. You can alter this outcome later!"
        value={worldFoundations(seed).destinedEnding || ''}
        onChange={(val) => updateSeed(patchWorldFoundations({ destinedEnding: val }))}
        rows={3}
        placeholder="e.g. The kingdom falls, the MC ascends to godhood, or the lovers are separated..."
      />
    </WorkspaceShell>
  );
};
