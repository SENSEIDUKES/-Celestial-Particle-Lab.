import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { IntakeData } from '../../shared/types';
import { getDialectLabel } from '../../shared/dialect';
import { getSeedSection } from '../seedSections';
import { FormInput, FormTextarea } from '../form-fields';
import {
  GuidanceNote,
  WorkspaceShell,
  WorkspaceSubheading,
  workspaceInputClass,
  workspaceLabelClass,
} from './WorkspaceShell';

interface StorySettingsWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

const SelectField = ({
  id,
  label,
  help,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) => (
  <div>
    <label className={workspaceLabelClass} htmlFor={id}>{label}</label>
    {help && <p className="mb-1 font-sans text-[9px] normal-case leading-snug text-neutral-500">{help}</p>}
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${workspaceInputClass} px-2 py-1.5`}
    >
      <option value="">Library Default</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

/**
 * Secondary Story workspace: every optional plot, trope, tone, pacing, and
 * experience control. Grouped but always expanded inside its own focused
 * surface — it never competes with the four required Story inputs.
 */
export const StorySettingsWorkspace = ({ intake, updateIntake }: StorySettingsWorkspaceProps) => {
  const section = getSeedSection('story-settings');

  const handleFatePressureChange = (pressure: 'Relaxed' | 'Balanced' | 'Hardcore' | 'Dao Master') => {
    updateIntake('fatePressure', pressure);
    updateIntake('hardcoreFateMode', pressure === 'Hardcore' || pressure === 'Dao Master');
  };

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <GuidanceNote title="Optional by design">
        Everything here has a sensible Library default inferred from your tags, premise, and genre.
        Touch only the dials you care about — empty settings are extrapolated, never treated as gaps.
      </GuidanceNote>

      <div className="space-y-4">
        <WorkspaceSubheading>Plot Direction</WorkspaceSubheading>
        <FormTextarea
          id="desired-plot-direction-input"
          label="Desired General Plot Direction"
          maxLength={1500}
          value={intake.desiredPlotDirection || ''}
          onChange={(val) => updateIntake('desiredPlotDirection', val)}
          rows={2}
          placeholder="e.g. Revenge focused, slow sect building, kingdom conquering..."
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            id="estimated-arcs-input"
            type="number"
            label="Estimated Arcs (Story Length)"
            helpText="Highschool Drama ~3-4, Epic Fantasy ~10-20+. Leave blank and the Library guesses from your premise."
            value={intake.estimatedArcs || ''}
            onChange={(val) => updateIntake('estimatedArcs', val ? parseInt(val) : undefined)}
            placeholder="e.g. 5"
            min="1"
            max="100"
          />
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
            helpText="Who or what pushes back against the MC the hardest."
            value={intake.mainAntagonistPressure || ''}
            onChange={(val) => updateIntake('mainAntagonistPressure', val)}
            placeholder="e.g., The celestial court's fate auditors..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <WorkspaceSubheading>Tone &amp; Pacing</WorkspaceSubheading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            id="general-atmosphere-input"
            label="General Atmosphere"
            value={intake.generalAtmosphere || ''}
            onChange={(val) => updateIntake('generalAtmosphere', val)}
            placeholder="e.g., Ominous and intimate, cozy but watchful..."
          />
          <FormInput
            id="danger-level-input"
            label="Danger Level & Atmosphere"
            value={intake.dangerLevel || ''}
            onChange={(val) => updateIntake('dangerLevel', val)}
            placeholder="e.g., Cutthroat, grimdark, mystical..."
          />
          <SelectField
            id="a11y-control-bgd1ldg"
            label="Pacing"
            value={intake.powerPace || ''}
            options={['Fast', 'Balanced', 'Slow']}
            onChange={(val) => updateIntake('powerPace', val)}
          />
          <FormInput
            id="comedy-level-input"
            label="Comedy Level"
            value={intake.comedyLevel || ''}
            onChange={(val) => updateIntake('comedyLevel', val)}
            placeholder="e.g., Dry wit only, frequent banter, none..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <WorkspaceSubheading>Tropes &amp; Experience</WorkspaceSubheading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SelectField
            id="a11y-control-dsrko5x"
            label={getDialectLabel('face_slapping', intake.genrePath)}
            help="How often arrogant rivals get publicly humbled."
            value={intake.faceSlappingLevel || ''}
            options={['High', 'Moderate', 'Low']}
            onChange={(val) => updateIntake('faceSlappingLevel', val)}
          />
          <SelectField
            id="a11y-control-3wbtyld"
            label="Romance / Harem"
            value={intake.romanceLevel || ''}
            options={['None', 'Single', 'Harem']}
            onChange={(val) => updateIntake('romanceLevel', val)}
          />
          <FormInput
            id="tournament-arc-input"
            label="Tournament Arcs"
            value={intake.tournamentArcPreference || ''}
            onChange={(val) => updateIntake('tournamentArcPreference', val)}
            placeholder="e.g., One meaningful arc"
          />
          <FormInput
            id="harem-preference-input"
            label="Harem Preference"
            value={intake.haremPreference || ''}
            onChange={(val) => updateIntake('haremPreference', val)}
            placeholder="e.g., None, subtle only..."
          />
          <FormInput
            id="betrayal-level-input"
            label="Betrayal Level"
            value={intake.betrayalLevel || ''}
            onChange={(val) => updateIntake('betrayalLevel', val)}
            placeholder="e.g., Rare but devastating"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            id="a11y-control-morghmz"
            label="Things to Avoid"
            value={intake.thingsToAvoid || ''}
            onChange={(val) => updateIntake('thingsToAvoid', val)}
            placeholder="e.g., No young masters, no system cheat..."
          />
          <FormInput
            id="a11y-control-hirbzji"
            label="Must Include Elements"
            value={intake.mustIncludeElements || ''}
            onChange={(val) => updateIntake('mustIncludeElements', val)}
            placeholder="e.g., Auction arc, pill refinement..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <WorkspaceSubheading>
          <span className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-human" />
            {getDialectLabel('fate_pressure', intake.genrePath)}
          </span>
        </WorkspaceSubheading>
        <p className="font-sans text-xs text-neutral-500">
          Control how harsh the story consequences are — how actively the world fights back against the MC, increasing tragedy and betrayal risk.
        </p>
        <div className="flex flex-wrap gap-2">
          {(['Relaxed', 'Balanced', 'Hardcore', 'Dao Master'] as const).map(level => (
            <button
              key={level}
              type="button"
              onClick={() => handleFatePressureChange(level)}
              aria-pressed={intake.fatePressure === level}
              className={`rounded px-4 py-2 font-sc text-xs font-bold uppercase tracking-widest transition-all ${
                intake.fatePressure === level
                  ? level === 'Dao Master' || level === 'Hardcore'
                    ? 'border border-human bg-human text-signal shadow-[0_0_10px_rgba(139,0,0,0.4)]'
                    : 'border border-portal bg-portal text-void shadow-[0_0_10px_rgba(4,172,255,0.4)]'
                  : 'border border-neutral-800 bg-void text-neutral-500 hover:border-neutral-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <WorkspaceSubheading>Absolute Custom Rules</WorkspaceSubheading>
        <FormTextarea
          id="make-it-work-input"
          label="Make It Work Instruction"
          helpText="Are your ideas completely contradictory? (e.g. a pacifist monk who constantly slaughters sects). Tell the Library how to logically weave your conflicting seeds together."
          value={intake.makeItWorkInstruction || ''}
          onChange={(val) => updateIntake('makeItWorkInstruction', val)}
          rows={3}
          placeholder="e.g., Explain the pacifist monk's slaughter by having his master's soul temporarily take over his body during extreme emotional distress..."
        />
      </div>
    </WorkspaceShell>
  );
};
