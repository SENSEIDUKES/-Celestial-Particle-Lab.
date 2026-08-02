import React from 'react';
import { IntakeData } from '../../shared/types';
import { getSeedSection } from '../seedSections';
import { FormInput, FormTextarea } from '../form-fields';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface PlotTropesWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/**
 * Optional Story workspace: the only seed-level plot direction kept in Story
 * Seed. Each field here answers "what novel is this?" — where the story is
 * headed, what it opens against, and who pushes back.
 *
 * Everything that answers "how do I want to experience this novel?" — pacing,
 * tone, romance/harem, comedy, betrayal, Fate Survival — deliberately does not
 * live here. Those are experience settings that can change after creation, and
 * they belong to the separate Story Settings feature.
 */
export const PlotTropesWorkspace = ({ intake, updateIntake }: PlotTropesWorkspaceProps) => {
  const section = getSeedSection('plot-tropes');

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <FormTextarea
        id="desired-plot-direction-input"
        label="Desired Plot Direction"
        maxLength={1500}
        value={intake.desiredPlotDirection || ''}
        onChange={(val) => updateIntake('desiredPlotDirection', val)}
        rows={3}
        placeholder="e.g. Revenge focused, slow sect building, kingdom conquering..."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          id="a11y-control-jolpc3b"
          label="Long-term Goal"
          value={intake.longTermGoal || ''}
          onChange={(val) => updateIntake('longTermGoal', val)}
          placeholder="e.g., Shatter the heavens..."
        />
        <FormInput
          id="a11y-control-6a6tmbf"
          label="First Major Conflict"
          value={intake.firstMajorConflict || ''}
          onChange={(val) => updateIntake('firstMajorConflict', val)}
          placeholder="e.g., Sect tournament, survival trial..."
        />
        <FormInput
          id="main-antagonist-pressure-input"
          label="Main Antagonist Pressure"
          helpText="Who or what pushes back against the main character the hardest."
          value={intake.mainAntagonistPressure || ''}
          onChange={(val) => updateIntake('mainAntagonistPressure', val)}
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
