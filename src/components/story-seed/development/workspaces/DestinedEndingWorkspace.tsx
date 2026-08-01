import React from 'react';
import { IntakeData } from '../../shared/types';
import { getSeedSection } from '../seedSections';
import { FormTextarea } from '../form-fields';
import { WorkspaceShell } from './WorkspaceShell';

interface DestinedEndingWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/** Optional World workspace: the story's fated final destination. */
export const DestinedEndingWorkspace = ({ intake, updateIntake }: DestinedEndingWorkspaceProps) => {
  const section = getSeedSection('destined-ending');

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <FormTextarea
        id="destined-ending-input"
        label="Destined Ending"
        maxLength={1500}
        helpText="The intended final destination of this story or arc. If left blank, the Library recommends a fitting destined ending (e.g., Kingdom Collapse, Final Ascension, or Fated Separation) based on your genre and premise. You can alter this outcome later!"
        value={intake.destinedEnding || ''}
        onChange={(val) => updateIntake('destinedEnding', val)}
        rows={3}
        placeholder="e.g. The kingdom falls, the MC ascends to godhood, or the lovers are separated..."
      />
    </WorkspaceShell>
  );
};
