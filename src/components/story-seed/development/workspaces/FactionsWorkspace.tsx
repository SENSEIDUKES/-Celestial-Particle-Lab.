import React from 'react';
import { IntakeData, IntakeFaction } from '../../shared/types';
import { normalizeCodexAliases, parseCodexAliases } from '../../shared/codexContext';
import { getSeedSection } from '../seedSections';
import { WorkspaceShell } from './WorkspaceShell';

interface FactionsWorkspaceProps {
  intake: IntakeData;
  updateIntake: (field: keyof IntakeData, value: any) => void;
}

const smallInputClass =
  'w-full bg-void border border-neutral-800 text-signal text-xs rounded px-2 py-1.5 focus:border-portal outline-none transition-colors';
const smallLabelClass =
  'block font-sc text-[10px] text-neutral-400 uppercase tracking-widest mb-1';

/** Optional World workspace: pre-defined factions and sects. */
export const FactionsWorkspace = ({ intake, updateIntake }: FactionsWorkspaceProps) => {
  const section = getSeedSection('factions');
  const factions = intake.customFactions || [];

  const updateFaction = (index: number, patch: Partial<IntakeFaction>) => {
    const next = [...factions];
    next[index] = { ...next[index], ...patch };
    updateIntake('customFactions', next);
  };

  return (
    <WorkspaceShell section={section} complete={section.isFilled(intake)}>
      <p className="font-sans text-xs text-neutral-500">
        Pre-define factions or sects for your world. Include their alignment, power level, and connection
        to the main character. Left empty, the Library invents the powers that fit your Story.
      </p>
      {factions.map((faction, index) => (
        <div key={faction.id} className="relative space-y-3 rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-sc text-xs font-bold uppercase tracking-widest text-signal">Faction {index + 1}</h4>
            <button
              type="button"
              onClick={() => updateIntake('customFactions', factions.filter((_, i) => i !== index))}
              className="font-sc text-xs uppercase tracking-widest text-neutral-500 transition-colors hover:text-human"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className={smallLabelClass} htmlFor={index === 0 ? 'a11y-control-xhc59yh' : `faction-name-${faction.id}`}>Name</label>
              <input type="text" value={faction.name || ''} onChange={(e) => updateFaction(index, { name: e.target.value })} placeholder="e.g. Heavenly Sword Sect" className={smallInputClass} id={index === 0 ? 'a11y-control-xhc59yh' : `faction-name-${faction.id}`} />
            </div>
            <div>
              <label className={smallLabelClass} htmlFor={`faction-role-${faction.id}`}>Role</label>
              <input type="text" value={faction.role || ''} onChange={(e) => updateFaction(index, { role: e.target.value })} placeholder="e.g. Ruling Power, Assassin Guild..." className={smallInputClass} id={`faction-role-${faction.id}`} />
            </div>
            <div>
              <label className={smallLabelClass} htmlFor={`faction-power-${faction.id}`}>Power Level</label>
              <input type="text" value={faction.powerLevel || ''} onChange={(e) => updateFaction(index, { powerLevel: e.target.value })} placeholder="e.g. Mid Tier, Universal Force..." className={smallInputClass} id={`faction-power-${faction.id}`} />
            </div>
            <div>
              <label className={smallLabelClass} htmlFor={`faction-alignment-${faction.id}`}>Alignment (Good/Bad)</label>
              <input type="text" value={faction.alignment || ''} onChange={(e) => updateFaction(index, { alignment: e.target.value })} placeholder="e.g. Righteous, Demonic, Neutral..." className={smallInputClass} id={`faction-alignment-${faction.id}`} />
            </div>
            <div className="md:col-span-2">
              <label className={smallLabelClass} htmlFor={`mc-faction-connection-${faction.id}`}>Connection to MC</label>
              <input type="text" id={`mc-faction-connection-${faction.id}`} value={faction.connectionToMC || ''} onChange={(e) => updateFaction(index, { connectionToMC: e.target.value })} placeholder="e.g. MC's starting sect, Sworn enemies..." className={smallInputClass} />
            </div>
            <div className="col-span-1 sm:col-span-2 md:col-span-3">
              <label className={smallLabelClass} htmlFor={`faction-aliases-${faction.id}`}>Aliases / Known Titles</label>
              <textarea
                key={`${faction.id}-${normalizeCodexAliases(faction.aliases, faction.name).join('|')}`}
                id={`faction-aliases-${faction.id}`}
                rows={2}
                defaultValue={normalizeCodexAliases(faction.aliases, faction.name).join(', ')}
                onBlur={(e) => {
                  const aliases = parseCodexAliases(e.currentTarget.value, faction.name);
                  e.currentTarget.value = aliases.join(', ');
                  updateFaction(index, { aliases });
                }}
                placeholder="e.g. Azure Hall; Eastern Pavilion"
                className="w-full resize-none rounded border border-neutral-800 bg-void px-2 py-1.5 text-xs text-signal outline-none transition-colors focus:border-portal"
              />
              <p className="mt-1 font-sans text-[9px] text-neutral-600">User-authored only. Separate names or titles with commas, semicolons, or new lines.</p>
            </div>
            <div className="col-span-1 sm:col-span-2 md:col-span-3">
              <div className="mb-1 flex items-end justify-between">
                <label className={smallLabelClass} htmlFor={`faction-description-${faction.id}`}>Detailed Description &amp; Hierarchy</label>
                <span className="font-mono text-[9px] text-neutral-500">{(faction.description || '').length} / 1200</span>
              </div>
              <textarea
                id={`faction-description-${faction.id}`}
                value={faction.description || ''}
                onChange={(e) => updateFaction(index, { description: e.target.value })}
                maxLength={1200}
                rows={2}
                placeholder="Organizational hierarchy, core beliefs, regional influence, elders, hidden rules..."
                className="w-full resize-none rounded border border-neutral-800 bg-void px-3 py-2 text-xs text-signal outline-none transition-colors focus:border-portal"
              />
            </div>
          </div>
        </div>
      ))}
      {factions.length < 5 && (
        <button
          type="button"
          onClick={() => {
            updateIntake('customFactions', [
              ...factions,
              { id: crypto.randomUUID(), name: '', aliases: [], role: '', powerLevel: '', alignment: '', connectionToMC: '', description: '' },
            ]);
          }}
          className="w-full rounded border border-dashed border-neutral-800 py-2 font-sc text-xs uppercase tracking-widest text-neutral-400 transition-all hover:border-portal/50 hover:bg-portal/5 hover:text-portal"
        >
          + Add Faction ({factions.length}/5)
        </button>
      )}
    </WorkspaceShell>
  );
};
