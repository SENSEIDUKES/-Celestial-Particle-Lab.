import type { IntakeCharacter, IntakeData, IntakeFaction, WorldBlueprint } from './types';
import {
  assertValidStoryAdministrativeMetadata,
  type StoryAdministrativeMetadata,
} from './storyAdministrativeMetadata';
import { inferStoryTags } from './storyTagInference';
import { normalizeStoryStyle, type StoryStyle } from './storyStyle';

export const STORY_SEED_SCHEMA_VERSION = 2 as const;

export interface StorySeedCreator {
  // Reserved for creator-controlled settings. The family is required even
  // while there are no creator fields to collect.
}

export interface StorySeedStoryOptional {
  desiredPlotDirection?: string;
  logline?: string;
  estimatedArcs?: number;
  generalAtmosphere?: string;
  dangerLevel?: string;
  powerPace?: string;
  longTermGoal?: string;
  firstMajorConflict?: string;
  mainAntagonistPressure?: string;
  romanceLevel?: string;
  faceSlappingLevel?: string;
  comedyLevel?: string;
  tournamentArcPreference?: string;
  haremPreference?: string;
  betrayalLevel?: string;
  thingsToAvoid?: string;
  mustIncludeElements?: string;
  hardcoreFateMode?: boolean;
  fatePressure?: 'Relaxed' | 'Balanced' | 'Hardcore' | 'Dao Master';
  makeItWorkInstruction?: string;
  firstArcPromise?: string;
  tropeRules?: string;
  unresolvedPlotThreads?: string[];
}

export interface StorySeedStory {
  storyTags: string[];
  premise: string;
  genre: string;
  /** The novel's storytelling tradition; `''` until the creator chooses one. */
  style: StoryStyle | '';
  optional: StorySeedStoryOptional;
}

export interface StorySeedMainCharacter {
  name?: string;
  profile?: string;
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
  outline?: string;
}

export interface StorySeedWorldOptional {
  title?: string;
  worldType?: string;
  universe?: string;
  startingLocation?: string;
  societyStructure?: string;
  mainCharacter?: StorySeedMainCharacter;
  additionalCharacters?: IntakeCharacter[];
  factions?: IntakeFaction[];
  abilities?: StorySeedAbilities;
  powerSystem?: StorySeedPowerSystem;
  destinedEnding?: string;
  majorMysteries?: string[];
}

export interface StorySeedWorld {
  optional: StorySeedWorldOptional;
}

/** The complete user-controlled creative intake. Operational metadata lives elsewhere. */
export interface StorySeedInput {
  creator: StorySeedCreator;
  story: StorySeedStory;
  world: StorySeedWorld;
}

/** Private account-owned record. Internal fields are excluded from portable exports. */
export interface StorySeedRecord extends StorySeedInput {
  schemaVersion: typeof STORY_SEED_SCHEMA_VERSION;
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const text = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const positiveInteger = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined;

const stringList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(text).filter((item): item is string => Boolean(item))));
};

const optionalTextFields = <T extends object>(
  source: Record<string, unknown>,
  fields: readonly string[],
): Partial<T> => Object.fromEntries(
  fields.flatMap(field => {
    const value = text(source[field]);
    return value ? [[field, value]] : [];
  }),
) as Partial<T>;

const STORY_OPTIONAL_TEXT_FIELDS = [
  'desiredPlotDirection',
  'logline',
  'generalAtmosphere',
  'dangerLevel',
  'powerPace',
  'longTermGoal',
  'firstMajorConflict',
  'mainAntagonistPressure',
  'romanceLevel',
  'faceSlappingLevel',
  'comedyLevel',
  'tournamentArcPreference',
  'haremPreference',
  'betrayalLevel',
  'thingsToAvoid',
  'mustIncludeElements',
  'makeItWorkInstruction',
  'firstArcPromise',
  'tropeRules',
] as const;

const MAIN_CHARACTER_TEXT_FIELDS = [
  'name',
  'profile',
  'startingIdentity',
  'personality',
  'mainFlaw',
  'secretAdvantage',
  'startingWeakness',
  'moralAlignment',
  'bio',
] as const;

const WORLD_TEXT_FIELDS = [
  'title',
  'worldType',
  'universe',
  'startingLocation',
  'societyStructure',
  'destinedEnding',
] as const;

const normalizeCharacter = (value: unknown, index: number): IntakeCharacter | null => {
  if (!isRecord(value) || !text(value.name)) return null;
  const normalized = {
    ...optionalTextFields<IntakeCharacter>(value, [
      'name', 'age', 'skinTone', 'eyeColor', 'powerType', 'rankLevel', 'role', 'connectionToMC', 'bio',
    ]),
    id: text(value.id) || `seed-character-${index + 1}`,
  } as IntakeCharacter;
  const aliases = stringList(value.aliases);
  if (aliases.length > 0) normalized.aliases = aliases;
  return normalized;
};

const normalizeFaction = (value: unknown, index: number): IntakeFaction | null => {
  if (!isRecord(value) || !text(value.name)) return null;
  const normalized = {
    ...optionalTextFields<IntakeFaction>(value, [
      'name', 'role', 'powerLevel', 'alignment', 'connectionToMC', 'description',
    ]),
    id: text(value.id) || `seed-faction-${index + 1}`,
  } as IntakeFaction;
  const aliases = stringList(value.aliases);
  if (aliases.length > 0) normalized.aliases = aliases;
  return normalized;
};

const normalizeStoryOptional = (value: unknown): StorySeedStoryOptional => {
  const source = isRecord(value) ? value : {};
  const normalized: StorySeedStoryOptional = optionalTextFields<StorySeedStoryOptional>(
    source,
    STORY_OPTIONAL_TEXT_FIELDS,
  );
  const estimatedArcs = positiveInteger(source.estimatedArcs);
  if (estimatedArcs) normalized.estimatedArcs = estimatedArcs;
  if (typeof source.hardcoreFateMode === 'boolean') normalized.hardcoreFateMode = source.hardcoreFateMode;
  if (
    source.fatePressure === 'Relaxed'
    || source.fatePressure === 'Balanced'
    || source.fatePressure === 'Hardcore'
    || source.fatePressure === 'Dao Master'
  ) normalized.fatePressure = source.fatePressure;
  const unresolvedPlotThreads = stringList(source.unresolvedPlotThreads);
  if (unresolvedPlotThreads.length > 0) normalized.unresolvedPlotThreads = unresolvedPlotThreads;
  return normalized;
};

const normalizeWorldOptional = (value: unknown): StorySeedWorldOptional => {
  const source = isRecord(value) ? value : {};
  const normalized: StorySeedWorldOptional = optionalTextFields<StorySeedWorldOptional>(source, WORLD_TEXT_FIELDS);

  if (isRecord(source.mainCharacter)) {
    const mainCharacter = optionalTextFields<StorySeedMainCharacter>(
      source.mainCharacter,
      MAIN_CHARACTER_TEXT_FIELDS,
    );
    if (Object.keys(mainCharacter).length > 0) normalized.mainCharacter = mainCharacter;
  }

  if (Array.isArray(source.additionalCharacters)) {
    const additionalCharacters = source.additionalCharacters
      .map(normalizeCharacter)
      .filter((item): item is IntakeCharacter => item !== null);
    if (additionalCharacters.length > 0) normalized.additionalCharacters = additionalCharacters;
  }
  if (Array.isArray(source.factions)) {
    const factions = source.factions
      .map(normalizeFaction)
      .filter((item): item is IntakeFaction => item !== null);
    if (factions.length > 0) normalized.factions = factions;
  }

  if (isRecord(source.abilities)) {
    const abilities = optionalTextFields<StorySeedAbilities>(source.abilities, ['startingPowerConcept', 'uniquePath']);
    if (Object.keys(abilities).length > 0) normalized.abilities = abilities;
  }
  if (isRecord(source.powerSystem)) {
    const powerSystem = optionalTextFields<StorySeedPowerSystem>(source.powerSystem, ['flavor', 'knownRanks', 'outline']);
    if (Object.keys(powerSystem).length > 0) normalized.powerSystem = powerSystem;
  }
  const majorMysteries = stringList(source.majorMysteries);
  if (majorMysteries.length > 0) normalized.majorMysteries = majorMysteries;
  return normalized;
};

/**
 * Structural validation only — the rule a *draft* has to satisfy. Creative
 * content may be entirely missing: a draft exists to preserve progress, so
 * Premise, Genre, Style, and Story Tags are all allowed to be empty here.
 */
export const validateStorySeedDraft = (value: unknown): StorySeedValidationResult => {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['Story Seed must be an object.'] };
  if (!isRecord(value.creator)) errors.push('Creator is required.');
  if (!isRecord(value.story)) {
    errors.push('Story is required.');
  } else if (!isRecord(value.story.optional)) {
    errors.push('Story optional settings must be an object.');
  }
  if (!isRecord(value.world)) {
    errors.push('World is required.');
  } else if (!isRecord(value.world.optional)) {
    errors.push('World optional settings must be an object.');
  }
  return { valid: errors.length === 0, errors };
};

/**
 * Generation readiness — the three required Story inputs. Story Tags are
 * deliberately absent: when empty they are inferred from Premise, Genre, and
 * Style (see `applyInferredStoryTags`), so they can never block generation.
 * World is required to exist as a family but never to hold content.
 */
export const validateStorySeedInput = (value: unknown): StorySeedValidationResult => {
  const draft = validateStorySeedDraft(value);
  const errors = [...draft.errors];
  if (isRecord(value) && isRecord(value.story)) {
    // Style first: it is the first decision the creation flow asks for.
    if (!normalizeStoryStyle(value.story.style)) errors.push('Style is required.');
    if (!text(value.story.genre)) errors.push('Genre is required.');
    if (!text(value.story.premise)) errors.push('Premise is required.');
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
  return {
    creator: {},
    story: {
      storyTags: stringList(story.storyTags),
      premise: text(story.premise) || '',
      genre: text(story.genre) || '',
      style: normalizeStoryStyle(story.style) || '',
      optional: normalizeStoryOptional(story.optional),
    },
    world: {
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
  if (seed.story.storyTags.length > 0) return seed;
  const storyTags = inferStoryTags({
    premise: seed.story.premise,
    genre: seed.story.genre,
    style: seed.story.style,
  });
  return { ...seed, story: { ...seed.story, storyTags } };
};

const compact = <T extends object>(value: T): T | undefined =>
  Object.values(value).some(item => item !== undefined && item !== '') ? value : undefined;

const entityNameKey = (value: string): string => value
  .normalize('NFKC')
  .replace(/\s*\([^)]*\)\s*$/, '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLocaleLowerCase();

const mergeNamedCharacters = (intake: IntakeData, blueprint?: WorldBlueprint): IntakeCharacter[] => {
  const characters = [...(intake.customCharacters || [])];
  const existing = new Set(characters.map(character => entityNameKey(character.name)));
  for (const [index, name] of (blueprint?.initialCharacters || []).entries()) {
    const normalizedName = name.trim();
    const key = entityNameKey(normalizedName);
    if (!key || existing.has(key)) continue;
    existing.add(key);
    characters.push({ id: `blueprint-character-${index + 1}`, name: normalizedName });
  }
  return characters;
};

const mergeNamedFactions = (intake: IntakeData, blueprint?: WorldBlueprint): IntakeFaction[] => {
  const factions = [...(intake.customFactions || [])];
  const existing = new Set(factions.map(faction => entityNameKey(faction.name)));
  for (const [index, name] of (blueprint?.majorFactions || []).entries()) {
    const normalizedName = name.trim();
    const key = entityNameKey(normalizedName);
    if (!key || existing.has(key)) continue;
    existing.add(key);
    factions.push({ id: `blueprint-faction-${index + 1}`, name: normalizedName });
  }
  return factions;
};

/**
 * Boundary adapter for the Phase 2 creation workspace. The flat IntakeData
 * view model never crosses persistence, serialization, or generation after
 * this point.
 */
export const createStorySeedInput = (
  intake: IntakeData,
  blueprint?: WorldBlueprint,
): StorySeedInput => ({
  creator: {},
  story: {
    storyTags: stringList(intake.storyTags),
    premise: intake.corePremise?.trim() || '',
    genre: intake.genrePath?.trim() || '',
    // Style is the chosen novel tradition. No hidden default: an untouched
    // Style stays empty and reads as incomplete. A blueprint's style bible
    // carries over only when it already holds a valid tradition (a reused or
    // imported seed); freeform prose text from older seeds does not qualify.
    style: normalizeStoryStyle(intake.proseStyle) || normalizeStoryStyle(blueprint?.styleBible) || '',
    optional: {
      ...optionalTextFields<StorySeedStoryOptional>(intake as unknown as Record<string, unknown>, [
        'desiredPlotDirection',
        'generalAtmosphere',
        'dangerLevel',
        'powerPace',
        'longTermGoal',
        'firstMajorConflict',
        'mainAntagonistPressure',
        'romanceLevel',
        'faceSlappingLevel',
        'comedyLevel',
        'tournamentArcPreference',
        'haremPreference',
        'betrayalLevel',
        'thingsToAvoid',
        'mustIncludeElements',
        'makeItWorkInstruction',
      ]),
      ...(text(blueprint?.logline) ? { logline: text(blueprint?.logline) } : {}),
      ...(positiveInteger(intake.estimatedArcs ?? blueprint?.estimatedArcs)
        ? { estimatedArcs: positiveInteger(intake.estimatedArcs ?? blueprint?.estimatedArcs) }
        : {}),
      ...(typeof intake.hardcoreFateMode === 'boolean' ? { hardcoreFateMode: intake.hardcoreFateMode } : {}),
      ...(intake.fatePressure ? { fatePressure: intake.fatePressure } : {}),
      ...(text(blueprint?.firstArcPromise) ? { firstArcPromise: text(blueprint?.firstArcPromise) } : {}),
      ...(text(blueprint?.tropeRules) ? { tropeRules: text(blueprint?.tropeRules) } : {}),
      ...(stringList(blueprint?.unresolvedPlotThreads).length > 0
        ? { unresolvedPlotThreads: stringList(blueprint?.unresolvedPlotThreads) }
        : {}),
    },
  },
  world: {
    optional: {
      ...(text(blueprint?.title || intake.novelTitle) ? { title: text(blueprint?.title || intake.novelTitle) } : {}),
      ...(text(intake.worldType) ? { worldType: text(intake.worldType) } : {}),
      ...(text(blueprint?.worldOverview) ? { universe: text(blueprint?.worldOverview) } : {}),
      ...(text(blueprint?.startingLocation || intake.startingLocation)
        ? { startingLocation: text(blueprint?.startingLocation || intake.startingLocation) }
        : {}),
      ...(text(blueprint?.societyStructure || intake.societyStructure)
        ? { societyStructure: text(blueprint?.societyStructure || intake.societyStructure) }
        : {}),
      ...(compact<StorySeedMainCharacter>({
        name: text(intake.mcName),
        profile: text(blueprint?.mcProfile),
        startingIdentity: text(intake.startingIdentity),
        personality: text(intake.personality),
        mainFlaw: text(intake.mainFlaw),
        secretAdvantage: text(intake.secretAdvantage),
        startingWeakness: text(intake.startingWeakness),
        moralAlignment: text(intake.moralAlignment),
        bio: text(intake.mcBio),
      }) ? { mainCharacter: compact<StorySeedMainCharacter>({
        name: text(intake.mcName),
        profile: text(blueprint?.mcProfile),
        startingIdentity: text(intake.startingIdentity),
        personality: text(intake.personality),
        mainFlaw: text(intake.mainFlaw),
        secretAdvantage: text(intake.secretAdvantage),
        startingWeakness: text(intake.startingWeakness),
        moralAlignment: text(intake.moralAlignment),
        bio: text(intake.mcBio),
      }) } : {}),
      ...(mergeNamedCharacters(intake, blueprint).length > 0
        ? { additionalCharacters: mergeNamedCharacters(intake, blueprint) }
        : {}),
      ...(mergeNamedFactions(intake, blueprint).length > 0
        ? { factions: mergeNamedFactions(intake, blueprint) }
        : {}),
      ...(compact<StorySeedAbilities>({
        startingPowerConcept: text(intake.startingPowerConcept),
        uniquePath: text(intake.uniquePath),
      }) ? { abilities: compact<StorySeedAbilities>({
        startingPowerConcept: text(intake.startingPowerConcept),
        uniquePath: text(intake.uniquePath),
      }) } : {}),
      ...(compact<StorySeedPowerSystem>({
        flavor: text(intake.powerFlavor),
        knownRanks: text(intake.knownRanks),
        outline: text(blueprint?.powerSystemOutline),
      }) ? { powerSystem: compact<StorySeedPowerSystem>({
        flavor: text(intake.powerFlavor),
        knownRanks: text(intake.knownRanks),
        outline: text(blueprint?.powerSystemOutline),
      }) } : {}),
      ...(text(blueprint?.destinedEnding || intake.destinedEnding)
        ? { destinedEnding: text(blueprint?.destinedEnding || intake.destinedEnding) }
        : {}),
      ...(stringList(blueprint?.majorMysteries).length > 0
        ? { majorMysteries: stringList(blueprint?.majorMysteries) }
        : {}),
    },
  },
});

export const storySeedToIntake = (seed: StorySeedInput): IntakeData => {
  const { optional: story } = seed.story;
  const { optional: world } = seed.world;
  const mainCharacter = world.mainCharacter || {};
  return {
    novelTitle: world.title || '',
    mcName: mainCharacter.name || '',
    genrePath: seed.story.genre,
    corePremise: seed.story.premise,
    proseStyle: seed.story.style,
    desiredPlotDirection: story.desiredPlotDirection || '',
    storyTags: [...seed.story.storyTags],
    destinedEnding: world.destinedEnding || '',
    estimatedArcs: story.estimatedArcs,
    worldType: world.worldType || '',
    startingLocation: world.startingLocation || '',
    societyStructure: world.societyStructure || '',
    dangerLevel: story.dangerLevel || '',
    generalAtmosphere: story.generalAtmosphere || '',
    startingIdentity: mainCharacter.startingIdentity || '',
    personality: mainCharacter.personality || '',
    mainFlaw: mainCharacter.mainFlaw || '',
    secretAdvantage: mainCharacter.secretAdvantage || '',
    startingWeakness: mainCharacter.startingWeakness || '',
    moralAlignment: mainCharacter.moralAlignment || '',
    mcBio: mainCharacter.bio || '',
    customCharacters: world.additionalCharacters ? [...world.additionalCharacters] : [],
    customFactions: world.factions ? [...world.factions] : [],
    startingPowerConcept: world.abilities?.startingPowerConcept || '',
    powerFlavor: world.powerSystem?.flavor || '',
    powerPace: story.powerPace || '',
    knownRanks: world.powerSystem?.knownRanks || '',
    uniquePath: world.abilities?.uniquePath || '',
    longTermGoal: story.longTermGoal || '',
    firstMajorConflict: story.firstMajorConflict || '',
    mainAntagonistPressure: story.mainAntagonistPressure || '',
    romanceLevel: story.romanceLevel || '',
    faceSlappingLevel: story.faceSlappingLevel || '',
    comedyLevel: story.comedyLevel || '',
    tournamentArcPreference: story.tournamentArcPreference || '',
    haremPreference: story.haremPreference || '',
    betrayalLevel: story.betrayalLevel || '',
    thingsToAvoid: story.thingsToAvoid || '',
    mustIncludeElements: story.mustIncludeElements || '',
    hardcoreFateMode: story.hardcoreFateMode,
    fatePressure: story.fatePressure,
    makeItWorkInstruction: story.makeItWorkInstruction || '',
  };
};

export const storySeedToBlueprint = (seed: StorySeedInput): WorldBlueprint => {
  const { optional: story } = seed.story;
  const { optional: world } = seed.world;
  return {
    title: world.title || 'Untitled Story',
    logline: story.logline || seed.story.premise,
    worldOverview: world.universe || world.worldType || '',
    startingLocation: world.startingLocation || '',
    societyStructure: world.societyStructure || '',
    powerSystemOutline: world.powerSystem?.outline || world.abilities?.startingPowerConcept || '',
    mcProfile: world.mainCharacter?.profile || world.mainCharacter?.bio || '',
    majorFactions: (world.factions || []).map(faction => faction.name),
    initialCharacters: (world.additionalCharacters || []).map(character => character.name),
    majorMysteries: [...(world.majorMysteries || [])],
    firstArcPromise: story.firstArcPromise || '',
    tropeRules: story.tropeRules || '',
    styleBible: seed.story.style,
    destinedEnding: world.destinedEnding || '',
    estimatedArcs: story.estimatedArcs || 10,
    unresolvedPlotThreads: [...(story.unresolvedPlotThreads || [])],
  };
};

export const buildBlueprintGenerationPayload = (seed: StorySeedInput): BlueprintGenerationPayload => {
  assertValidStorySeedInput(seed);
  return { storySeed: applyInferredStoryTags(normalizeStorySeedInput(seed)) };
};

export const buildInitialStoryGenerationPayload = (
  seed: StorySeedInput,
  administrative: StoryAdministrativeMetadata,
  blueprint: WorldBlueprint,
  chapterCount: number,
): InitialStoryGenerationPayload => {
  assertValidStorySeedInput(seed);
  assertValidStoryAdministrativeMetadata(administrative);
  return {
    storySeed: applyInferredStoryTags(normalizeStorySeedInput(seed)),
    administrative,
    blueprint,
    chapterCount,
  };
};
