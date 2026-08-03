import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, Check, Copy, Database, Download, List, X } from 'lucide-react';
import { WorldBlueprint } from '../shared/types';
import { generateUUID } from '../shared/id';
import {
  AGENTS,
  LOCAL_ONLY_MODE,
  selectIsGenerating,
  useAppStore,
} from '../shared/stubs';
import {
  createStorySeed,
  importStorySeeds,
  listStorySeeds,
  updateStorySeed,
  type StorySeedRecord,
} from '../shared/storySeedRepository';
import {
  applyInferredStoryTags,
  buildBlueprintGenerationPayload,
  buildInitialStoryGenerationPayload,
  createBlueprintDraftFromSeed,
  createEmptyStorySeedInput,
  normalizeStorySeedInput,
  validateStorySeedDraft,
  validateStorySeedInput,
  type BlueprintGenerationPayload,
  type InitialStoryGenerationPayload,
  type StorySeedInput,
} from '../shared/storySeedSchema';
import { createStoryAdministrativeMetadata } from '../shared/storyAdministrativeMetadata';
import StoryAuthGate, { STORY_AUTH_DISSOLVE_MS } from './StoryAuthGate';

// Creation workspace
import {
  missingRequiredSections,
  REQUIRED_STORY_SECTIONS,
  type SeedSectionId,
} from './seedSections';
import type { SeedUpdate } from './seedState';
import { StorySeedSelector } from './StorySeedSelector';
import { StoryTagsWorkspace } from './workspaces/StoryTagsWorkspace';
import { PremiseWorkspace } from './workspaces/PremiseWorkspace';
import { GenreWorkspace } from './workspaces/GenreWorkspace';
import { StyleWorkspace } from './workspaces/StyleWorkspace';
import { PlotTropesWorkspace } from './workspaces/PlotTropesWorkspace';
import { WorldIdentityWorkspace } from './workspaces/WorldIdentityWorkspace';
import { CharactersWorkspace } from './workspaces/CharactersWorkspace';
import { FactionsWorkspace } from './workspaces/FactionsWorkspace';
import { AbilitiesWorkspace } from './workspaces/AbilitiesWorkspace';
import { PowerSystemWorkspace } from './workspaces/PowerSystemWorkspace';
import { DestinedEndingWorkspace } from './workspaces/DestinedEndingWorkspace';

import { ImportPanel } from './ImportPanel';
import { BlueprintReview } from './BlueprintReview';
import { SeedLibraryPanel } from './SeedLibraryPanel';
import { downloadStorySeed, downloadStorySeedCollection } from '../shared/storySeedSerialization';

interface CreationModalProps {
  onStartStory: (payload: InitialStoryGenerationPayload) => Promise<void>;
  onGenerateBlueprint: (payload: BlueprintGenerationPayload) => Promise<WorldBlueprint>;
  isGenerating: boolean;
  error: string | null;
}

/** Same public Library emblem the StoryAuthGate uses (kept for visual identity). */
const CELESTIAL_LIBRARY_EMBLEM_URL =
  'https://pub-e482c2dbbb984c3c87ecdd8ae3a92183.r2.dev/LIBRARY/images/CELESTIAL%20LIBRARY%20ICON.jpg';

/**
 * Stable local namespace for Workshop draft saves when no account is signed
 * in (the Workshop repository is local-storage backed). On transfer to
 * Light-Novels, gate draft saving on real auth exactly like persistSeed.
 */
const LOCAL_CREATOR_ID = 'local-workshop-creator';

export default function CreationModal({ onStartStory, onGenerateBlueprint, isGenerating: isGeneratingProp, error }: CreationModalProps) {
  const storeIsGenerating = useAppStore(selectIsGenerating);
    const activeAgentId = useAppStore(state => state.activeAgentId);
    const currentUser = useAppStore(state => state.currentUser);
  const seedReferenceSignature = useAppStore(state => state.stories
    .map(story => `${story.id}:${story.sourceSeedId || ''}`)
    .join('|'));
  const isGenerating = isGeneratingProp || storeIsGenerating;
  const [stage, setStage] = useState<'intake' | 'blueprint'>('intake');
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [blueprint, setBlueprint] = useState<WorldBlueprint | null>(null);
  const [currentSeed, setCurrentSeed] = useState<StorySeedRecord | null>(null);
  const [savedSeeds, setSavedSeeds] = useState<StorySeedRecord[]>([]);
  const [isLoadingSeeds, setIsLoadingSeeds] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [chapterCount] = useState(10);
  const [authDissolving, setAuthDissolving] = useState(false);
  const wasAuthRef = useRef(false);

  // Creation workspace state
  const [activeSection, setActiveSection] = useState<SeedSectionId>('style');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const savedFeedbackTimer = useRef<number | null>(null);

  // The workspace edits the canonical Story Seed directly — there is no
  // separate flat view model between the form and the contract any more.
  const [seed, setSeed] = useState<StorySeedInput>(createEmptyStorySeedInput);

  useEffect(() => {
    if (LOCAL_ONLY_MODE || !currentUser) {
      setSavedSeeds([]);
      setCurrentSeed(null);
      return;
    }
    const expectedUid = currentUser.uid;
    let cancelled = false;
    setIsLoadingSeeds(true);
    setSeedError(null);
    listStorySeeds(expectedUid)
      .then(seeds => {
        if (!cancelled && useAppStore.getState().currentUser?.uid === expectedUid) setSavedSeeds(seeds);
      })
      .catch(error => {
        if (!cancelled && useAppStore.getState().currentUser?.uid === expectedUid) {
          console.error('Failed to load account story seeds:', error);
          setSeedError('Your saved story seeds could not be loaded.');
        }
      })
      .finally(() => {
        if (!cancelled && useAppStore.getState().currentUser?.uid === expectedUid) setIsLoadingSeeds(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser, seedReferenceSignature]);

  // Always a functional update, so rapid successive edits (e.g. toggling two
  // tags in one task) can never lose a write to a stale render closure.
  const updateSeed = (update: SeedUpdate) => setSeed(update);

  // Post-auth visual transition: once a gated guest signs in, keep the gate
  // mounted for STORY_AUTH_DISSOLVE_MS so StoryAuthGate's shell can dissolve
  // over the still-visible backdrop before the intake is revealed.
  useEffect(() => {
    if (LOCAL_ONLY_MODE) return;
    if (!currentUser) {
      wasAuthRef.current = true;
      return;
    }
    if (!wasAuthRef.current) return;
    wasAuthRef.current = false;
    setAuthDissolving(true);
    const timer = setTimeout(() => setAuthDissolving(false), STORY_AUTH_DISSOLVE_MS);
    return () => clearTimeout(timer);
  }, [currentUser]);

  const rememberSeed = (record: StorySeedRecord) => {
    setCurrentSeed(record);
    setSavedSeeds(previous => [record, ...previous.filter(item => item.id !== record.id)]);
  };

  const persistSeed = async (payload: StorySeedInput): Promise<StorySeedRecord | null> => {
    if (LOCAL_ONLY_MODE) return null;
    if (!currentUser) throw new Error('Sign in to save this story seed to your account.');
    const saved = currentSeed
      ? await updateStorySeed(currentUser.uid, currentSeed, payload)
      : await createStorySeed(currentUser.uid, payload);
    rememberSeed(saved);
    return saved;
  };

  /**
   * Draft saving deliberately uses draft validation only: an incomplete seed
   * is exactly what a draft is for. Premise, Genre, Style, and Story Tags may
   * all be empty and the current progress is still preserved.
   */
  const handleSaveDraft = async () => {
    const seedInput = seed;
    const validation = validateStorySeedDraft(seedInput);
    if (!validation.valid) {
      setSeedError(validation.errors.join(' '));
      return;
    }
    try {
      const userId = currentUser?.uid || LOCAL_CREATOR_ID;
      const saved = currentSeed && currentSeed.userId === userId
        ? await updateStorySeed(userId, currentSeed, seedInput)
        : await createStorySeed(userId, seedInput);
      setCurrentSeed(saved);
      if (currentUser) {
        setSavedSeeds(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
      }
      setSeedError(null);
      setSavedFeedback(true);
      if (savedFeedbackTimer.current) window.clearTimeout(savedFeedbackTimer.current);
      savedFeedbackTimer.current = window.setTimeout(() => setSavedFeedback(false), 2500);
    } catch (draftError) {
      console.error('Failed to save story seed draft:', draftError);
      setSeedError('The draft could not be saved. Please try again.');
    }
  };

  const handleImport = async (payloads: StorySeedInput[]) => {
    if (payloads.length === 0) return;
    const imported = LOCAL_ONLY_MODE || !currentUser ? [] : await importStorySeeds(currentUser.uid, payloads);
    if (imported.length > 0) {
      setSavedSeeds(previous => [
        ...imported,
        ...previous.filter(record => !imported.some(item => item.id === record.id)),
      ]);
      setCurrentSeed(imported[0]);
    } else {
      setCurrentSeed(null);
    }
    const selected = imported[0]?.seed || payloads[0];
    setSeed(normalizeStorySeedInput(selected));
    setBlueprint(createBlueprintDraftFromSeed(selected));
    setStage('blueprint');
    setShowImportPanel(false);
    setSeedError(null);
  };

  const handleUseSeed = (record: StorySeedRecord) => {
    setCurrentSeed(record);
    setSeed(normalizeStorySeedInput(record.seed));
    setBlueprint(createBlueprintDraftFromSeed(record.seed));
    setStage('blueprint');
    setSeedError(null);
  };

  /**
   * All four required Story inputs must be present to generate. Story Tags
   * never block a creator, though: an empty set is inferred from Premise,
   * Genre, and Style, written back into the workspace so the creator sees it,
   * and saved with the seed.
   */
  const handleGenerateBlueprintClick = async () => {
    if (isGenerating || selectIsGenerating(useAppStore.getState())) return;
    // Story Tags are filled by inference first, so only Style, Genre, and
    // Premise can ever leave the seed short of generation readiness.
    const seedInput = applyInferredStoryTags(normalizeStorySeedInput(seed));
    const validation = validateStorySeedInput(seedInput);
    if (!validation.valid) {
      setSeedError(validation.errors.join(' '));
      return;
    }
    // Write the inferred tags back so the creator sees exactly what is saved.
    if (seed.story.required.storyTags.length === 0) setSeed(seedInput);
    try {
      const bp = await onGenerateBlueprint(buildBlueprintGenerationPayload(seedInput));
      setBlueprint(bp);
      setStage('blueprint');
      try {
        await persistSeed(seedInput);
        setSeedError(null);
      } catch (seedSaveError) {
        console.error('Failed to save generated story seed:', seedSaveError);
        setSeedError('The blueprint was generated, but its account seed was not saved. Retry before starting the story.');
      }
    } catch (err) {
      // Error handled in parent
    }
  };

  const handleStartStoryClick = async () => {
    if (isGenerating || selectIsGenerating(useAppStore.getState())) return;
    if (!blueprint) return;
    const cleanBlueprint = {
      ...blueprint,
      majorFactions: (blueprint.majorFactions || []).map(f => f.trim()).filter(Boolean),
      initialCharacters: (blueprint.initialCharacters || []).map(f => f.trim()).filter(Boolean),
      majorMysteries: (blueprint.majorMysteries || []).map(f => f.trim()).filter(Boolean),
      unresolvedPlotThreads: (blueprint.unresolvedPlotThreads || []).map(f => f.trim()).filter(Boolean),
    };
    try {
      const seedInput = applyInferredStoryTags(normalizeStorySeedInput(seed));
      const savedSeed = await persistSeed(seedInput);
      if (!LOCAL_ONLY_MODE && !savedSeed) return;
      const sourceSeedId = savedSeed?.id || currentSeed?.id || `local-seed-${generateUUID()}`;
      const administrative = createStoryAdministrativeMetadata({
        storyId: `story-${generateUUID()}`,
        creatorId: currentUser?.uid || LOCAL_CREATOR_ID,
        sourceSeedId,
        originalLanguage: 'en',
      });
      setSeedError(null);
      await onStartStory(buildInitialStoryGenerationPayload(
        seedInput,
        administrative,
        cleanBlueprint,
        chapterCount,
      ));
    } catch (seedSaveError) {
      console.error('Failed to persist source story seed:', seedSaveError);
      setSeedError('The story was not started because its source seed could not be saved to your account.');
    }
  };

  const handleExportCurrentSeed = () => {
    const payload = normalizeStorySeedInput(seed);
    // Start sharing immediately so iOS Safari retains the user gesture needed
    // to present Save to Files. Persistence can finish independently.
    setSeedError(null);
    void downloadStorySeed(payload).catch(downloadError => {
      console.error('Failed to export story seed:', downloadError);
      setSeedError('The seed could not be exported. Please try again.');
    });
    void persistSeed(payload).catch(seedSaveError => {
      console.error('Failed to save seed while exporting:', seedSaveError);
      setSeedError('The seed was exported, but its account copy could not be saved.');
    });
  };

  const handleExportSavedSeed = (record: StorySeedRecord) => {
    void downloadStorySeed(record.seed).catch(downloadError => {
      console.error('Failed to export saved story seed:', downloadError);
      setSeedError('The seed could not be exported. Please try again.');
    });
  };

  const handleExportAllSeeds = () => {
    void downloadStorySeedCollection(savedSeeds.map(record => record.seed)).catch(downloadError => {
      console.error('Failed to export account story seeds:', downloadError);
      setSeedError('Your seeds could not be exported. Please try again.');
    });
  };

  if ((!currentUser || authDissolving) && !LOCAL_ONLY_MODE) {
    return <StoryAuthGate />;
  }

  if (stage === 'blueprint' && blueprint) {
    return (
      <>
        {seedError && (
          <div className="mx-auto mb-5 max-w-4xl rounded border border-red-900 bg-red-950/30 p-3 text-center font-sans text-xs text-red-200" role="alert">
            {seedError}
          </div>
        )}
        <BlueprintReview
          blueprint={blueprint}
          setBlueprint={setBlueprint}
          onBack={() => setStage('intake')}
          onStartStory={handleStartStoryClick}
          onExportSeed={handleExportCurrentSeed}
          isGenerating={isGenerating}
        />
      </>
    );
  }

  const missing = missingRequiredSections(seed);
  const requiredComplete = REQUIRED_STORY_SECTIONS.length - missing.length;
  const canGenerate = missing.length === 0 && !isGenerating;
  const workspaceProps = { seed, updateSeed };

  const renderWorkspace = () => {
    switch (activeSection) {
      case 'premise': return <PremiseWorkspace {...workspaceProps} />;
      case 'genre': return <GenreWorkspace {...workspaceProps} />;
      case 'style': return <StyleWorkspace {...workspaceProps} />;
      case 'story-tags': return <StoryTagsWorkspace {...workspaceProps} />;
      case 'plot-tropes': return <PlotTropesWorkspace {...workspaceProps} />;
      case 'world-identity': return <WorldIdentityWorkspace {...workspaceProps} />;
      case 'characters': return <CharactersWorkspace {...workspaceProps} />;
      case 'factions': return <FactionsWorkspace {...workspaceProps} />;
      case 'abilities': return <AbilitiesWorkspace {...workspaceProps} />;
      case 'power-system': return <PowerSystemWorkspace {...workspaceProps} />;
      case 'destined-ending': return <DestinedEndingWorkspace {...workspaceProps} />;
    }
  };

  const accountSignedIn = !LOCAL_ONLY_MODE && Boolean(currentUser);

  return (
    <div className="mx-auto max-w-7xl pb-24" id="creation-portal-root">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* S emblem doubles as the home button — back to the main page. */}
          <a
            href="/"
            title="Story Seed home"
            aria-label="Story Seed home"
            className="group shrink-0 rounded-full"
          >
            <img
              src={CELESTIAL_LIBRARY_EMBLEM_URL}
              alt="Celestial Library"
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-full object-cover ring-1 ring-gold-accent/60 shadow-[0_0_18px_rgba(212,175,55,0.5),0_0_48px_rgba(212,175,55,0.28)] transition-shadow duration-300 group-hover:shadow-[0_0_28px_rgba(212,175,55,0.75),0_0_72px_rgba(212,175,55,0.4)]"
            />
          </a>
          <div className="rounded-xl border border-gold-accent/40 bg-neutral-950/70 px-5 py-3 shadow-[inset_0_1px_0_rgba(212,175,55,0.15),0_0_24px_rgba(212,175,55,0.12)]">
            <h1 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-[0.08em] text-signal">
              Story Seed
            </h1>
            <p className="mt-1 font-sc text-[11px] font-bold uppercase tracking-[0.3em] text-gold-accent/80">
              Grow The Universe
            </p>
          </div>
        </div>

        {/* Save Draft is never gated on creative completeness — a draft exists
            to preserve progress. Seed import/library/export stay plain,
            always-visible actions rather than a hidden overflow menu. */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 pt-1">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isGenerating}
            title="Save this Story Seed draft"
            className="inline-flex min-h-[2.5rem] items-center gap-2 rounded border border-neutral-800 bg-neutral-950 px-3.5 py-2 font-sc text-[11px] font-bold uppercase tracking-widest text-neutral-200 transition-all hover:border-portal/60 hover:text-portal disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            {savedFeedback ? <Check size={13} className="text-portal" /> : <Bookmark size={13} />}
            <span className="hidden sm:inline">{savedFeedback ? 'Saved' : 'Save Draft'}</span>
            <span className="sm:hidden">{savedFeedback ? 'Saved' : 'Save'}</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowImportPanel(open => !open)}
              className="inline-flex items-center gap-1.5 font-sans text-xs text-neutral-500 transition-colors hover:text-portal"
            >
              <Copy size={12} />
              Import
            </button>
            {accountSignedIn && (
              <button
                type="button"
                onClick={() => setShowLibrary(open => !open)}
                className="inline-flex items-center gap-1.5 font-sans text-xs text-neutral-500 transition-colors hover:text-portal"
              >
                <Database size={12} />
                My Seeds
              </button>
            )}
            {accountSignedIn && savedSeeds.length > 0 && (
              <button
                type="button"
                onClick={handleExportAllSeeds}
                className="inline-flex items-center gap-1.5 font-sans text-xs text-neutral-500 transition-colors hover:text-portal"
              >
                <Download size={12} />
                Export All
              </button>
            )}
          </div>
        </div>
      </header>

      {accountSignedIn && showLibrary && (
        <div className="mt-6">
          <SeedLibraryPanel
            seeds={savedSeeds}
            isLoading={isLoadingSeeds}
            onUse={handleUseSeed}
            onExport={handleExportSavedSeed}
            onExportAll={handleExportAllSeeds}
          />
        </div>
      )}

      {(seedError || error) && (
        <div className="mt-6 rounded border border-red-900 bg-red-950/30 p-3 text-center font-sans text-xs text-red-200" role="alert">
          {seedError || error}
        </div>
      )}

      {/* Two-panel creation workspace */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-900/80 bg-neutral-950/30 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-neutral-900/70 p-5 lg:block">
          <StorySeedSelector
            seed={seed}
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
        </aside>

        <div className="relative min-w-0">
          {/* Restrained celestial ambience the glass fields float over —
              gradients only, no blur, so mobile scrolling stays cheap. */}
          <div aria-hidden="true" className="seed-workspace-ambience" />
          <main className="relative p-4 sm:p-8">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderWorkspace()}
            </motion.div>
          </main>

          {/* Action bar — required tracking + generation */}
          <div className="sticky bottom-0 z-30 border-t border-neutral-900/80 bg-black/85 px-4 py-3.5 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectorOpen(true)}
                className="inline-flex min-h-[2.5rem] items-center gap-2 rounded border border-neutral-800 bg-neutral-950 px-3.5 py-2 font-sc text-[11px] font-bold uppercase tracking-widest text-neutral-300 transition-colors hover:border-portal/50 hover:text-portal lg:hidden"
              >
                <List size={14} />
                Sections
              </button>

              <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
                <div className="flex shrink-0 items-center gap-1.5" aria-label={`${requiredComplete} of ${REQUIRED_STORY_SECTIONS.length} required Story inputs complete`}>
                  {REQUIRED_STORY_SECTIONS.map(section => (
                    <span
                      key={section.id}
                      title={`${section.label}: ${section.isFilled(seed) ? 'complete' : 'missing'}`}
                      className={`h-1.5 w-1.5 rounded-full ${section.isFilled(seed) ? 'bg-portal' : 'bg-human/80'}`}
                    />
                  ))}
                </div>
                <p className="truncate font-sans text-xs text-neutral-500">
                  {missing.length > 0
                    ? `Missing required: ${missing.map(section => section.label).join(', ')}`
                    : 'All required Story inputs complete'}
                </p>
              </div>
              <p className="flex-1 font-sans text-xs text-neutral-500 sm:hidden">
                {requiredComplete}/{REQUIRED_STORY_SECTIONS.length} required
              </p>

              <button
                type="button"
                onClick={handleGenerateBlueprintClick}
                disabled={!canGenerate}
                title={missing.length > 0 ? `Missing required: ${missing.map(section => section.label).join(', ')}` : 'Generate the World Blueprint'}
                className="inline-flex min-h-[2.75rem] shrink-0 cursor-pointer items-center gap-2 rounded border border-human bg-human px-4 py-2.5 font-sc text-xs font-bold uppercase tracking-widest text-signal shadow-[0_0_15px_rgba(139,0,0,0.3)] transition-all hover:bg-void hover:text-human disabled:pointer-events-none disabled:opacity-50 sm:px-6"
              >
                {isGenerating ? (
                  <>
                    {activeAgentId === 'versa' ? (
                      <img src={AGENTS.VERSA.logoUrl} className="h-5 w-5 animate-pulse object-contain" alt="VERSA" />
                    ) : (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="h-4 w-4 rounded-full border-2 border-neutral-400 border-t-transparent" />
                    )}
                    <span>{activeAgentId === 'versa' ? 'VERSA is drafting...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Forge World Blueprint</span>
                    <span className="sm:hidden">Forge</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center font-sans text-[11px] leading-relaxed text-neutral-600">
        Every empty field will be intelligently extrapolated using Chinese light-novel logic.
        A World Blueprint is generated for your review before the story begins.
      </p>

      <ImportPanel
        show={showImportPanel}
        onClose={() => setShowImportPanel(false)}
        onImport={handleImport}
      />

      {/* Mobile section drawer */}
      <AnimatePresence>
        {selectorOpen && (
          <div className="fixed inset-0 z-[250] lg:hidden" key="seed-selector-drawer">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectorOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-label="Story Seed sections"
              className="absolute inset-y-0 left-0 w-[86%] max-w-xs overflow-y-auto border-r border-neutral-800 bg-neutral-950 p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-sc text-xs font-bold uppercase tracking-widest text-neutral-400">
                  Story Seed Sections
                </p>
                <button
                  type="button"
                  onClick={() => setSelectorOpen(false)}
                  aria-label="Close sections"
                  className="rounded-full border border-neutral-800 p-1.5 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-signal"
                >
                  <X size={14} />
                </button>
              </div>
              <StorySeedSelector
                seed={seed}
                activeSection={activeSection}
                onSelect={(id) => {
                  setActiveSection(id);
                  setSelectorOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
