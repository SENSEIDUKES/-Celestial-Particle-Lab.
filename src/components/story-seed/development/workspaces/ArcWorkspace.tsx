import React from 'react';
import { Compass, Hourglass, ShieldAlert, Swords, Target } from 'lucide-react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { getSeedSection } from '../seedSections';
import {
  patchPlotAndTropeSettings,
  patchWorldFoundations,
  plotAndTropeSettings,
  setAdditionalStoryDirection,
  worldFoundations,
  type UpdateSeed,
} from '../seedState';
import { LibraryTextArea, LibraryTextBox } from '../../../library';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface ArcWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

/**
 * Optional ARC workspace. This is a presentation-level grouping only: plot
 * direction keeps its existing `story.optional` paths and Destined Ending
 * keeps its existing `world.optional.worldFoundations.destinedEnding` path.
 */
export const ArcWorkspace = ({ seed, updateSeed }: ArcWorkspaceProps) => {
  const section = getSeedSection('arc');
  const settings = plotAndTropeSettings(seed);

  return (
    <WorkspaceShell section={section} complete={section.isFilled(seed)}>
      <LibraryTextArea
        id="desired-plot-direction-input"
        label="Desired Plot Direction"
        icon={Compass}
        maxLength={1500}
        helpText="Anything else the Library should follow — must-have elements, things to avoid, or a rule the story has to honor."
        value={seed.story.optional.additionalStoryDirection || ''}
        onChange={(value) => updateSeed(setAdditionalStoryDirection(value))}
        rows={3}
        placeholder="e.g. Revenge focused, slow sect building, kingdom conquering..."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LibraryTextBox
          id="a11y-control-jolpc3b"
          label="Long-term Goal"
          icon={Target}
          value={settings.longTermGoal || ''}
          onChange={(value) => updateSeed(patchPlotAndTropeSettings({ longTermGoal: value }))}
          placeholder="e.g., Shatter the heavens..."
        />
        <LibraryTextBox
          id="a11y-control-6a6tmbf"
          label="First Major Conflict"
          icon={Swords}
          value={settings.firstMajorConflict || ''}
          onChange={(value) => updateSeed(patchPlotAndTropeSettings({ firstMajorConflict: value }))}
          placeholder="e.g., Sect tournament, survival trial..."
        />
        <div className="sm:col-span-2">
          <LibraryTextBox
            id="main-antagonist-pressure-input"
            label="Main Antagonist Pressure"
            icon={ShieldAlert}
            helpText="Who or what pushes back against the main character the hardest."
            value={settings.mainAntagonistPressure || ''}
            onChange={(value) => updateSeed(patchPlotAndTropeSettings({ mainAntagonistPressure: value }))}
            placeholder="e.g., The celestial court's fate auditors..."
          />
        </div>
      </div>

      <LibraryTextArea
        id="destined-ending-input"
        label="Destined Ending"
        icon={Hourglass}
        maxLength={1500}
        helpText="The intended final destination of this story or arc. If left blank, the Library recommends a fitting ending from your Origin and ARC direction. You can alter this outcome later."
        value={worldFoundations(seed).destinedEnding || ''}
        onChange={(value) => updateSeed(patchWorldFoundations({ destinedEnding: value }))}
        rows={3}
        placeholder="e.g. The kingdom falls, the MC ascends, or the lovers are separated..."
      />

      <GuidanceNote title="Shape the journey and its destination">
        ARC is optional. Use it when you already know what should drive the story, what should resist
        the protagonist, or where the journey should ultimately lead. Empty fields are extrapolated.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
