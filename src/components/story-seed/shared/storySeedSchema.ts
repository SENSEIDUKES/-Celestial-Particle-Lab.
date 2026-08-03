/**
 * The canonical creator-controlled Story Seed contract.
 *
 * ```text
 * STORY SEED
 * ├── creator
 * ├── story
 * │   ├── required   storyTags · premise · genre · style
 * │   └── optional   plotAndTropeSettings · additionalStoryDirection
 * └── world
 *     ├── required   (intentionally empty — World has no required inputs)
 *     └── optional   worldIdentity · worldFoundations
 * ```
 *
 * This is the *only* active Story Seed shape: it is what the creation
 * workspace edits, what is saved, what is exported, and what enters every
 * generation payload. System-owned data (ids, timestamps, status, ownership)
 * never appears inside `creator` / `story` / `world` — the temporary Workshop
 * record envelope lives in `storySeedRepository.ts`, and the story spine lives
 * in `storyAdministrativeMetadata.ts`.
 *
 * The frozen Phase-1 flat intake contract is not part of this file; it now
 * belongs to the locked `reference/` replica (see `referenceIntake.ts`).
 */

import type { WorldBlueprint } from './types';
import {
  assertValidStoryAdministrativeMetadata,
  type StoryAdministrativeMetadata,
} from './storyAdministrativeMetadata';
import { inferStoryTags } from './storyTagInference';
import { normalizeStoryStyle, type StoryStyle } from './storyStyle';

/**
 * Bumped when the persisted / portable Story Seed shape changes
 * incompatibly, so stale records are rejected instead of silently read as
 * empty. Version 3 is the Creator / Story / World hierarchy above.
 */
export const STORY_SEED_SCHEMA_VERSION = 3 as const;

// ─── Creator ─────────────────────────────────────────────────────────────────

/**
 * Creator-owned settings. The family is part of the contract even while no
 * creator-controlled field is collected yet, so nothing has to be restructured
 * when the first one arrives.
 */
export interface StorySeedCreator {}

// ─── Story ───────────────────────────────────────────────────────────────────

export interface StorySeedStoryRequired {
  storyTags: string[];
  premise: string;
  genre: string;
  /** The novel's storytelling tradition; `''` until the creator chooses one. */
  style: StoryStyle | '';
}

/** The narrative shape of the novel — where it is headed and what pushes back. */
export interface StorySeedPlotAndTropeSettings {
  longTermGoal?: string;
  firstMajorConflict?: string;
  mainAntagonistPressure?: string;
}

export interface StorySeedStoryOptional {
  plotAndTropeSettings: StorySeedPlotAndTropeSettings;
  /**
   * One freeform channel for everything the creator wants to say about the
   * story's direction. The Phase-1 seed spread the same intent across
   * `desiredPlotDirection`, `makeItWorkInstruction`, `mustIncludeElements`,
   * and `thingsToAvoid`; they are consolidated here.
   */
  additionalStoryDirection?: string;
}

export interface StorySeedStory {
  required: StorySeedStoryRequired;
  optional: StorySeedStoryOptional;
}

// ─── World ───────────────────────────────────────────────────────────────────

/** World has no required creator inputs. The family exists and stays empty. */
export interface StorySeedWorldRequired {}

/** Name, world type, society, and the place the story opens in. */
export interface StorySeedWorldIdentity {
  title?: string;
  worldType?: string;
  societyStructure?: string;
  startingLocation?: string;
}

export interface StorySeedCharacter {
  id: string;
  name: string;
  aliases?: string[];
  age?: string;
  skinTone?: string;
  eyeColor?: string;
  powerType?: string;
  rankLevel?: string;
  role?: string;
  connectionToMC?: string;
  bio?: string;
}

export interface StorySeedFaction {
  id: string;
  name: string;
  aliases?: string[];
  role?: string;
  powerLevel?: string;
  alignment?: string;
  connectionToMC?: string;
  description?: string;
}

export interface StorySeedMainCharacter {
  name?: string;
  startingIdentity?: string;
  personality?: string;
  mainFlaw?: string;
  secretAdvantage?: string;
  startingWeakness?: string;
  moralAlignment?: string;
  bio?: string;
}

export interface StorySeedAbilities {
  startingPowerConcept?: string;
  uniquePath?: string;
}

export interface StorySeedPowerSystem {
  flavor?: string;
  knownRanks?: string;
}

/** The history already standing when the novel opens. */
export interface StorySeedWorldFoundations {
  mainCharacter?: StorySeedMainCharacter;
  additionalCharacters?: StorySeedCharacter[];
  factions?: StorySeedFaction[];
  abilities?: StorySeedAbilities;
  powerSystem?: StorySeedPowerSystem;
  destinedEnding?: string;
}

export interface StorySeedWorldOptional {
  worldIdentity: StorySeedWorldIdentity;
  worldFoundations: StorySeedWorldFoundations;
}

export interface StorySeedWorld {
  required: StorySeedWorldRequired;
  optional: StorySeedWorldOptional;
}

// ─── The seed ────────────────────────────────────────────────────────────────

export interface StorySeedInput {
  creator: StorySeedCreator;
  story: StorySeedStory;
  world: StorySeedWorld;
}

export interface BlueprintGenerationPayload {
  storySeed: StorySeedInput;
}

export interface InitialStoryGenerationPayload extends BlueprintGenerationPayload {
  administrative: StoryAdministrativeMetadata;
  blueprint: WorldBlueprint;
  chapterCount: number;
}

export interface StorySeedValidationResult {
  valid: boolean;
  errors: string[];
}

// ─── Normalization primitives ────────────────────────────────────────────────

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const text = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const stringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(text).filter((item): item is string => Boolean(item))));
};

const optionalTextFields = <T extends object>(
  source: Record<string, unknown>,
  fields: readonly string[],
): T => Object.fromEntries(
  fields.flatMap(field => {
    const value = text(source[field]);
    return value ? [[field, value]] : [];
  }),
) as T;

const PLOT_AND_TROPE_FIELDS = ['longTermGoal', 'firstMajorConflict', 'mainAntagonistPressure'] as const;
const WORLD_IDENTITY_FIELDS = ['title', 'worldType', 'societyStructure', 'startingLocation'] as const;
const MAIN_CHARACTER_FIELDS = [
  'name', 'startingIdentity', 'personality', 'mainFlaw',
  'secretAdvantage', 'startingWeakness', 'moralAlignment', 'bio',
] as const;
const ABILITY_FIELDS = ['startingPowerConcept', 'uniquePath'] as const;
const POWER_SYSTEM_FIELDS = ['flavor', 'knownRanks'] as const;
const CHARACTER_FIELDS = [
  'name', 'age', 'skinTone', 'eyeColor', 'powerType', 'rankLevel', 'role', 'connectionToMC', 'bio',
] as const;
const FACTION_FIELDS = ['name', 'role', 'powerLevel', 'alignment', 'connectionToMC', 'description'] as const;

const normalizeCharacter = (value: unknown, index: number): StorySeedCharacter | null => {
  if (!isRecord(value) || !text(value.name)) return null;
  const normalized = {
    ...optionalTextFields<Partial<StorySeedCharacter>>(value, CHARACTER_FIELDS),
    id: text(value.id) || `seed-character-${index + 1}`,
  } as StorySeedCharacter;
  const aliases = stringList(value.aliases);
  if (aliases.length > 0) normalized.aliases = aliases;
  return normalized;
};

const normalizeFaction = (value: unknown, index: number): StorySeedFaction | null => {
  if (!isRecord(value) || !text(value.name)) return null;
  const normalized = {
    ...optionalTextFields<Partial<StorySeedFaction>>(value, FACTION_FIELDS),
    id: text(value.id) || `seed-faction-${index + 1}`,
  } as StorySeedFaction;
  const aliases = stringList(value.aliases);
  if (aliases.length > 0) normalized.aliases = aliases;
  return normalized;
};

const normalizeStoryOptional = (value: unknown): StorySeedStoryOptional => {
  const source = isRecord(value) ? value : {};
  const normalized: StorySeedStoryOptional = {
    plotAndTropeSettings: optionalTextFields<StorySeedPlotAndTropeSettings>(
      isRecord(source.plotAndTropeSettings) ? source.plotAndTropeSettings : {},
      PLOT_AND_TROPE_FIELDS,
    ),
  };
  const additionalStoryDirection = text(source.additionalStoryDirection);
  if (additionalStoryDirection) normalized.additionalStoryDirection = additionalStoryDirection;
  return normalized;
};

const normalizeWorldFoundations = (value: unknown): StorySeedWorldFoundations => {
  const source = isRecord(value) ? value : {};
  const normalized: StorySeedWorldFoundations = {};

  const mainCharacter = optionalTextFields<StorySeedMainCharacter>(
    isRecord(source.mainCharacter) ? source.mainCharacter : {},
    MAIN_CHARACTER_FIELDS,
  );
  if (Object.keys(mainCharacter).length > 0) normalized.mainCharacter = mainCharacter;

  const additionalCharacters = (Array.isArray(source.additionalCharacters) ? source.additionalCharacters : [])
    .map(normalizeCharacter)
    .filter((item): item is StorySeedCharacter => item !== null);
  if (additionalCharacters.length > 0) normalized.additionalCharacters = additionalCharacters;

  const factions = (Array.isArray(source.factions) ? source.factions : [])
    .map(normalizeFaction)
    .filter((item): item is StorySeedFaction => item !== null);
  if (factions.length > 0) normalized.factions = factions;

  const abilities = optionalTextFields<StorySeedAbilities>(
    isRecord(source.abilities) ? source.abilities : {},
    ABILITY_FIELDS,
  );
  if (Object.keys(abilities).length > 0) normalized.abilities = abilities;

  const powerSystem = optionalTextFields<StorySeedPowerSystem>(
    isRecord(source.powerSystem) ? source.powerSystem : {},
    POWER_SYSTEM_FIELDS,
  );
  if (Object.keys(powerSystem).length > 0) normalized.powerSystem = powerSystem;

  const destinedEnding = text(source.destinedEnding);
  if (destinedEnding) normalized.destinedEnding = destinedEnding;

  return normalized;
};

const normalizeWorldOptional = (value: unknown): StorySeedWorldOptional => {
  const source = isRecord(value) ? value : {};
  return {
    worldIdentity: optionalTextFields<StorySeedWorldIdentity>(
      isRecord(source.worldIdentity) ? source.worldIdentity : {},
      WORLD_IDENTITY_FIELDS,
    ),
    worldFoundations: normalizeWorldFoundations(source.worldFoundations),
  };
};

// ─── Construction ────────────────────────────────────────────────────────────

/** A structurally complete, creatively empty seed — what a new draft starts as. */
export const createEmptyStorySeedInput = (): StorySeedInput => ({
  creator: {},
  story: {
    required: {
      storyTags: [],
      premise: '',
      genre: '',
      // No hidden Style default: an untouched Style stays empty and reads as
      // incomplete rather than as a choice the creator never made.
      style: '',
    },
    optional: { plotAndTropeSettings: {} },
  },
  world: {
    required: {},
    optional: { worldIdentity: {}, worldFoundations: {} },
  },
});

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Structural validation only — the rule a *draft* has to satisfy. Creative
 * content may be entirely missing: a draft exists to preserve progress.
 */
export const validateStorySeedDraft = (value: unknown): StorySeedValidationResult => {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['Story Seed must be an object.'] };

  if (!isRecord(value.creator)) errors.push('Creator is required.');

  if (!isRecord(value.story)) {
    errors.push('Story is required.');
  } else {
    if (!isRecord(value.story.required)) errors.push('Story required inputs must be an object.');
    if (!isRecord(value.story.optional)) errors.push('Story optional settings must be an object.');
  }

  if (!isRecord(value.world)) {
    errors.push('World is required.');
  } else {
    // World holds no required creator inputs, but the family must still exist.
    if (!isRecord(value.world.required)) errors.push('World required inputs must be an object.');
    if (!isRecord(value.world.optional)) errors.push('World optional settings must be an object.');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Generation readiness — the four required Story inputs. Story Tags belong
 * here like the other three; they never block a creator because
 * `applyInferredStoryTags` fills an empty set from Premise, Genre, and Style
 * before the generation payload builders assert.
 */
export const validateStorySeedInput = (value: unknown): StorySeedValidationResult => {
  const draft = validateStorySeedDraft(value);
  const errors = [...draft.errors];
  if (isRecord(value) && isRecord(value.story) && isRecord(value.story.required)) {
    const required = value.story.required;
    // Style first: it is the first decision the creation flow asks for.
    if (!normalizeStoryStyle(required.style)) errors.push('Style is required.');
    if (!text(required.genre)) errors.push('Genre is required.');
    if (!text(required.premise)) errors.push('Premise is required.');
    if (stringList(required.storyTags).length === 0) errors.push('Story Tags are required.');
  }
  return { valid: errors.length === 0, errors };
};

export function assertValidStorySeedDraft(value: unknown): asserts value is StorySeedInput {
  const result = validateStorySeedDraft(value);
  if (!result.valid) throw new Error(result.errors.join(' '));
}

export function assertValidStorySeedInput(value: unknown): asserts value is StorySeedInput {
  const result = validateStorySeedInput(value);
  if (!result.valid) throw new Error(result.errors.join(' '));
}

/**
 * Normalizes any structurally valid seed — including an incomplete draft, so
 * saving never depends on creative completeness. Generation payload builders
 * assert generation readiness separately.
 */
export const normalizeStorySeedInput = (value: unknown): StorySeedInput => {
  assertValidStorySeedDraft(value);
  const story = value.story as unknown as Record<string, unknown>;
  const world = value.world as unknown as Record<string, unknown>;
  const required = (isRecord(story.required) ? story.required : {}) as Record<string, unknown>;
  return {
    creator: {},
    story: {
      required: {
        storyTags: stringList(required.storyTags),
        premise: text(required.premise) || '',
        genre: text(required.genre) || '',
        style: normalizeStoryStyle(required.style) || '',
      },
      optional: normalizeStoryOptional(story.optional),
    },
    world: {
      required: {},
      optional: normalizeWorldOptional(world.optional),
    },
  };
};

/**
 * Fills empty Story Tags from Premise, Genre, and Style. Manually chosen tags
 * are always preserved untouched; this only ever fires on an empty set. The
 * returned seed is what gets saved *and* what enters the generation pipeline,
 * so the stored seed and the generated novel always share one tag set.
 */
export const applyInferredStoryTags = (seed: StorySeedInput): StorySeedInput => {
  if (seed.story.required.storyTags.length > 0) return seed;
  const storyTags = inferStoryTags({
    premise: seed.story.required.premise,
    genre: seed.story.required.genre,
    style: seed.story.required.style,
  });
  return { ...seed, story: { ...seed.story, required: { ...seed.story.required, storyTags } } };
};

// ─── Generation boundary ─────────────────────────────────────────────────────

/**
 * A first-pass World Blueprint projected from the seed. One-way and
 * generation-facing only: the Blueprint is generated output and is never
 * stored back inside the Story Seed contract.
 */
export const createBlueprintDraftFromSeed = (seed: StorySeedInput): WorldBlueprint => {
  const { worldIdentity, worldFoundations } = seed.world.optional;
  return {
    title: worldIdentity.title || 'Untitled Story',
    logline: seed.story.required.premise,
    worldOverview: worldIdentity.worldType || '',
    startingLocation: worldIdentity.startingLocation || '',
    societyStructure: worldIdentity.societyStructure || '',
    powerSystemOutline: worldFoundations.abilities?.startingPowerConcept
      || worldFoundations.powerSystem?.knownRanks
      || '',
    mcProfile: worldFoundations.mainCharacter?.bio || worldFoundations.mainCharacter?.startingIdentity || '',
    majorFactions: (worldFoundations.factions || []).map(faction => faction.name),
    initialCharacters: (worldFoundations.additionalCharacters || []).map(character => character.name),
    majorMysteries: [],
    firstArcPromise: seed.story.optional.plotAndTropeSettings.firstMajorConflict || '',
    tropeRules: '',
    styleBible: seed.story.required.style,
    destinedEnding: worldFoundations.destinedEnding || '',
    estimatedArcs: 10,
    unresolvedPlotThreads: [],
  };
};

export const buildBlueprintGenerationPayload = (seed: StorySeedInput): BlueprintGenerationPayload => {
  const storySeed = applyInferredStoryTags(normalizeStorySeedInput(seed));
  assertValidStorySeedInput(storySeed);
  return { storySeed };
};

export const buildInitialStoryGenerationPayload = (
  seed: StorySeedInput,
  administrative: StoryAdministrativeMetadata,
  blueprint: WorldBlueprint,
  chapterCount: number,
): InitialStoryGenerationPayload => {
  const storySeed = applyInferredStoryTags(normalizeStorySeedInput(seed));
  assertValidStorySeedInput(storySeed);
  assertValidStoryAdministrativeMetadata(administrative);
  return { storySeed, administrative, blueprint, chapterCount };
};
