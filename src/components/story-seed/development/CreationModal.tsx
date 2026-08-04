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
import { OriginWorkspace } from './workspaces/OriginWorkspace';
import { ArcWorkspace } from './workspaces/ArcWorkspace';
import { WorldIdentityWorkspace } from './workspaces/WorldIdentityWorkspace';
import { CharactersWorkspace } from './workspaces/CharactersWorkspace';
import { FactionsWorkspace } from './workspaces/FactionsWorkspace';
import { AbilitiesWorkspace } from './workspaces/AbilitiesWorkspace';
import { PowerSystemWorkspace } from './workspaces/PowerSystemWorkspace';

import { ImportPanel } from './ImportPanel';
import { LibraryHeaderBadge } from './library';
import { LibraryButton } from '../../library';
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
  const [activeSection, setActiveSection] = useState<SeedSectionId>('origin');
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
      case 'origin': return <OriginWorkspace {...workspaceProps} />;
      case 'arc': return <ArcWorkspace {...workspaceProps} />;
      case 'world-identity': return <WorldIdentityWorkspace {...workspaceProps} />;
      case 'characters': return <CharactersWorkspace {...workspaceProps} />;
      case 'factions': return <FactionsWorkspace {...workspaceProps} />;
      case 'abilities': return <AbilitiesWorkspace {...workspaceProps} />;
      case 'power-system': return <PowerSystemWorkspace {...workspaceProps} />;
    }
  };

  const accountSignedIn = !LOCAL_ONLY_MODE && Boolean(currentUser);

  return (
    <div className="mx-auto max-w-7xl pb-24" id="creation-portal-root">
      {/* Header — wraps on narrow screens so the action buttons drop to a
          second row instead of overflowing the viewport. */}
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        {/* S emblem doubles as the home button — back to the main page. */}
        <LibraryHeaderBadge
          title="Story Seed"
          subtitle="Grow Your Universe"
          emblemSrc={CELESTIAL_LIBRARY_EMBLEM_URL}
          emblemAlt="Celestial Library"
          emblemHref="/"
          emblemLinkLabel="Return to Workshop home"
        />

        {/* Save Draft is never gated on creative completeness — a draft exists
            to preserve progress. Seed import/library/export stay plain,
            always-visible actions rather than a hidden overflow menu. */}
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 pt-1">
          <LibraryButton
            onClick={handleSaveDraft}
            disabled={isGenerating}
            title="Save this Story Seed draft"
            icon={savedFeedback ? Check : Bookmark}
          >
            <span className="hidden sm:inline">{savedFeedback ? 'Saved' : 'Save Draft'}</span>
            <span className="sm:hidden">{savedFeedback ? 'Saved' : 'Save'}</span>
          </LibraryButton>

          <div className="flex items-center gap-1">
            <LibraryButton
              variant="ghost"
              size="sm"
              onClick={() => setShowImportPanel(open => !open)}
              icon={Copy}
            >
              Import
            </LibraryButton>
            {accountSignedIn && (
              <LibraryButton
                variant="ghost"
                size="sm"
                onClick={() => setShowLibrary(open => !open)}
                icon={Database}
              >
                My Seeds
              </LibraryButton>
            )}
            {accountSignedIn && savedSeeds.length > 0 && (
              <LibraryButton
                variant="ghost"
                size="sm"
                onClick={handleExportAllSeeds}
                icon={Download}
              >
                Export All
              </LibraryButton>
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
              <LibraryButton
                onClick={() => setSelectorOpen(true)}
                icon={List}
                className="lg:hidden"
              >
                Sections
              </LibraryButton>

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

              <LibraryButton
                variant="primary"
                size="lg"
                onClick={handleGenerateBlueprintClick}
                disabled={!canGenerate}
                loading={isGenerating}
                // While VERSA drafts, its mark replaces the generic spinner.
                loadingIndicator={activeAgentId === 'versa' ? (
                  <img src={AGENTS.VERSA.logoUrl} className="h-5 w-5 shrink-0 animate-pulse object-contain" alt="" aria-hidden="true" />
                ) : undefined}
                title={missing.length > 0 ? `Missing required: ${missing.map(section => section.label).join(', ')}` : 'Generate the World Blueprint'}
                className="shrink-0"
              >
                {isGenerating ? (
                  <span>{activeAgentId === 'versa' ? 'VERSA is drafting...' : 'Generating...'}</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">Forge World Blueprint</span>
                    <span className="sm:hidden">Forge</span>
                  </>
                )}
              </LibraryButton>
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
                <LibraryButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectorOpen(false)}
                  aria-label="Close sections"
                  icon={X}
                />
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
