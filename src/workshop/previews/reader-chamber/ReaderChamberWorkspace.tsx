import React, { useCallback, useEffect, useState } from 'react';
import ReferenceReaderChamber from '../../../components/reader-chamber/reference/ReaderChamber';
import DevelopmentReaderChamber from '../../../components/reader-chamber/development/ReaderChamber';
import type {
  ReaderPreferences,
  UpdateStoryFields,
} from '../../../components/reader-chamber/shared/types';
import {
  resetMockState,
  updateMockStory,
  useAppStore,
} from '../../../components/reader-chamber/shared/stubs';
import { DEFAULT_READER_TYPOGRAPHY } from '../../../components/reader-chamber/shared/readerTypography';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';
import {
  ARC_TITLE,
  CURRENT_POWER_STAGE,
  createMockStory,
  mockReaderPreferences,
  MOCK_STORY_ID,
} from './previewData';
import {
  PARTICLE_INTENSITIES,
  READER_THEMES,
  scenarios,
  PreviewState,
} from './previewStates';
import '../../../components/reader-chamber/shared/reader-chamber.css';

type ReaderTab = 'reader' | 'codex' | 'memory';

/** Workshop-only placeholder shown when the in-chamber tab bar switches away
 *  from the reader. The Codex menu system is a separate future Workshop job. */
function CodexTabPlaceholder({ tab, onBack }: { tab: ReaderTab; onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-md rounded-xl border border-dashed border-cyan-500/40 bg-cyan-950/10 p-8 text-center">
        <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-200/60">
          Workshop placeholder — not production UI
        </p>
        <h3 className="font-display text-lg text-signal">
          Codex menu system — separate Workshop job
        </h3>
        <p className="mt-2 text-sm text-neutral-400">
          The “{tab}” tab is intentionally excluded from the Reader Chamber replica
          (no CodexHovercard, no codex highlighting, no codex sheets). The tab bar
          itself is faithful and functional.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-full border border-portal/50 px-5 py-2 text-xs font-sc uppercase tracking-widest text-portal transition-colors hover:bg-portal hover:text-void"
        >
          Back to Reader
        </button>
      </div>
    </div>
  );
}

function PreviewCanvas({ children }: { children: React.ReactElement }) {
  const [activeTab, setActiveTab] = useState<ReaderTab>('reader');
  const chamber = React.cloneElement(children, {
    onSwitchTab: (tab: ReaderTab) => setActiveTab(tab),
  } as Partial<unknown>);
  return (
    <div className="relative">
      {activeTab === 'reader' ? (
        chamber
      ) : (
        <CodexTabPlaceholder tab={activeTab} onBack={() => setActiveTab('reader')} />
      )}
    </div>
  );
}

/** Click real in-chamber buttons by their accessible label so preview states
 *  drive the production interaction path (toggles, drawers, modals). Both
 *  panes render `id="reader-chamber-root"`, so in Compare mode this reaches
 *  the reference and development chambers alike. */
function clickInChamber(predicate: (button: HTMLButtonElement) => boolean) {
  document
    .querySelectorAll<HTMLButtonElement>('#reader-chamber-root button')
    .forEach((button) => {
      if (predicate(button)) button.click();
    });
}

export function ReaderChamberWorkspace() {
  const entry = workshopEntries.find((e) => e.id === 'reader-chamber')!;
  const [activeState, setActiveState] = useState<PreviewState>('reading');
  const [selectedChapterNum, setSelectedChapterNum] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const activeStory = useAppStore((s) => s.stories[0]);

  // Boot the mock store with a fresh story.
  useEffect(() => {
    resetMockState({ stories: [createMockStory()], activeStoryId: MOCK_STORY_ID });
  }, []);

  const applyScenario = useCallback((stateId: PreviewState) => {
    const scenario = scenarios.find((s) => s.id === stateId)!;
    setActiveState(stateId);
    setSelectedChapterNum(scenario.chapter);
    setIsGenerating(Boolean(scenario.isGenerating));
    resetMockState({
      stories: [createMockStory()],
      activeStoryId: MOCK_STORY_ID,
      isTranslating: Boolean(scenario.isTranslating),
      isReaderFullscreen: Boolean(scenario.isReaderFullscreen),
      cinematicScrollState: scenario.cinematicScrollState ?? 'idle',
    });
  }, []);

  // After the chambers remount for a scenario, drive its UI action (open the
  // Reader Settings panel, the bookmarks drawer, the Alter Fate modal, or start
  // the Seal flow that surfaces the Continuity Guard warning).
  useEffect(() => {
    const scenario = scenarios.find((s) => s.id === activeState);
    if (!scenario?.uiAction) return;
    const timer = setTimeout(() => {
      if (scenario.uiAction === 'preferences') {
        clickInChamber((b) => b.getAttribute('aria-label') === 'Reader Settings');
      } else if (scenario.uiAction === 'bookmarks') {
        // The Comments button reuses the Chronicle Anchors drawer for now.
        clickInChamber((b) => b.getAttribute('aria-label') === 'Comments');
      } else if (scenario.uiAction === 'alter-fate') {
        // Alter Fate lives in the header Quick Action menu — open it first
        // (discrete click updates flush synchronously, so the menu item is
        // clickable immediately after).
        clickInChamber((b) => b.getAttribute('aria-label') === 'Quick Actions');
        clickInChamber((b) => (b.getAttribute('aria-label') || '').includes('Alter Fate'));
      } else if (scenario.uiAction === 'seal') {
        clickInChamber((b) => /Seal Chapter|^Publish$/.test(b.textContent?.trim() ?? ''));
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [activeState]);

  const updateStoryFields: UpdateStoryFields = useCallback(
    (storyId, updates, options) =>
      useAppStore.getState().updateStory(storyId, updates, options),
    [],
  );

  const patchReaderPreferences = useCallback(
    (patch: Partial<ReaderPreferences>) => {
      void updateStoryFields(MOCK_STORY_ID, (current) => ({
        readerPreferences: {
          ...mockReaderPreferences,
          ...DEFAULT_READER_TYPOGRAPHY,
          ...current.readerPreferences,
          ...patch,
        },
      }));
    },
    [updateStoryFields],
  );

  if (!activeStory) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/40">
        Preparing mock story…
      </div>
    );
  }

  const chapters = activeStory.arcs[0]?.chapters ?? [];
  const currentTheme = activeStory.readerPreferences?.themeOverride ?? 'void';
  const currentParticles = activeStory.readerPreferences?.particleIntensity ?? 'default';

  const chamberProps = {
    chapters,
    currentPowerStage: CURRENT_POWER_STAGE,
    onGenerateChapter: async (chapterNumber: number) => {
      console.log(`[Preview] Generate chapter ${chapterNumber}`);
    },
    onGenerateNextFiveChapters: async (fromChapterNumber: number) => {
      console.log(`[Preview] Generate next five chapters from ${fromChapterNumber}`);
    },
    isGenerating,
    selectedChapterNum,
    setSelectedChapterNum,
    onToggleRead: (chapterNumber: number) => {
      updateMockStory(MOCK_STORY_ID, (current) => ({
        arcs: current.arcs.map((arc) => ({
          ...arc,
          chapters: arc.chapters.map((c) =>
            c.number === chapterNumber
              ? { ...c, status: (c.status === 'read' ? 'unread' : 'read') as typeof c.status }
              : c,
          ),
        })),
      }));
    },
    arcTitle: ARC_TITLE,
    onSwitchTab: undefined as ((tab: ReaderTab) => void) | undefined,
    activeStory,
    updateStoryFields,
    handleAlterFate: async (chapterNumber: number, direction: string, customPrompt: string) => {
      console.log('[Preview] Alter Fate', { chapterNumber, direction, customPrompt });
    },
    handleSealChapter: async (chapterNumber: number) => {
      updateMockStory(MOCK_STORY_ID, (current) => ({
        arcs: current.arcs.map((arc) => ({
          ...arc,
          chapters: arc.chapters.map((c) =>
            c.number === chapterNumber ? { ...c, isSealed: true, sealedAt: Date.now() } : c,
          ),
        })),
      }));
    },
    handleCheckConsistency: async (chapterNumber: number) => {
      console.log(`[Preview] Consistency check for chapter ${chapterNumber}`);
      return [
        'Elder Kang is recorded as deceased in the Codex (Chapter 0) but speaks three lines of dialogue in this chapter.',
        'The Ashen Sword is described as “unbroken” here; the Codex records it shattered in the Prologue.',
      ];
    },
  };

  const controlButton = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border ${
      active
        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-100'
        : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'
    }`;

  const controls = (
    <div className="max-w-6xl space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div>
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/70">
          Preview States
        </h2>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => applyScenario(scenario.id)}
              className={controlButton(activeState === scenario.id)}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Chapter</span>
          {chapters.map((c) => (
            <button
              key={c.number}
              type="button"
              onClick={() => setSelectedChapterNum(c.number)}
              className={controlButton(selectedChapterNum === c.number)}
            >
              {c.number}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Theme</span>
          {READER_THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => patchReaderPreferences({ themeOverride: theme })}
              className={controlButton(currentTheme === theme)}
            >
              {theme}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Particles</span>
          {PARTICLE_INTENSITIES.map((intensity) => (
            <button
              key={intensity}
              type="button"
              onClick={() => patchReaderPreferences({ particleIntensity: intensity })}
              className={controlButton(currentParticles === intensity)}
            >
              {intensity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <FeatureWorkspace
      entry={entry}
      controls={controls}
      allowCompare
      renderReference={() => (
        <PreviewCanvas key={`reference-${activeState}`}>
          <ReferenceReaderChamber {...chamberProps} />
        </PreviewCanvas>
      )}
      renderDevelopment={() => (
        <PreviewCanvas key={`development-${activeState}`}>
          <DevelopmentReaderChamber {...chamberProps} />
        </PreviewCanvas>
      )}
    />
  );
}

export default ReaderChamberWorkspace;
