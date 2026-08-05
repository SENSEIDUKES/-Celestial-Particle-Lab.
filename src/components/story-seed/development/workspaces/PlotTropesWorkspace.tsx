import React from 'react';
import { Compass, ShieldAlert, Swords, Target } from 'lucide-react';
import type { StorySeedInput } from '../../shared/storySeedSchema';
import { getSeedSection } from '../seedSections';
import {
  patchPlotAndTropeSettings,
  plotAndTropeSettings,
  setAdditionalStoryDirection,
  type UpdateSeed,
} from '../seedState';
import { LibraryTextArea, LibraryTextBox } from '../../../library';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface PlotTropesWorkspaceProps {
  seed: StorySeedInput;
  updateSeed: UpdateSeed;
}

/**
 * The whole optional Story family, and the only seed-level plot direction
 * kept in Story Seed. Each field answers "what novel is this?" — where the
 * story is headed, what it opens against, and who pushes back.
 *
 * Mapping: the structured answers are `story.optional.plotAndTropeSettings`;
 * the freeform textarea is `story.optional.additionalStoryDirection`, which
 * consolidates Phase 1's overlapping `desiredPlotDirection`,
 * `mustIncludeElements`, and `thingsToAvoid`. Make It Work has its own field
 * in the combined ARC workspace.
 *
 * Everything that answers "how do I want to experience this novel?" — pacing,
 * tone, romance/harem, comedy, betrayal, Fate Survival — deliberately does not
 * live here. Those are experience settings that can change after creation, and
 * they belong to the separate Story Settings feature.
 */
export const PlotTropesWorkspace = ({ seed, updateSeed }: PlotTropesWorkspaceProps) => {
  const section = getSeedSection('plot-tropes');
  const settings = plotAndTropeSettings(seed);

  return (
    <WorkspaceShell section={section} complete={section.isFilled(seed)}>
      <LibraryTextArea
        id="desired-plot-direction-input"
        label="Story Direction"
        icon={Compass}
        maxLength={1500}
        helpText="Anything else the Library should follow — must-have elements, things to avoid, or a rule the story has to honor."
        value={seed.story.optional.additionalStoryDirection || ''}
        onChange={(val) => updateSeed(setAdditionalStoryDirection(val))}
        rows={3}
        placeholder="e.g. Revenge focused, slow sect building, kingdom conquering..."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <LibraryTextBox
          id="a11y-control-jolpc3b"
          label="Long-term Goal"
          icon={Target}
          value={settings.longTermGoal || ''}
          onChange={(val) => updateSeed(patchPlotAndTropeSettings({ longTermGoal: val }))}
          placeholder="e.g., Shatter the heavens..."
        />
        <LibraryTextBox
          id="a11y-control-6a6tmbf"
          label="First Major Conflict"
          icon={Swords}
          value={settings.firstMajorConflict || ''}
          onChange={(val) => updateSeed(patchPlotAndTropeSettings({ firstMajorConflict: val }))}
          placeholder="e.g., Sect tournament, survival trial..."
        />
        <LibraryTextBox
          id="main-antagonist-pressure-input"
          label="Main Opposition"
          icon={ShieldAlert}
          helpText="Who or what pushes back against the main character the hardest."
          value={settings.mainAntagonistPressure || ''}
          onChange={(val) => updateSeed(patchPlotAndTropeSettings({ mainAntagonistPressure: val }))}
          placeholder="e.g., The celestial court's fate auditors..."
        />
      </div>

      <GuidanceNote title="Seed-level direction only">
        These four answers help define the novel itself, so they live in the seed. Pacing, tone,
        romance, and Fate Survival change how you experience a story after it exists — those stay in
        Story Settings.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
