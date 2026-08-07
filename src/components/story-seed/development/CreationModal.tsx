import React, { useEffect, useRef, useState } from 'react';
import './story-seed.css';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bookmark, Check, CircleHelp, CircleUserRound, Copy, Database, Download, List, Settings, X } from 'lucide-react';
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
  type StorySeedArtifact,
  type StorySeedRecord,
} from '../shared/storySeedRepository';
import {
  applyInferredStoryTags,
  buildBlueprintGenerationPayload,
  buildInitialStoryGenerationPayload,
  createBlueprintDraftFromSeed,
  createEmptyStorySeedInput,
  normalizeStorySeedInput,
  normalizeWorldBlueprint,
  validateStorySeedDraft,
  validateStorySeedInput,
  type BlueprintGenerationPayload,
  type InitialStoryGenerationPayload,
  type StorySeedFateVisibility,
  type StorySeedInput,
  type StorySeedSurvivalPressure,
} from '../shared/storySeedSchema';
import { createStoryAdministrativeMetadata } from '../shared/storyAdministrativeMetadata';
import StoryAuthGate, { STORY_AUTH_DISSOLVE_MS } from './StoryAuthGate';

// Creation workspace
import {
  missingRequiredSections,
  REQUIRED_STORY_SECTIONS,
  type SeedSectionId,
} from './seedSections';
import { patchFateSurvival, setIntendedForMatureAudiences, type SeedUpdate } from './seedState';
import {
  buildStorySeedDrawerSections,
  storySeedDrawerProfile,
  StorySeedSelector,
} from './StorySeedSelector';
import { OriginWorkspace } from './workspaces/OriginWorkspace';
import { ArcWorkspace } from './workspaces/ArcWorkspace';
import { WorldIdentityWorkspace } from './workspaces/WorldIdentityWorkspace';
import { CharactersWorkspace } from './workspaces/CharactersWorkspace';
import { FactionsWorkspace } from './workspaces/FactionsWorkspace';
import { AbilitiesWorkspace } from './workspaces/AbilitiesWorkspace';
import { PowerSystemWorkspace } from './workspaces/PowerSystemWorkspace';

import { ImportPanel } from './ImportPanel';
import {
  LibraryBottomNavigation,
  type LibraryBottomNavigationItem,
  LibraryButton,
  LibraryHeaderBadge,
  LibraryNavigationDrawer,
  LibraryPanel,
  ManifestButton,
} from '../../library';
import { BlueprintReview } from './BlueprintReview';
import { SeedLibraryPanel } from './SeedLibraryPanel';
import { StorySeedHelpMenu } from './StorySeedHelpMenu';
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

interface MatureAudienceSettingProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const FATE_VISIBILITY_OPTIONS: Array<{
  value: StorySeedFateVisibility;
  label: string;
  description: string;
}> = [
  {
    value: 'full',
    label: 'Full Fate',
    description: 'Show threats, clues, countdowns, targets, and likely consequences.',
  },
  {
    value: 'partial',
    label: 'Partial Fate',
    description: 'Reveal some signs, but leave parts for you to interpret.',
  },
  {
    value: 'none',
    label: 'No Fate',
    description: 'Hide most guidance. You’ll mainly see warnings, scars, clues, and consequences.',
  },
];

const SURVIVAL_PRESSURE_OPTIONS: Array<{
  value: StorySeedSurvivalPressure;
  label: string;
  description: string;
}> = [
  {
    value: 'heaven',
    label: 'Heaven',
    description: 'Strong pressure. Major threats can challenge the Destined Ending.',
  },
  {
    value: 'immortal',
    label: 'Immortal',
    description: 'Balanced pressure. Fate matters without taking over the whole story.',
  },
  {
    value: 'mortal',
    label: 'Mortal',
    description: 'Light pressure. The original story path has more room to continue.',
  },
];

interface FateSurvivalSettingProps {
  settings: StorySeedInput['story']['optional']['fateSurvival'];
  onChange: (patch: Partial<StorySeedInput['story']['optional']['fateSurvival']>) => void;
}

const FateSurvivalSetting = ({ settings, onChange }: FateSurvivalSettingProps) => {
  const optionGroup = <T extends StorySeedFateVisibility | StorySeedSurvivalPressure>(
    title: string,
    subtitle: string,
    value: T,
    options: Array<{ value: T; label: string; description: string }>,
    onSelect: (value: T) => void,
  ) => (
    <div className="space-y-2">
      <div>
        <p className="font-sc text-[11px] font-bold uppercase tracking-[0.16em] text-signal">{title}</p>
        <p className="mt-1 font-sans text-[11px] leading-relaxed text-neutral-500">{subtitle}</p>
      </div>
      <div className="grid gap-2">
        {options.map(option => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-xl border p-3 text-left transition-colors ${selected
                ? 'border-portal/60 bg-portal/10 text-signal shadow-[0_0_24px_rgba(34,211,238,0.08)]'
                : 'border-neutral-800/80 bg-black/20 text-neutral-400 hover:border-neutral-700 hover:text-signal'
              }`}
            >
              <span className="block font-sc text-[11px] font-bold uppercase tracking-[0.12em]">{option.label}</span>
              <span className="mt-1 block font-sans text-[11px] leading-relaxed text-neutral-500">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="space-y-4 rounded-xl border border-neutral-800/80 bg-[#080b17]/80 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <span className="min-w-0">
          <span className="block font-sc text-xs font-semibold tracking-wide text-signal">Fate Survival</span>
          <span className="mt-1 block font-sans text-[11px] leading-relaxed text-neutral-500">
            Turn the story into a living timeline where the world pushes back.
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          aria-label="Fate Survival"
          onClick={() => onChange({ enabled: !settings.enabled })}
          className={`flex w-full shrink-0 items-center justify-between gap-2 rounded-full border px-3 py-2 transition-colors sm:w-auto sm:px-2.5 sm:py-1.5 ${settings.enabled
            ? 'border-portal/60 bg-portal/10 text-portal'
            : 'border-neutral-700 bg-black/30 text-neutral-400 hover:border-neutral-600 hover:text-signal'
          }`}
        >
          <span className="font-sc text-[10px] font-bold uppercase tracking-[0.12em]">Fate Survival</span>
          <span aria-hidden="true" className={`relative h-4 w-7 rounded-full transition-colors ${settings.enabled ? 'bg-portal/70' : 'bg-neutral-700'}`}>
            <span className={`absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${settings.enabled ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
          </span>
        </button>
      </div>

      {settings.enabled && (
        <div className="space-y-4 border-t border-neutral-800/70 pt-4">
          {optionGroup('Fate Visibility', 'Controls how much the Library reveals.', settings.visibility, FATE_VISIBILITY_OPTIONS, visibility => onChange({ visibility }))}
          {optionGroup('Survival Pressure', 'Controls how hard the story pushes back.', settings.pressure, SURVIVAL_PRESSURE_OPTIONS, pressure => onChange({ pressure }))}
        </div>
      )}
    </section>
  );
};

const MatureAudienceSetting = ({ checked, onChange }: MatureAudienceSettingProps) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800/80 bg-[#080b17]/80 p-3">
    <span className="min-w-0">
      <span className="block font-sc text-xs font-semibold tracking-wide text-signal">
        Intended for mature audiences
      </span>
      <span className="mt-1 block font-sans text-[11px] leading-relaxed text-neutral-500">
        Story metadata for mature themes. This does not request explicit content.
      </span>
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Rated 18+"
      onClick={() => onChange(!checked)}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1.5 transition-colors ${checked
        ? 'border-gold-accent/60 bg-gold-accent/10 text-gold-accent'
        : 'border-neutral-700 bg-black/30 text-neutral-400 hover:border-neutral-600 hover:text-signal'
      }`}
    >
      <span className="font-sc text-[10px] font-bold uppercase tracking-[0.12em]">Rated 18+</span>
      <span
        aria-hidden="true"
        className={`relative h-4 w-7 rounded-full transition-colors ${checked ? 'bg-gold-accent/70' : 'bg-neutral-700'}`}
      >
        <span
          className={`absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`}
        />
      </span>
    </button>
  </div>
);

export default function CreationModal({ onStartStory, onGenerateBlueprint, isGenerating: isGeneratingProp, error }: CreationModalProps) {
  const storeIsGenerating = useAppStore(selectIsGenerating);
  const activeAgentId = useAppStore(state => state.activeAgentId);
  const currentUser = useAppStore(state => state.currentUser);
  const seedOwnerId = currentUser?.uid || (LOCAL_ONLY_MODE ? LOCAL_CREATOR_ID : null);
  const equippedRelicTitle = useAppStore(state => {
    const storyMaker = state.routingConfig.storyMaker;
    return typeof storyMaker?.equippedRelicTitle === 'string'
      ? storyMaker.equippedRelicTitle
      : null;
  });
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
  const previousSeedOwnerIdRef = useRef<string | null>(seedOwnerId);
  const seedOwnerIdRef = useRef<string | null>(seedOwnerId);
  const currentSeedRef = useRef<StorySeedRecord | null>(null);
  const persistRequestIdRef = useRef(0);
  seedOwnerIdRef.current = seedOwnerId;

  // Creation workspace state
  const [activeSection, setActiveSection] = useState<SeedSectionId>('origin');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [desktopSettingsOpen, setDesktopSettingsOpen] = useState(false);
  const desktopSettingsRef = useRef<HTMLDivElement>(null);
  const savedFeedbackTimer = useRef<number | null>(null);
  // Mobile bottom-navigation sheets: Settings carries the seed utility
  // actions moved out of the header; Profile is a placeholder sheet.
  const [mobileSheet, setMobileSheet] = useState<'settings' | 'profile' | null>(null);
  // The `?` Help menu — one clean home for section guidance, opened from the
  // bottom navigation on mobile and the header Help button on desktop.
  const [helpOpen, setHelpOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // The workspace edits the canonical Story Seed directly — there is no
  // separate flat view model between the form and the contract any more.
  const [seed, setSeed] = useState<StorySeedInput>(createEmptyStorySeedInput);

  const setActiveSeed = (record: StorySeedRecord | null) => {
    currentSeedRef.current = record;
    setCurrentSeed(record);
  };

  useEffect(() => {
    const ownerChanged = previousSeedOwnerIdRef.current !== seedOwnerId;
    previousSeedOwnerIdRef.current = seedOwnerId;
    if (ownerChanged) {
      setSavedSeeds([]);
      setActiveSeed(null);
      setSeed(createEmptyStorySeedInput());
      setBlueprint(null);
    }
    if (!seedOwnerId) {
      setSavedSeeds([]);
      setActiveSeed(null);
      return;
    }
    let cancelled = false;
    setIsLoadingSeeds(true);
    setSeedError(null);
    listStorySeeds(seedOwnerId)
      .then(seeds => {
        if (!cancelled) setSavedSeeds(seeds);
      })
      .catch(error => {
        if (!cancelled) {
          console.error('Failed to load account story seeds:', error);
          setSeedError('Your saved story seeds could not be loaded.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSeeds(false);
      });
    return () => {
      cancelled = true;
    };
  }, [seedOwnerId, seedReferenceSignature]);

  // Always a functional update, so rapid successive edits (e.g. toggling two
  // tags in one task) can never lose a write to a stale render closure.
  const updateSeed = (update: SeedUpdate) => setSeed(update);
  const updateBlueprint = (update: React.SetStateAction<WorldBlueprint>) => {
    setBlueprint(current => {
      if (!current) return current;
      return typeof update === 'function' ? update(current) : update;
    });
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

  // Mobile sheet behavior mirrors the navigation drawer: Escape closes and
  // body scroll locks while the sheet is open.
  useEffect(() => {
    if (!mobileSheet) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileSheet(null);
    };
    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [mobileSheet]);

  useEffect(() => {
    if (!desktopSettingsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDesktopSettingsOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!desktopSettingsRef.current?.contains(event.target as Node)) setDesktopSettingsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [desktopSettingsOpen]);

  const rememberSeed = (record: StorySeedRecord, makeCurrent = true) => {
    if (makeCurrent) setActiveSeed(record);
    setSavedSeeds(previous => [record, ...previous.filter(item => item.id !== record.id)]);
  };

  const blueprintContextForRecord = (record?: StorySeedRecord) => ({
    creator: currentUser?.displayName,
    createdAt: record?.createdAt,
    updatedAt: record?.updatedAt,
  });

  const persistSeed = async (
    payload: StorySeedInput,
    blueprintArtifact?: WorldBlueprint,
  ): Promise<StorySeedRecord | null> => {
    if (!seedOwnerId) throw new Error('Sign in to save this story seed to your account.');
    const ownerAtStart = seedOwnerId;
    const activeRecord = currentSeedRef.current;
    const requestId = ++persistRequestIdRef.current;
    const saved = activeRecord && activeRecord.userId === ownerAtStart
      ? await updateStorySeed(ownerAtStart, activeRecord, payload, blueprintArtifact)
      : await createStorySeed(seedOwnerId, payload, blueprintArtifact);
    const currentRecord = currentSeedRef.current;
    const stillActive = requestId === persistRequestIdRef.current
      && seedOwnerIdRef.current === ownerAtStart
      && (activeRecord ? currentRecord?.id === activeRecord.id : currentRecord === null);
    rememberSeed(saved, stillActive);
    if (saved.blueprint && stillActive) {
      // Persistence can be remote. Merge only trusted record metadata into
      // the latest state so edits made while this request was in flight are
      // never replaced by the older saved snapshot.
      setBlueprint(current => current ? {
        ...current,
        blueprintVersion: current.blueprintVersion || saved.blueprint?.blueprintVersion || 'v1.0',
        ...(currentUser?.displayName ? { creator: currentUser.displayName } : {}),
        createdAt: current.createdAt || saved.createdAt,
        updatedAt: saved.updatedAt,
      } : current);
    }
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
      const blueprintArtifact = blueprint
        ? normalizeWorldBlueprint(blueprint, seedInput, { creator: currentUser?.displayName })
        : undefined;
      const saved = await persistSeed(seedInput, blueprintArtifact);
      if (!saved) return;
      setSeedError(null);
      setSavedFeedback(true);
      if (savedFeedbackTimer.current) window.clearTimeout(savedFeedbackTimer.current);
      savedFeedbackTimer.current = window.setTimeout(() => setSavedFeedback(false), 2500);
    } catch (draftError) {
      console.error('Failed to save story seed draft:', draftError);
      setSeedError('The draft could not be saved. Please try again.');
    }
  };

  const handleImport = async (artifacts: StorySeedArtifact[]) => {
    if (artifacts.length === 0) return;
    const imported = seedOwnerId ? await importStorySeeds(seedOwnerId, artifacts) : [];
    if (imported.length > 0) {
      setSavedSeeds(previous => [
        ...imported,
        ...previous.filter(record => !imported.some(item => item.id === record.id)),
      ]);
      setActiveSeed(imported[0]);
    } else {
      setActiveSeed(null);
    }
    const selectedArtifact = imported[0] || artifacts[0];
    const selected = normalizeStorySeedInput(selectedArtifact.seed);
    setSeed(selected);
    setBlueprint(selectedArtifact.blueprint
      ? normalizeWorldBlueprint(
          selectedArtifact.blueprint,
          selected,
          imported[0]
            ? blueprintContextForRecord(imported[0])
            : { creator: currentUser?.displayName },
        )
      : createBlueprintDraftFromSeed(selected, { creator: currentUser?.displayName }));
    setStage('blueprint');
    setShowImportPanel(false);
    setSeedError(null);
  };

  const handleUseSeed = (record: StorySeedRecord) => {
    const selected = normalizeStorySeedInput(record.seed);
    setActiveSeed(record);
    setSeed(selected);
    setBlueprint(record.blueprint
      ? normalizeWorldBlueprint(record.blueprint, selected, blueprintContextForRecord(record))
      : createBlueprintDraftFromSeed(selected, { creator: currentUser?.displayName }));
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
      const generated = await onGenerateBlueprint(buildBlueprintGenerationPayload(seedInput));
      const bp = normalizeWorldBlueprint(generated, seedInput, {
        creator: currentUser?.displayName,
        preserveSourceMetadata: false,
      });
      setBlueprint(bp);
      setStage('blueprint');
      try {
        await persistSeed(seedInput, bp);
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
    try {
      const seedInput = applyInferredStoryTags(normalizeStorySeedInput(seed));
      const validation = validateStorySeedInput(seedInput);
      if (!validation.valid) {
        setSeedError(validation.errors.join(' '));
        return;
      }
      const normalizedBlueprint = normalizeWorldBlueprint(blueprint, seedInput, {
        ...blueprintContextForRecord(currentSeed || undefined),
      });
      const cleanBlueprint = {
        ...normalizedBlueprint,
        mcProfile: normalizedBlueprint.mainCharacter?.backgroundProfile || normalizedBlueprint.mcProfile,
        majorFactions: normalizedBlueprint.majorFactions.map(f => f.trim()).filter(Boolean),
        initialCharacters: normalizedBlueprint.initialCharacters.map(f => f.trim()).filter(Boolean),
        majorMysteries: normalizedBlueprint.majorMysteries.map(f => f.trim()).filter(Boolean),
        unresolvedPlotThreads: normalizedBlueprint.unresolvedPlotThreads.map(f => f.trim()).filter(Boolean),
      };
      const savedSeed = await persistSeed(seedInput, cleanBlueprint);
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
    const blueprintArtifact = blueprint
      ? normalizeWorldBlueprint(
          blueprint,
          payload,
          blueprintContextForRecord(currentSeed || undefined),
        )
      : undefined;
    // Start sharing immediately so iOS Safari retains the user gesture needed
    // to present Save to Files. Persistence can finish independently.
    setSeedError(null);
    void downloadStorySeed(payload, blueprintArtifact).catch(downloadError => {
      console.error('Failed to export story seed:', downloadError);
      setSeedError('The seed could not be exported. Please try again.');
    });
    void persistSeed(payload, blueprintArtifact).catch(seedSaveError => {
      console.error('Failed to save seed while exporting:', seedSaveError);
      setSeedError('The seed was exported, but its account copy could not be saved.');
    });
  };

  const handleExportSavedSeed = (record: StorySeedRecord) => {
    const blueprintArtifact = record.blueprint
      ? normalizeWorldBlueprint(record.blueprint, record.seed, blueprintContextForRecord(record))
      : undefined;
    void downloadStorySeed(record.seed, blueprintArtifact).catch(downloadError => {
      console.error('Failed to export saved story seed:', downloadError);
      setSeedError('The seed could not be exported. Please try again.');
    });
  };

  const handleExportAllSeeds = () => {
    void downloadStorySeedCollection(savedSeeds.map(record => ({
      seed: record.seed,
      ...(record.blueprint ? {
        blueprint: normalizeWorldBlueprint(
          record.blueprint,
          record.seed,
          blueprintContextForRecord(record),
        ),
      } : {}),
    }))).catch(downloadError => {
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
          setBlueprint={updateBlueprint}
          seed={seed}
          updateSeed={updateSeed}
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

  const seedLibraryAvailable = Boolean(seedOwnerId);

  // Mobile bottom navigation — Sections opens the existing section drawer,
  // Help opens the `?` guidance menu, Settings toggles the utility sheet
  // (Save Draft / Import / library), and Profile is a placeholder for the
  // future Library profile surface. The bar is presentational; it drives the
  // same state as the existing controls.
  const bottomNavItems: LibraryBottomNavigationItem[] = [
    {
      id: 'sections',
      label: 'Sections',
      icon: <List size={20} />,
      active: selectorOpen,
      onSelect: () => {
        setMobileSheet(null);
        setSelectorOpen(true);
      },
    },
    {
      id: 'help',
      label: 'Help',
      icon: <CircleHelp size={20} />,
      active: helpOpen,
      onSelect: () => {
        setMobileSheet(null);
        setHelpOpen(true);
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      active: mobileSheet === 'settings',
      onSelect: () => setMobileSheet(sheet => (sheet === 'settings' ? null : 'settings')),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <CircleUserRound size={20} />,
      active: mobileSheet === 'profile',
      onSelect: () => setMobileSheet(sheet => (sheet === 'profile' ? null : 'profile')),
    },
  ];

  return (
    // `pb-24` clears the sticky Manifest strip at the end of scroll; on mobile
    // the in-flow bottom navigation occupies that space instead.
    <div className="mx-auto max-w-7xl pb-24 max-lg:pb-0" id="creation-portal-root">
      {/* Header — wraps on narrow screens so the action buttons drop to a
          second row instead of overflowing the viewport. */}
      <header className="relative z-40 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
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
            to preserve progress. On mobile these utility actions move into
            the bottom navigation's Settings sheet; the desktop header keeps
            them as plain, always-visible actions. */}
        <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2 pt-1 max-lg:hidden">
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
            <div className="relative" ref={desktopSettingsRef}>
              <LibraryButton
                variant="ghost"
                size="sm"
                onClick={() => setDesktopSettingsOpen(open => !open)}
                icon={Settings}
                aria-expanded={desktopSettingsOpen}
                aria-haspopup="true"
              >
                Settings
              </LibraryButton>
              {desktopSettingsOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-[22rem] max-w-[calc(100vw-2rem)]"
                  role="region"
                  aria-label="Story Seed settings"
                >
                  <LibraryPanel padding="sm">
                    <MatureAudienceSetting
                      checked={seed.story.optional.intendedForMatureAudiences}
                      onChange={checked => updateSeed(setIntendedForMatureAudiences(checked))}
                    />
                    <FateSurvivalSetting
                      settings={seed.story.optional.fateSurvival}
                      onChange={patch => updateSeed(patchFateSurvival(patch))}
                    />
                  </LibraryPanel>
                </div>
              )}
            </div>
            <LibraryButton
              variant="ghost"
              size="sm"
              onClick={() => setShowImportPanel(open => !open)}
              icon={Copy}
            >
              Import
            </LibraryButton>
            {seedLibraryAvailable && (
              <LibraryButton
                variant="ghost"
                size="sm"
                onClick={() => setShowLibrary(open => !open)}
                icon={Database}
              >
                My Seeds
              </LibraryButton>
            )}
            {seedLibraryAvailable && savedSeeds.length > 0 && (
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

          {/* The `?` Help menu is a bottom-navigation destination on mobile;
              on desktop it lives here with the always-visible actions. */}
          <LibraryButton
            variant="ghost"
            size="sm"
            onClick={() => setHelpOpen(true)}
            icon={CircleHelp}
            title="Story Seed Help — guidance for every section"
          >
            Help
          </LibraryButton>
        </div>
      </header>

      {seedLibraryAvailable && showLibrary && (
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

      {/* Two-panel creation workspace — shelled in the Celestial Library
          glass panel; the action bar below is its footer strip. */}
      <LibraryPanel padding="none" className="mt-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-neutral-900/70 lg:block">
          <StorySeedSelector
            seed={seed}
            activeSection={activeSection}
            equippedTitle={equippedRelicTitle}
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

          {/* Action bar — required tracking + Manifest as the single primary
              action, rendered as the panel's footer strip (luminous top
              divider, translucent blur). Section navigation lives in the
              bottom navigation on mobile and the sidebar on desktop. On
              mobile the strip rests in flow at the panel bottom (sticky is
              off) so it always stays clear of the bottom navigation. */}
          <LibraryPanel variant="footer" padding="none" className="sticky max-lg:static z-30 px-4 py-3.5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="hidden min-w-0 flex-1 items-center gap-3 sm:flex">
                <div className="flex shrink-0 items-center gap-2" aria-label={`${requiredComplete} of ${REQUIRED_STORY_SECTIONS.length} required Story inputs complete`}>
                  {REQUIRED_STORY_SECTIONS.map(section => {
                    const filled = section.isFilled(seed);
                    return (
                      <span
                        key={section.id}
                        title={`${section.label}: ${filled ? 'complete' : 'missing'}`}
                        className={`h-2 w-2 rounded-full ${
                          filled
                            ? 'bg-portal shadow-[0_0_6px_rgba(4,172,255,0.65)]'
                            : 'border border-human/70 bg-human/10'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="truncate font-sc text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                  {missing.length > 0 ? (
                    <>
                      Missing required:{' '}
                      <span className="text-human/80">{missing.map(section => section.label).join(', ')}</span>
                    </>
                  ) : (
                    'All required Story inputs complete'
                  )}
                </p>
              </div>
              <p className="flex-1 font-sc text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500 sm:hidden">
                {requiredComplete}/{REQUIRED_STORY_SECTIONS.length} required
              </p>

              <ManifestButton
                size="lg"
                onClick={handleGenerateBlueprintClick}
                disabled={!canGenerate}
                loading={isGenerating}
                // While VERSA drafts, its mark replaces the generic spinner.
                loadingIndicator={activeAgentId === 'versa' ? (
                  <img src={AGENTS.VERSA.logoUrl} className="h-5 w-5 shrink-0 animate-pulse object-contain" alt="" aria-hidden="true" />
                ) : undefined}
                title={missing.length > 0 ? `Missing required: ${missing.map(section => section.label).join(', ')}` : 'Manifest the World Blueprint'}
                className="shrink-0"
              >
                {isGenerating ? (
                  <span>{activeAgentId === 'versa' ? 'VERSA is drafting...' : 'Manifesting...'}</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">Manifest World Blueprint</span>
                    <span className="sm:hidden">Manifest</span>
                  </>
                )}
              </ManifestButton>
            </div>
          </LibraryPanel>
        </div>
      </LibraryPanel>

      <p className="mt-4 text-center font-sans text-[11px] leading-relaxed text-neutral-600">
        Every empty field will be intelligently extrapolated using Chinese light-novel logic.
        A World Blueprint is generated for your review before the story begins.
      </p>

      <ImportPanel
        show={showImportPanel}
        onClose={() => setShowImportPanel(false)}
        onImport={handleImport}
      />

      {/* Mobile section drawer — the Library navigation shell focused purely
          on Story/World section navigation (no profile header; profile
          access lives in the bottom navigation's Profile tab). */}
      <LibraryNavigationDrawer
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        aria-label="Story Seed sections"
        closeLabel="Close sections"
        profile={storySeedDrawerProfile(equippedRelicTitle)}
        sections={buildStorySeedDrawerSections(seed, activeSection, (id) => {
          setActiveSection(id);
          setSelectorOpen(false);
        })}
      />

      {/* Mobile bottom navigation — the reusable Library bar. Mobile-only:
          the desktop layout already has the sidebar selector and the header
          utility actions. Rendered last so it rests at the end of the page
          and sticks to the viewport bottom while scrolling. */}
      <LibraryBottomNavigation
        aria-label="Story Seed navigation"
        items={bottomNavItems}
        showLabels={false}
        className="lg:hidden"
      />

      {/* Mobile utility sheet — Settings holds the seed utility actions
          (same handlers as the header buttons); Profile is a placeholder
          sheet with no account behavior. */}
      <AnimatePresence>
        {mobileSheet && (
          <div className="fixed inset-0 z-[240] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setMobileSheet(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-label={mobileSheet === 'settings' ? 'Story Seed settings' : 'Cultivator profile (placeholder)'}
              className="absolute inset-x-0 bottom-0"
            >
              <LibraryPanel
                padding="none"
                className="max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-b-none border-x-0 border-b-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
              >
                <div className="flex items-center justify-between gap-3 px-4 pt-3">
                  <p className="font-sc text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                    {mobileSheet === 'settings' ? 'Settings' : 'Profile'}
                  </p>
                  <LibraryButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileSheet(null)}
                    aria-label={mobileSheet === 'settings' ? 'Close settings' : 'Close profile'}
                    icon={X}
                  />
                </div>

                {mobileSheet === 'settings' ? (
                  <div className="mt-2 space-y-3 px-4">
                    <MatureAudienceSetting
                      checked={seed.story.optional.intendedForMatureAudiences}
                      onChange={checked => updateSeed(setIntendedForMatureAudiences(checked))}
                    />
                    <FateSurvivalSetting
                      settings={seed.story.optional.fateSurvival}
                      onChange={patch => updateSeed(patchFateSurvival(patch))}
                    />
                    <div className="space-y-2">
                      <LibraryButton
                        fullWidth
                        onClick={handleSaveDraft}
                        disabled={isGenerating}
                        title="Save this Story Seed draft"
                        icon={savedFeedback ? Check : Bookmark}
                      >
                        {savedFeedback ? 'Saved' : 'Save Draft'}
                      </LibraryButton>
                      <LibraryButton
                        fullWidth
                        variant="ghost"
                        onClick={() => {
                          setMobileSheet(null);
                          setShowImportPanel(true);
                        }}
                        icon={Copy}
                      >
                        Import
                      </LibraryButton>
                      {seedLibraryAvailable && (
                        <LibraryButton
                          fullWidth
                          variant="ghost"
                          onClick={() => {
                            setMobileSheet(null);
                            setShowLibrary(true);
                          }}
                          icon={Database}
                        >
                          My Seeds
                        </LibraryButton>
                      )}
                      {seedLibraryAvailable && savedSeeds.length > 0 && (
                        <LibraryButton
                          fullWidth
                          variant="ghost"
                          onClick={() => {
                            setMobileSheet(null);
                            handleExportAllSeeds();
                          }}
                          icon={Download}
                        >
                          Export All
                        </LibraryButton>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-3 px-4 pb-2">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-accent/40 bg-gold-accent/10 font-sc text-sm font-bold text-gold-accent"
                    >
                      S
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-sc text-sm font-bold uppercase tracking-widest text-signal">
                        SENSEI
                      </span>
                      <span className="block font-sans text-[11px] leading-relaxed text-neutral-500">
                        Cultivator Profile is a placeholder — it arrives with a future Library update.
                      </span>
                    </span>
                  </div>
                )}
              </LibraryPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Story Seed Help — the `?` guidance menu shared by the mobile bottom
          navigation and the desktop header button. */}
      <StorySeedHelpMenu
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        page="story-seed"
        title="Story Seed Help"
      />
    </div>
  );
}
