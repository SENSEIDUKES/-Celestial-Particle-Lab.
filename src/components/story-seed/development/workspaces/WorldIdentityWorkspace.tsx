import React from 'react';
import { IntakeData } from '../../shared/types';
import { getSeedSection } from '../seedSections';
import { FormInput, FormTextarea } from '../form-fields';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface WorldIdentityWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/** Optional World workspace: title, world type, society, starting location. */
export const WorldIdentityWorkspace = ({ intake, updateIntake }: WorldIdentityWorkspaceProps) => {
  const section = getSeedSection('world-identity');

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <GuidanceNote title="World is optional" tone="world">
        Every World section can be left empty — the Library generates the complete world automatically
        from your Story direction. Fill in only what you already have strong opinions about.
      </GuidanceNote>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          id="a11y-control-v2xlbs8"
          label="Novel Title"
          value={intake.novelTitle || ''}
          onChange={(val) => updateIntake('novelTitle', val)}
          placeholder="Will be generated if empty"
        />
        <FormInput
          id="world-type-input"
          label="World Type"
          value={intake.worldType || ''}
          onChange={(val) => updateIntake('worldType', val)}
          placeholder="e.g., Ancient sect world, tower system..."
        />
        <FormInput
          id="society-structure-input"
          label="Society Structure"
          value={intake.societyStructure || ''}
          onChange={(val) => updateIntake('societyStructure', val)}
          placeholder="e.g., Sect-led, feudal, corporate..."
        />
      </div>

      <FormTextarea
        id="starting-location-input"
        label="Starting Location (Detailed regional atmosphere)"
        maxLength={1200}
        helpText="Describe the geography, climate, and immediate atmosphere of the starting zone (e.g. outer sect labor quarry, freezing mortal mountain village)."
        value={intake.startingLocation || ''}
        onChange={(val) => updateIntake('startingLocation', val)}
        rows={3}
        placeholder="e.g., A sprawling outer sect labor quarry built inside a cavernous volcanic rift. The air is heavy with sulfur, and molten ore glows in the deep trenches..."
      />
    </WorkspaceShell>
  );
};
