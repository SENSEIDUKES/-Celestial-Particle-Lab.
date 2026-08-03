import React from 'react';
import { Route, Zap } from 'lucide-react';
import { IntakeData } from '../../shared/types';
import { getSeedSection } from '../seedSections';
import { FormInput, FormTextarea } from '../form-fields';
import { GuidanceNote, WorkspaceShell } from './WorkspaceShell';

interface AbilitiesWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/** Optional World workspace: the MC's starting power concept and unique path. */
export const AbilitiesWorkspace = ({ intake, updateIntake }: AbilitiesWorkspaceProps) => {
  const section = getSeedSection('abilities');

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          id="a11y-control-itgsjgw"
          label="Starting Power Concept"
          icon={Zap}
          value={intake.startingPowerConcept || ''}
          onChange={(val) => updateIntake('startingPowerConcept', val)}
          placeholder="e.g., Qi Condensation Tier 1, Feng Shui Level 1..."
        />
        <FormTextarea
          id="unique-path-input"
          label="Unique Path"
          icon={Route}
          maxLength={1200}
          helpText="What makes the main character's way of growing power unlike anyone else's — a forbidden method, a twisted bloodline, a borrowed system."
          value={intake.uniquePath || ''}
          onChange={(val) => updateIntake('uniquePath', val)}
          rows={2}
          placeholder="e.g., Cultivates by severing other people's fates instead of gathering qi..."
        />
      </div>

      <GuidanceNote title="Abilities vs. Power System" tone="world">
        Abilities belong to the main character — what they start with and what sets them apart.
        The Power System section belongs to the world — the ladder everyone climbs.
      </GuidanceNote>
    </WorkspaceShell>
  );
};
