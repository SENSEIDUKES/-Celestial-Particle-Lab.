import React from 'react';
import { IntakeCharacter, IntakeData } from '../../shared/types';
import { normalizeCodexAliases, parseCodexAliases } from '../../shared/codexContext';
import { getSeedSection } from '../seedSections';
import { FormInput, FormTextarea } from '../form-fields';
import {
  WorkspaceShell,
  WorkspaceSubheading,
  workspaceInputClass,
  workspaceLabelClass,
} from './WorkspaceShell';

interface CharactersWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

const smallInputClass =
  'w-full bg-void border border-neutral-800 text-signal text-xs rounded px-2 py-1.5 focus:border-portal outline-none transition-colors';
const smallLabelClass =
  'block font-sc text-[10px] text-neutral-400 uppercase tracking-widest mb-1';

/**
 * Optional World workspace: the main character plus any pre-defined cast.
 * Merges Phase 1's Main Character Setup and Character Intake sections into one
 * focused surface.
 */
export const CharactersWorkspace = ({ intake, updateIntake }: CharactersWorkspaceProps) => {
  const section = getSeedSection('characters');
  const characters = intake.customCharacters || [];

  const updateCharacter = (index: number, patch: Partial<IntakeCharacter>) => {
    const next = [...characters];
    next[index] = { ...next[index], ...patch };
    updateIntake('customCharacters', next);
  };

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <div className="space-y-4">
        <WorkspaceSubheading>Main Character</WorkspaceSubheading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            id="a11y-control-7b2mqtu"
            label="Main Character Name"
            value={intake.mcName || ''}
            onChange={(val) => updateIntake('mcName', val)}
            placeholder="e.g., Lin Fan"
          />
          <FormInput
            id="mc-starting-identity-input"
            label="Starting Identity"
            value={intake.startingIdentity || ''}
            onChange={(val) => updateIntake('startingIdentity', val)}
            placeholder="e.g., Crippled young master, modern transmigrator..."
          />
          <FormInput
            id="mc-personality-input"
            label="Personality & Alignment"
            value={intake.personality || ''}
            onChange={(val) => updateIntake('personality', val)}
            placeholder="e.g., Ruthless but protective, chaotic neutral..."
          />
          <FormInput
            id="mc-secret-advantage-input"
            label="Secret Advantage / Cheat"
            value={intake.secretAdvantage || ''}
            onChange={(val) => updateIntake('secretAdvantage', val)}
            placeholder="e.g., System interface, primeval bloodline..."
          />
          <FormInput
            id="mc-starting-weakness-input"
            label="Starting Weakness"
            value={intake.startingWeakness || ''}
            onChange={(val) => updateIntake('startingWeakness', val)}
            placeholder="e.g., Destroyed meridians, demonic curse..."
          />
          <FormInput
            id="mc-main-flaw-input"
            label="Main Flaw"
            value={intake.mainFlaw || ''}
            onChange={(val) => updateIntake('mainFlaw', val)}
            placeholder="e.g., Cannot trust allies, crippling pride..."
          />
          <FormInput
            id="mc-moral-alignment-input"
            label="Moral Alignment"
            value={intake.moralAlignment || ''}
            onChange={(val) => updateIntake('moralAlignment', val)}
            placeholder="e.g., Chaotic neutral, lawful evil..."
          />
        </div>
        <FormTextarea
          id="mc-bio-input"
          label="Main Character Biography & Backstory"
          maxLength={2000}
          helpText="Describe their backstory, personality quirks, hidden talents, major flaws, or specific fated ties. High-density characterization forces a highly customized narrative."
          value={intake.mcBio || ''}
          onChange={(val) => updateIntake('mcBio', val)}
          rows={3}
          placeholder="e.g., Born as the son of a fallen patriarch, carrying the blood of a Primordial dragon, extremely lazy but protective..."
        />
      </div>

      <div className="space-y-4">
        <WorkspaceSubheading>Additional Characters</WorkspaceSubheading>
        <p className="font-sans text-xs text-neutral-500">
          Pre-define characters for your world. Include core traits or relationships to the main character.
          If left blank or partially filled, the Library will guess.
        </p>
        {characters.map((char, index) => (
          <div key={char.id} className="relative space-y-3 rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-sc text-xs font-bold uppercase tracking-widest text-signal">Character {index + 1}</h4>
              <button
                type="button"
                onClick={() => updateIntake('customCharacters', characters.filter((_, i) => i !== index))}
                className="font-sc text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-human"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className={smallLabelClass} htmlFor={index === 0 ? 'a11y-control-boqy7nd' : `char-name-${char.id}`}>Name</label>
                <input type="text" value={char.name || ''} onChange={(e) => updateCharacter(index, { name: e.target.value })} placeholder="e.g. Lin Yue" className={smallInputClass} id={index === 0 ? 'a11y-control-boqy7nd' : `char-name-${char.id}`} />
              </div>
              <div>
                <label className={smallLabelClass} htmlFor={`char-age-${char.id}`}>Age</label>
                <input type="text" value={char.age || ''} onChange={(e) => updateCharacter(index, { age: e.target.value })} placeholder="e.g. 18, Ancient..." className={smallInputClass} id={`char-age-${char.id}`} />
              </div>
              <div>
                <label className={smallLabelClass} htmlFor={`char-skin-${char.id}`}>Skin Tone</label>
                <input type="text" value={char.skinTone || ''} onChange={(e) => updateCharacter(index, { skinTone: e.target.value })} placeholder="e.g. Pale, Olive..." className={smallInputClass} id={`char-skin-${char.id}`} />
              </div>
              <div>
                <label className={smallLabelClass} htmlFor={`char-eyes-${char.id}`}>Eye Color</label>
                <input type="text" value={char.eyeColor || ''} onChange={(e) => updateCharacter(index, { eyeColor: e.target.value })} placeholder="e.g. Crimson, Blue..." className={smallInputClass} id={`char-eyes-${char.id}`} />
              </div>
              <div>
                <label className={smallLabelClass} htmlFor={`char-power-${char.id}`}>Power Type</label>
                <input type="text" value={char.powerType || ''} onChange={(e) => updateCharacter(index, { powerType: e.target.value })} placeholder="e.g. Frost Dao, Sword..." className={smallInputClass} id={`char-power-${char.id}`} />
              </div>
              <div>
                <label className={smallLabelClass} htmlFor={`char-rank-${char.id}`}>Rank / Level</label>
                <input type="text" value={char.rankLevel || ''} onChange={(e) => updateCharacter(index, { rankLevel: e.target.value })} placeholder="e.g. Foundation Est." className={smallInputClass} id={`char-rank-${char.id}`} />
              </div>
              <div>
                <label className={smallLabelClass} htmlFor={`char-role-${char.id}`}>Role</label>
                <input type="text" value={char.role || ''} onChange={(e) => updateCharacter(index, { role: e.target.value })} placeholder="e.g. Sect Elder, Rogue..." className={smallInputClass} id={`char-role-${char.id}`} />
              </div>
              <div>
                <label className={smallLabelClass} htmlFor={`mc-char-connection-${char.id}`}>Connection to MC</label>
                <input type="text" value={char.connectionToMC || ''} onChange={(e) => updateCharacter(index, { connectionToMC: e.target.value })} placeholder="e.g. Rival, Foe, Ally..." className={smallInputClass} id={`mc-char-connection-${char.id}`} />
              </div>
              <div className="col-span-1 sm:col-span-2 md:col-span-4">
                <label className={smallLabelClass} htmlFor={`char-aliases-${char.id}`}>Aliases / Known Titles</label>
                <textarea
                  key={`${char.id}-${normalizeCodexAliases(char.aliases, char.name).join('|')}`}
                  id={`char-aliases-${char.id}`}
                  rows={2}
                  defaultValue={normalizeCodexAliases(char.aliases, char.name).join(', ')}
                  onBlur={(e) => {
                    const aliases = parseCodexAliases(e.currentTarget.value, char.name);
                    e.currentTarget.value = aliases.join(', ');
                    updateCharacter(index, { aliases });
                  }}
                  placeholder="e.g. Sister Mei; Pavilion Mistress"
                  className="w-full resize-none rounded border border-neutral-800 bg-void px-2 py-1.5 text-xs text-signal outline-none transition-colors focus:border-portal"
                />
                <p className="mt-1 font-sans text-[9px] text-neutral-600">User-authored only. Separate names or titles with commas, semicolons, or new lines.</p>
              </div>
              <div className="col-span-1 sm:col-span-2 md:col-span-4">
                <div className="mb-1 flex items-end justify-between">
                  <label className={smallLabelClass} htmlFor={`char-bio-${char.id}`}>Biography &amp; Traits</label>
                  <span className="font-mono text-[9px] text-neutral-500">{(char.bio || '').length} / 2000</span>
                </div>
                <textarea
                  id={`char-bio-${char.id}`}
                  value={char.bio || ''}
                  onChange={(e) => updateCharacter(index, { bio: e.target.value })}
                  maxLength={2000}
                  rows={2}
                  placeholder="Vivid biography, personality quirks, hidden talents, major flaws, or specific fated actions..."
                  className="w-full resize-none rounded border border-neutral-800 bg-void px-3 py-2 text-xs text-signal outline-none transition-colors focus:border-portal"
                />
              </div>
            </div>
          </div>
        ))}
        {characters.length < 8 && (
          <button
            type="button"
            onClick={() => {
              updateIntake('customCharacters', [
                ...characters,
                { id: crypto.randomUUID(), name: '', aliases: [], age: '', skinTone: '', eyeColor: '', powerType: '', rankLevel: '', role: '', connectionToMC: '', bio: '' },
              ]);
            }}
            className="w-full rounded border border-dashed border-neutral-800 py-2 font-sc text-xs uppercase tracking-widest text-neutral-400 transition-all hover:border-portal/50 hover:bg-portal/5 hover:text-portal"
          >
            + Add Character ({characters.length}/8)
          </button>
        )}
      </div>
    </WorkspaceShell>
  );
};
