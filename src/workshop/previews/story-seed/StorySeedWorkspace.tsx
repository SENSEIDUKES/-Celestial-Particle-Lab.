import React, { useCallback, useEffect, useState } from 'react';
import ReferenceCreationModal from '../../../components/story-seed/reference/CreationModal';
import DevelopmentCreationModal from '../../../components/story-seed/development/CreationModal';
import {
  resetMockSeeds,
  resetMockState,
  setMockLocalOnlyMode,
  useAppStore,
} from '../../../components/story-seed/shared/stubs';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';
import { createMockBlueprint, createMockSeedLibrary, MOCK_USER_ID } from './previewData';
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
// `clickInChamber` drove its preview states. Both mounted panes (`reference`
// and `development`) share the same literal DOM ids, so every helper below
// operates on all `#creation-portal-root` instances at once — otherwise only
// whichever pane happens first in DOM order would react.

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function forEachRoot(callback: (root: Element) => void) {
  document.querySelectorAll('[id="creation-portal-root"]').forEach(callback);
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

/** Fills a representative sample across every intake FormSection through the
 *  real form controls: text fields directly, accordion sections by clicking
 *  their header (only one section renders its body at a time), tag presets
 *  and "+ Add Character/Faction" by clicking the actual buttons. */
async function runFillIntakeScenario() {
  forEachRoot(root => {
    setFieldValue(root, 'a11y-control-v2xlbs8', 'Ashes of the Ninth Meridian');
    setFieldValue(root, 'a11y-control-7b2mqtu', 'Ye Chen');
    setFieldValue(
      root,
      'core-premise-input',
      'In seven chapters, the prince will be assassinated. Every timeline says he dies. Can you change fate before it happens?',
    );
  });
  await wait(80);
  forEachRoot(root => {
    clickByText(root, 'button', /^\+ death flags$/);
    clickByText(root, 'button', /^\+ sect politics$/);
  });

  await wait(80);
  forEachRoot(root => clickByText(root, 'button', /2\. World Setting/));
  await wait(120);
  forEachRoot(root => {
    setFieldValue(root, 'world-type-input', 'Ancient sect world with a collapsing celestial court');
    setFieldValue(root, 'society-structure-input', 'Sect-led feudal hierarchy');
    setFieldValue(root, 'danger-level-input', 'Cutthroat, grimdark, mystical');
    setFieldValue(root, 'starting-location-input', 'Outer sect labor quarry inside a volcanic rift.');
  });

  await wait(80);
  forEachRoot(root => clickByText(root, 'button', /3\. Main Character Setup/));
  await wait(120);
  forEachRoot(root => {
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
  forEachRoot(root => clickByText(root, 'button', /3\.5\. Character Intake/));
  await wait(120);
  forEachRoot(root => clickByText(root, 'button', /\+ Add Character/));
  await wait(80);
  forEachRoot(root => setFieldValue(root, 'a11y-control-boqy7nd', 'Elder Qin'));

  await wait(80);
  forEachRoot(root => clickByText(root, 'button', /3\.8\. Faction\/Sect Intake/));
  await wait(120);
  forEachRoot(root => clickByText(root, 'button', /\+ Add Faction/));
  await wait(80);
  forEachRoot(root => setFieldValue(root, 'a11y-control-xhc59yh', 'Heavenly Sword Sect'));

  await wait(80);
  forEachRoot(root => clickByText(root, 'button', /4\. Power System Seed/));
  await wait(120);
  forEachRoot(root => {
    setFieldValue(root, 'a11y-control-itgsjgw', 'Qi Condensation Tier 1');
    setFieldValue(root, 'a11y-control-kytc0oh', 'Martial arts, Daoist');
  });

  await wait(80);
  forEachRoot(root => clickByText(root, 'button', /5\. Plot & Trope Control/));
  await wait(120);
  forEachRoot(root => {
    setFieldValue(root, 'a11y-control-jolpc3b', 'Shatter the fated assassination timeline');
    setFieldValue(root, 'a11y-control-6a6tmbf', 'Sect tournament that reveals the first assassination attempt');
  });

  await wait(80);
  forEachRoot(root => clickByText(root, 'button', /1\. Core Seed/));
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
  }, []);

  useEffect(() => {
    applyScenario('empty-intake');
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
        forEachRoot(root => clickByText(root, 'button', /Import World Seed \/ Blueprint/));
      } else if (scenario.uiAction === 'use-first-seed') {
        forEachRoot(root => clickByText(root, 'button', /^Use Seed$/));
      } else if (scenario.uiAction === 'fill-intake') {
        await runFillIntakeScenario();
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
    onGenerateBlueprint: async () => {
      console.log('[Preview] onGenerateBlueprint called — returning canned WorldBlueprint');
      await wait(300);
      return createMockBlueprint();
    },
    onStartStory: async (...args: unknown[]) => {
      console.log('[Preview] onStartStory called', args);
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
        <div key={`reference-${activeState}`} className="min-h-screen bg-void py-10 px-4">
          <ReferenceCreationModal {...chamberProps} />
        </div>
      )}
      renderDevelopment={() => (
        <div key={`development-${activeState}`} className="min-h-screen bg-void py-10 px-4">
          <DevelopmentCreationModal {...chamberProps} />
        </div>
      )}
    />
  );
}

export default StorySeedWorkspace;
