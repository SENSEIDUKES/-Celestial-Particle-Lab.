import React from 'react';
import { Flame, Layers } from 'lucide-react';
import { IntakeData } from '../../shared/types';
import { getSeedSection } from '../seedSections';
import { FormInput, FormTextarea } from '../form-fields';
import { WorkspaceShell } from './WorkspaceShell';

interface PowerSystemWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

/** Optional World workspace: power flavor and known ranks. */
export const PowerSystemWorkspace = ({ intake, updateIntake }: PowerSystemWorkspaceProps) => {
  const section = getSeedSection('power-system');

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <div className="grid grid-cols-1 gap-4">
        <FormInput
          id="a11y-control-kytc0oh"
          label="Power Flavor"
          icon={Flame}
          value={intake.powerFlavor || ''}
          onChange={(val) => updateIntake('powerFlavor', val)}
          placeholder="e.g., Martial arts, Daoist, Demonic, Sword..."
        />
        <FormTextarea
          id="a11y-control-6rmg4xp"
          label="Known Ranks"
          icon={Layers}
          value={intake.knownRanks || ''}
          onChange={(val) => updateIntake('knownRanks', val)}
          rows={3}
          placeholder="Optional. If partial, the Library extrapolates a full wuxia/xianxia ladder."
        />
      </div>
    </WorkspaceShell>
  );
};
