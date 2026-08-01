import React from 'react';
import { IntakeData } from '../../shared/types';
import { getSeedSection } from '../seedSections';
import { FormTextarea } from '../form-fields';
import { WorkspaceShell } from './WorkspaceShell';

interface OtherWorldSettingsWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/** Optional World workspace: universe overview and major mysteries. */
export const OtherWorldSettingsWorkspace = ({ intake, updateIntake }: OtherWorldSettingsWorkspaceProps) => {
  const section = getSeedSection('other-world-settings');

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <FormTextarea
        id="universe-overview-input"
        label="Universe Overview"
        maxLength={1500}
        helpText="The wider reality beyond the starting region — how the world is shaped, who rules it, and what era the story opens in."
        value={intake.universeOverview || ''}
        onChange={(val) => updateIntake('universeOverview', val)}
        rows={4}
        placeholder="e.g., A shattered celestial court rules the sects through fate ledgers, three eras after the last ascension..."
      />
      <FormTextarea
        id="major-mysteries-input"
        label="Major Mysteries"
        maxLength={1200}
        helpText="Truths buried in the world that the story can dig up over time. One mystery per line."
        value={intake.majorMysteries || ''}
        onChange={(val) => updateIntake('majorMysteries', val)}
        rows={3}
        placeholder={'Who wrote the fate ledgers?\nWhat killed the Eighth Prince?'}
      />
    </WorkspaceShell>
  );
};
