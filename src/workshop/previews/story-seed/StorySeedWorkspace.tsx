import React, { useCallback, useEffect, useState } from 'react';
import ReferenceCreationModal from '../../../components/story-seed/reference/CreationModal';
import DevelopmentCreationModal from '../../../components/story-seed/development/CreationModal';
import {
  resetMockSeeds,
  resetMockState,
  setMockLocalOnlyMode,
  useAppStore,
} from '../../../components/story-seed/shared/stubs';
import { resetStorySeedRepository } from '../../../components/story-seed/shared/storySeedRepository';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';
import {
  createMockBlueprint,
  createMockSeedLibrary,
  createMockStorySeedLibrary,
  MOCK_USER_ID,
} from './previewData';
import {
  PREVIEW_CATEGORIES,
  PreviewCategory,
  PreviewState,
  scenarios,
  scenariosInCategory,
} from './previewStates';

// ─── DOM-driven scenario scripting ───────────────────────────────────────────
// CreationModal owns `intake`, `stage`, and `showImportPanel` as internal
// component state — it accepts no props for them. To reach a "filled" or
// "blueprint" scenario faithfully (never by reaching into React internals),
// the Workshop drives the *real* rendered controls: typing into the actual
// inputs and clicking the actual buttons, the same way reader-chamber's
// `clickInChamber` drove its preview states.
//
// Since Phase 2, the two panes are structurally different UIs: the locked
// reference fork is the old numbered accordion, the development fork is the
// two-panel creation workspace. Pane wrappers carry `data-story-seed-pane`
// so each scenario script can drive each fork through its own real controls.

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type PaneKind = 'reference' | 'development';

function getRoots(pane: PaneKind): Element[] {
  return Array.from(
    document.querySelectorAll(`[data-story-seed-pane="${pane}"] [id="creation-portal-root"]`),
  );
}

function setFieldValue(root: Element, id: string, value: string) {
  const el = root.querySelector(`[id="${id}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el) return;
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

function clickByText(root: Element, selector: string, pattern: RegExp) {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector));
  const target = nodes.find(node => pattern.test(node.textContent?.trim() ?? ''));
  target?.click();
}

/** Reference pane: fills the locked Phase 1 accordion replica (unchanged steps). */
async function runReferenceFillScenario() {
  getRoots('reference').forEach(root => {
    setFieldValue(root, 'a11y-control-v2xlbs8', 'Ashes of the Ninth Meridian');
    setFieldValue(root, 'a11y-control-7b2mqtu', 'Ye Chen');
    setFieldValue(
      root,
      'core-premise-input',
      'In seven chapters, the prince will be assassinated. Every timeline says he dies. Can you change fate before it happens?',
    );
  });
  await wait(80);
  getRoots('reference').forEach(root => {
    clickByText(root, 'button', /^\+ death flags$/);
    clickByText(root, 'button', /^\+ sect politics$/);
  });

  await wait(80);
  getRoots('reference').forEach(root => clickByText(root, 'button', /2\. World Setting/));
  await wait(120);
  getRoots('reference').forEach(root => {
    setFieldValue(root, 'world-type-input', 'Ancient sect world with a collapsing celestial court');
    setFieldValue(root, 'society-structure-input', 'Sect-led feudal hierarchy');
    setFieldValue(root, 'danger-level-input', 'Cutthroat, grimdark, mystical');
    setFieldValue(root, 'starting-location-input', 'Outer sect labor quarry inside a volcanic rift.');
  });

  await wait(80);
  getRoots('reference').forEach(root => clickByText(root, 'button', /3\. Main Character Setup/));
  await wait(120);
  getRoots('reference').forEach(root => {
    setFieldValue(root, 'mc-starting-identity-input', 'Crippled young master');
    setFieldValue(root, 'mc-personality-input', 'Ruthless but protective, chaotic neutral');
    setFieldValue(root, 'mc-secret-advantage-input', 'Foreknowledge of seven doomed timelines');
    setFieldValue(root, 'mc-starting-weakness-input', 'Destroyed meridians');
    setFieldValue(
      root,
      'mc-bio-input',
      'Born as the son of a fallen patriarch, carrying the blood of a Primordial dragon, extremely lazy but protective.',
    );
  });

  await wait(80);
  getRoots('reference').forEach(root => clickByText(root, 'button', /3\.5\. Character Intake/));
  await wait(120);
  getRoots('reference').forEach(root => clickByText(root, 'button', /\+ Add Character/));
  await wait(80);
  getRoots('reference').forEach(root => setFieldValue(root, 'a11y-control-boqy7nd', 'Elder Qin'));

  await wait(80);
  getRoots('reference').forEach(root => clickByText(root, 'button', /3\.8\. Faction\/Sect Intake/));
  await wait(120);
  getRoots('reference').forEach(root => clickByText(root, 'button', /\+ Add Faction/));
  await wait(80);
  getRoots('reference').forEach(root => setFieldValue(root, 'a11y-control-xhc59yh', 'Heavenly Sword Sect'));

  await wait(80);
  getRoots('reference').forEach(root => clickByText(root, 'button', /4\. Power System Seed/));
  await wait(120);
  getRoots('reference').forEach(root => {
    setFieldValue(root, 'a11y-control-itgsjgw', 'Qi Condensation Tier 1');
    setFieldValue(root, 'a11y-control-kytc0oh', 'Martial arts, Daoist');
  });

  await wait(80);
  getRoots('reference').forEach(root => clickByText(root, 'button', /5\. Plot & Trope Control/));
  await wait(120);
  getRoots('reference').forEach(root => {
    setFieldValue(root, 'a11y-control-jolpc3b', 'Shatter the fated assassination timeline');
    setFieldValue(root, 'a11y-control-6a6tmbf', 'Sect tournament that reveals the first assassination attempt');
  });

  await wait(80);
  getRoots('reference').forEach(root => clickByText(root, 'button', /1\. Core Seed/));
}

/** Development pane: fills the compact Origin flow through its real controls
 *  before continuing through the remaining Story and World workspaces. */
async function runDevelopmentFillScenario() {
  const selectSection = async (pattern: RegExp) => {
    getRoots('development').forEach(root => clickByText(root, 'button', pattern));
    await wait(150);
  };

  // Origin is the single home for the four core story ingredients.
  await selectSection(/^Origin/);
  getRoots('development').forEach(root =>
    (root.querySelector('[id="story-style-chinese"]') as HTMLElement | null)?.click());

  // Genre presets remain available through the compact path picker.
  getRoots('development').forEach(root => clickByText(root, 'button', /^Pick a path/));
  await wait(80);
  getRoots('development').forEach(root => clickByText(root, 'button', /Xianxia/));

  // Premise remains the dominant Origin field.
  getRoots('development').forEach(root => setFieldValue(
    root,
    'core-premise-input',
    'In seven chapters, the prince will be assassinated. Every timeline says he dies. Can you change fate before it happens?',
  ));
  getRoots('development').forEach(root => setFieldValue(root, 'origin-story-title-input', 'Ashes of the Ninth Meridian'));

  // Catalog children remain invisible until their parent family is opened.
  getRoots('development').forEach(root => clickByText(root, 'button', /^Fate & Destiny/));
  await wait(80);
  getRoots('development').forEach(root => clickByText(root, 'button', /^\+ death flags$/));
  getRoots('development').forEach(root => clickByText(root, 'button', /^Politics & War/));
  await wait(80);
  getRoots('development').forEach(root => clickByText(root, 'button', /^\+ sect politics$/));

  // World Identity
  await selectSection(/^World Identity$/);
  getRoots('development').forEach(root => {
    setFieldValue(root, 'world-type-input', 'Ancient sect world with a collapsing celestial court');
    setFieldValue(root, 'society-structure-input', 'Sect-led feudal hierarchy');
    setFieldValue(root, 'starting-location-input', 'Outer sect labor quarry inside a volcanic rift.');
  });

  // Characters (main character + one additional character)
  await selectSection(/^Characters$/);
  getRoots('development').forEach(root => {
    setFieldValue(root, 'a11y-control-7b2mqtu', 'Ye Chen');
    setFieldValue(root, 'mc-starting-identity-input', 'Crippled young master');
    setFieldValue(root, 'mc-personality-input', 'Ruthless but protective, chaotic neutral');
    setFieldValue(root, 'mc-secret-advantage-input', 'Foreknowledge of seven doomed timelines');
    setFieldValue(root, 'mc-starting-weakness-input', 'Destroyed meridians');
    setFieldValue(
      root,
      'mc-bio-input',
      'Born as the son of a fallen patriarch, carrying the blood of a Primordial dragon, extremely lazy but protective.',
    );
  });
  await wait(80);
  getRoots('development').forEach(root => clickByText(root, 'button', /\+ Add Character/));
  await wait(80);
  getRoots('development').forEach(root => setFieldValue(root, 'a11y-control-boqy7nd', 'Elder Qin'));

  // Factions
  await selectSection(/^Factions$/);
  getRoots('development').forEach(root => clickByText(root, 'button', /\+ Add Faction/));
  await wait(80);
  getRoots('development').forEach(root => setFieldValue(root, 'a11y-control-xhc59yh', 'Heavenly Sword Sect'));

  // Abilities
  await selectSection(/^Abilities$/);
  getRoots('development').forEach(root => setFieldValue(root, 'a11y-control-itgsjgw', 'Qi Condensation Tier 1'));

  // Power System
  await selectSection(/^Power System$/);
  getRoots('development').forEach(root => setFieldValue(root, 'a11y-control-kytc0oh', 'Martial arts, Daoist'));

  // ARC combines plot direction with the story's intended destination.
  await selectSection(/^ARC$/);
  getRoots('development').forEach(root => {
    (root.querySelector('[id="arc-face-slap-high"]') as HTMLElement | null)?.click();
    (root.querySelector('[id="arc-plot-armor-low"]') as HTMLElement | null)?.click();
    (root.querySelector('[id="arc-recognition-high"]') as HTMLElement | null)?.click();
    setFieldValue(root, 'a11y-control-jolpc3b', 'Shatter the fated assassination timeline');
    setFieldValue(root, 'a11y-control-6a6tmbf', 'Sect tournament that reveals the first assassination attempt');
    setFieldValue(root, 'destined-ending-input', 'The prince survives and severs the celestial court from fate.');
  });

  // Land back on Origin.
  await selectSection(/^Origin/);
}

export function StorySeedWorkspace() {
  const entry = workshopEntries.find(e => e.id === 'story-seed')!;
  const [activeState, setActiveState] = useState<PreviewState>('empty-intake');
  const [activeCategory, setActiveCategory] = useState<PreviewCategory>('intake');
  const currentUser = useAppStore(state => state.currentUser);

  const applyScenario = useCallback((stateId: PreviewState) => {
    const scenario = scenarios.find(s => s.id === stateId)!;
    setActiveState(stateId);
    setMockLocalOnlyMode(scenario.localOnlyMode ?? true);
    resetMockState({
      currentUser: scenario.signedIn ? { uid: MOCK_USER_ID } : null,
      activeAgentId: scenario.activeAgentId ?? null,
    });
    resetMockSeeds(scenario.seedLibrary === 'populated' ? createMockSeedLibrary() : []);
    resetStorySeedRepository(scenario.seedLibrary === 'populated' ? createMockStorySeedLibrary() : []);
  }, []);

  useEffect(() => {
    // Deep-link support: `?preview=story-seed&state=<scenario-id>` opens the
    // workspace directly in a given preview state (used for inspection and
    // screenshot verification).
    const requested = new URLSearchParams(window.location.search).get('state') as PreviewState | null;
    const initial = requested && scenarios.some(s => s.id === requested) ? requested : 'empty-intake';
    applyScenario(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After the panes remount for a scenario, drive its real UI action.
  useEffect(() => {
    const scenario = scenarios.find(s => s.id === activeState);
    if (!scenario?.uiAction) return;
    let cancelled = false;
    (async () => {
      await wait(220);
      if (cancelled) return;
      if (scenario.uiAction === 'open-import-panel') {
        getRoots('reference').forEach(root => clickByText(root, 'button', /Import (?:World Seed \/ Blueprint|Story Seed)/));
        getRoots('development').forEach(root => clickByText(root, 'button', /^Import$/));
      } else if (scenario.uiAction === 'open-library') {
        getRoots('development').forEach(root => clickByText(root, 'button', /^My Seeds$/));
      } else if (scenario.uiAction === 'use-first-seed') {
        getRoots('development').forEach(root => clickByText(root, 'button', /^My Seeds$/));
        await wait(150);
        getRoots('reference').forEach(root => clickByText(root, 'button', /^Use Seed$/));
        getRoots('development').forEach(root => clickByText(root, 'button', /^Use Seed$/));
      } else if (scenario.uiAction === 'fill-intake') {
        await runReferenceFillScenario();
        await runDevelopmentFillScenario();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeState]);

  const activeScenario = scenarios.find(s => s.id === activeState);

  const chamberProps = {
    isGenerating: Boolean(activeScenario?.isGenerating),
    error: null as string | null,
    onGenerateBlueprint: async (payload: unknown) => {
      console.log('[Preview] onGenerateBlueprint called with Story Seed', payload);
      await wait(300);
      return createMockBlueprint();
    },
    onStartStory: async (payload: unknown) => {
      console.log('[Preview] onStartStory called', payload);
    },
  };

  const buttonBase =
    'min-h-[2.75rem] rounded-lg border text-xs leading-snug transition-all duration-200';
  const buttonTone = (active: boolean) =>
    active
      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100 font-medium'
      : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10';
  const stateButton = (active: boolean) =>
    `${buttonBase} ${buttonTone(active)} w-full px-3 py-2 text-left break-words hyphens-auto`;

  const stateList = (category: PreviewCategory) => (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {scenariosInCategory(category).map(scenario => (
        <button
          key={scenario.id}
          type="button"
          onClick={() => applyScenario(scenario.id)}
          className={stateButton(activeState === scenario.id)}
        >
          {scenario.label}
        </button>
      ))}
    </div>
  );

  const controls = (
    <div className="w-full min-w-0 max-w-6xl space-y-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md sm:p-4">
      <div>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/70">
          Preview States
        </h2>
        <div
          role="tablist"
          aria-label="Preview control categories"
          className="grid grid-cols-4 gap-1.5 rounded-xl border border-white/10 bg-black/25 p-1.5 sm:max-w-md"
        >
          {PREVIEW_CATEGORIES.map(category => (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`min-h-[2.75rem] rounded-lg px-1.5 py-1 text-center text-xs font-medium leading-tight tracking-wide transition-all duration-150 ${
                activeCategory === category.id
                  ? 'border border-cyan-400/60 bg-cyan-500/25 font-semibold text-cyan-100'
                  : 'border border-transparent text-white/55 hover:bg-white/10 hover:text-white/85'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {stateList(activeCategory)}

      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
        {currentUser ? `Mock account: ${currentUser.uid}` : 'Mock account: signed out'}
        {activeScenario && activeScenario.category !== activeCategory && (
          <> · Active state · {activeScenario.label}</>
        )}
      </p>
    </div>
  );

  return (
    <FeatureWorkspace
      entry={entry}
      controls={controls}
      allowCompare
      renderReference={() => (
        <div key={`reference-${activeState}`} data-story-seed-pane="reference" className="min-h-screen bg-void py-10 px-4">
          <ReferenceCreationModal {...chamberProps} />
        </div>
      )}
      renderDevelopment={() => (
        <div key={`development-${activeState}`} data-story-seed-pane="development" className="min-h-screen bg-void py-10 px-4">
          <DevelopmentCreationModal {...chamberProps} />
        </div>
      )}
    />
  );
}

export default StorySeedWorkspace;
