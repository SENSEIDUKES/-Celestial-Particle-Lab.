import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, Check, Copy, Database, Download, Ellipsis, List, X } from 'lucide-react';
import { IntakeData, WorldBlueprint } from '../shared/types';
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
} from '../shared/storySeedRepository';
import {
  buildBlueprintGenerationPayload,
  buildInitialStoryGenerationPayload,
  createStorySeedInput,
  DEFAULT_STORY_STYLE,
  storySeedToBlueprint,
  storySeedToIntake,
  validateStorySeedInput,
  type BlueprintGenerationPayload,
  type InitialStoryGenerationPayload,
  type StorySeedInput,
  type StorySeedRecord,
} from '../shared/storySeedSchema';
import { createStoryAdministrativeMetadata } from '../shared/storyAdministrativeMetadata';
import StoryAuthGate, { STORY_AUTH_DISSOLVE_MS } from './StoryAuthGate';

// Phase 2 creation workspace
import {
  getSeedSection,
  missingRequiredSections,
  REQUIRED_STORY_SECTIONS,
  type SeedSectionId,
} from './seedSections';
import { StorySeedSelector } from './StorySeedSelector';
import { StorySeedSummary } from './StorySeedSummary';
import { StoryTagsWorkspace } from './workspaces/StoryTagsWorkspace';
import { PremiseWorkspace } from './workspaces/PremiseWorkspace';
import { GenreWorkspace } from './workspaces/GenreWorkspace';
import { StyleWorkspace } from './workspaces/StyleWorkspace';
import { StorySettingsWorkspace } from './workspaces/StorySettingsWorkspace';
import { WorldIdentityWorkspace } from './workspaces/WorldIdentityWorkspace';
import { CharactersWorkspace } from './workspaces/CharactersWorkspace';
import { FactionsWorkspace } from './workspaces/FactionsWorkspace';
import { AbilitiesWorkspace } from './workspaces/AbilitiesWorkspace';
import { PowerSystemWorkspace } from './workspaces/PowerSystemWorkspace';
import { DestinedEndingWorkspace } from './workspaces/DestinedEndingWorkspace';
import { OtherWorldSettingsWorkspace } from './workspaces/OtherWorldSettingsWorkspace';

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

const createDefaultIntake = (): IntakeData => ({
  creatorPenName: '',
  novelTitle: '',
  mcName: '',
  genrePath: '',
  corePremise: '',
  proseStyle: DEFAULT_STORY_STYLE,
  desiredPlotDirection: '',
  storyTags: [],
  worldType: '',
  startingLocation: '',
  societyStructure: '',
  dangerLevel: '',
  generalAtmosphere: '',
  universeOverview: '',
  majorMysteries: '',
  startingIdentity: '',
  personality: '',
  mainFlaw: '',
  secretAdvantage: '',
  startingWeakness: '',
  moralAlignment: '',
  mcBio: '',
  customCharacters: [],
  customFactions: [],
  startingPowerConcept: '',
  powerFlavor: '',
  powerPace: '',
  knownRanks: '',
  uniquePath: '',
  longTermGoal: '',
  firstMajorConflict: '',
  mainAntagonistPressure: '',
  romanceLevel: '',
  faceSlappingLevel: '',
  comedyLevel: '',
  tournamentArcPreference: '',
  haremPreference: '',
  betrayalLevel: '',
  thingsToAvoid: '',
  mustIncludeElements: '',
  fatePressure: 'Balanced',
  makeItWorkInstruction: '',
});

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

  // Phase 2 workspace state
  const [activeSection, setActiveSection] = useState<SeedSectionId>('story-tags');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const savedFeedbackTimer = useRef<number | null>(null);

  const [intake, setIntake] = useState<IntakeData>(createDefaultIntake);

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

  const updateIntake = (field: keyof IntakeData, value: any) => {
    // Accepts either a plain value or an updater `(previous) => next` so
    // rapid successive edits (e.g. toggling two tags in one task) can never
    // lose a write to a stale render closure.
    setIntake(prev => ({ ...prev, [field]: typeof value === 'function' ? value(prev[field]) : value }));
  };

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

  const rememberSeed = (seed: StorySeedRecord) => {
    setCurrentSeed(seed);
    setSavedSeeds(previous => [seed, ...previous.filter(item => item.id !== seed.id)]);
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

  const handleSaveDraft = async () => {
    const seedInput = createStorySeedInput(intake);
    const validation = validateStorySeedInput(seedInput);
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
        ...previous.filter(seed => !imported.some(item => item.id === seed.id)),
      ]);
      setCurrentSeed(imported[0]);
    } else {
      setCurrentSeed(null);
    }
    const selected = imported[0] || payloads[0];
    setIntake({ ...createDefaultIntake(), ...storySeedToIntake(selected) });
    setBlueprint(storySeedToBlueprint(selected));
    setStage('blueprint');
    setShowImportPanel(false);
    setSeedError(null);
  };

  const handleUseSeed = (seed: StorySeedRecord) => {
    setCurrentSeed(seed);
    setIntake({ ...createDefaultIntake(), ...storySeedToIntake(seed) });
    setBlueprint(storySeedToBlueprint(seed));
    setStage('blueprint');
    setSeedError(null);
  };

  const handleGenerateBlueprintClick = async () => {
    if (isGenerating || selectIsGenerating(useAppStore.getState())) return;
    const seedInput = createStorySeedInput(intake);
    const validation = validateStorySeedInput(seedInput);
    if (!validation.valid) {
      setSeedError(validation.errors.join(' '));
      return;
    }
    try {
      const bp = await onGenerateBlueprint(buildBlueprintGenerationPayload(seedInput));
      setBlueprint(bp);
      setStage('blueprint');
      try {
        await persistSeed(createStorySeedInput(intake, bp));
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
      const seedInput = createStorySeedInput(intake, cleanBlueprint);
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
    if (!blueprint) return;
    const payload = createStorySeedInput(intake, blueprint);
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

  const handleExportSavedSeed = (seed: StorySeedRecord) => {
    void downloadStorySeed(seed).catch(downloadError => {
      console.error('Failed to export saved story seed:', downloadError);
      setSeedError('The seed could not be exported. Please try again.');
    });
  };

  const handleExportAllSeeds = () => {
    void downloadStorySeedCollection(savedSeeds).catch(downloadError => {
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

  const missing = missingRequiredSections(intake);
  const requiredComplete = REQUIRED_STORY_SECTIONS.length - missing.length;
  const canGenerate = missing.length === 0 && !isGenerating;
  const workspaceProps = { intake, updateIntake };

  const renderWorkspace = () => {
    switch (activeSection) {
      case 'story-tags': return <StoryTagsWorkspace {...workspaceProps} />;
      case 'premise': return <PremiseWorkspace {...workspaceProps} />;
      case 'genre': return <GenreWorkspace {...workspaceProps} />;
      case 'style': return <StyleWorkspace {...workspaceProps} />;
      case 'story-settings': return <StorySettingsWorkspace {...workspaceProps} />;
      case 'world-identity': return <WorldIdentityWorkspace {...workspaceProps} />;
      case 'characters': return <CharactersWorkspace {...workspaceProps} />;
      case 'factions': return <FactionsWorkspace {...workspaceProps} />;
      case 'abilities': return <AbilitiesWorkspace {...workspaceProps} />;
      case 'power-system': return <PowerSystemWorkspace {...workspaceProps} />;
      case 'destined-ending': return <DestinedEndingWorkspace {...workspaceProps} />;
      case 'other-world-settings': return <OtherWorldSettingsWorkspace {...workspaceProps} />;
    }
  };

  const activeSeedSection = getSeedSection(activeSection);
  const accountSignedIn = !LOCAL_ONLY_MODE && Boolean(currentUser);

  return (
    <div className="mx-auto max-w-7xl pb-24" id="creation-portal-root">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={CELESTIAL_LIBRARY_EMBLEM_URL}
            alt="Celestial Library"
            referrerPolicy="no-referrer"
            className="h-12 w-12 rounded-full object-cover ring-1 ring-gold-accent/40 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          />
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-[0.08em] text-signal">
              Story Seed
            </h1>
            <p className="mt-1 font-sans font-light text-sm text-neutral-400">
              Plant the vision. We&rsquo;ll grow the universe.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={missing.length > 0 || isGenerating}
            title={missing.length > 0 ? `Missing required: ${missing.map(section => section.label).join(', ')}` : 'Save this Story Seed draft'}
            className="inline-flex min-h-[2.5rem] items-center gap-2 rounded border border-neutral-800 bg-neutral-950 px-3.5 py-2 font-sc text-[11px] font-bold uppercase tracking-widest text-neutral-200 transition-all hover:border-portal/60 hover:text-portal disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            {savedFeedback ? <Check size={13} className="text-portal" /> : <Bookmark size={13} />}
            <span className="hidden sm:inline">{savedFeedback ? 'Saved' : 'Save Draft'}</span>
            <span className="sm:hidden">{savedFeedback ? 'Saved' : 'Save'}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Story Seed actions"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
              className="inline-flex min-h-[2.5rem] items-center justify-center rounded border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-neutral-400 transition-all hover:border-neutral-600 hover:text-signal"
            >
              <Ellipsis size={16} />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-40 cursor-default bg-transparent"
                />
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-neutral-800 bg-neutral-950 p-1.5 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => { setShowImportPanel(open => !open); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-sans text-xs text-neutral-300 transition-colors hover:bg-white/5 hover:text-signal"
                  >
                    <Copy size={13} className="text-portal" />
                    Import Story Seed
                  </button>
                  {accountSignedIn && (
                    <button
                      type="button"
                      onClick={() => { setShowLibrary(open => !open); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-sans text-xs text-neutral-300 transition-colors hover:bg-white/5 hover:text-signal"
                    >
                      <Database size={13} className="text-portal" />
                      My Story Seeds
                    </button>
                  )}
                  {accountSignedIn && (
                    <button
                      type="button"
                      onClick={() => { handleExportAllSeeds(); setMenuOpen(false); }}
                      disabled={savedSeeds.length === 0}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-sans text-xs text-neutral-300 transition-colors hover:bg-white/5 hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Download size={13} className="text-portal" />
                      Export All Seeds
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Creator — near the top, deliberately quieter than the required Story inputs */}
      <div className="mt-8 flex items-center gap-3 rounded-xl border border-neutral-900/70 bg-neutral-950/40 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="creator-pen-name-input" className="block font-sc text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Creator
          </label>
          <input
            id="creator-pen-name-input"
            type="text"
            value={intake.creatorPenName || ''}
            onChange={(e) => updateIntake('creatorPenName', e.target.value)}
            placeholder="Your name or pen name..."
            className="w-full bg-transparent pt-0.5 font-sans text-sm text-signal placeholder-neutral-600 focus:outline-none"
          />
        </div>
      </div>

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
            intake={intake}
            activeSection={activeSection}
            onSelect={setActiveSection}
            onPreview={() => setShowSummary(true)}
          />
        </aside>

        <div className="min-w-0">
          <main className="p-4 sm:p-8">
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
                      title={`${section.label}: ${section.isFilled(intake) ? 'complete' : 'missing'}`}
                      className={`h-1.5 w-1.5 rounded-full ${section.isFilled(intake) ? 'bg-portal' : 'bg-human/80'}`}
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
                  <span>Forge World Blueprint</span>
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

      <StorySeedSummary
        open={showSummary}
        intake={intake}
        onClose={() => setShowSummary(false)}
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
                intake={intake}
                activeSection={activeSection}
                onSelect={(id) => {
                  setActiveSection(id);
                  setSelectorOpen(false);
                }}
                onPreview={() => {
                  setSelectorOpen(false);
                  setShowSummary(true);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
