import { beforeEach, describe, expect, it } from 'vitest';
import type { IntakeData, WorldBlueprint } from './types';
import {
  buildBlueprintGenerationPayload,
  buildInitialStoryGenerationPayload,
  createStorySeedInput,
  storySeedToIntake,
  validateStorySeedInput,
} from './storySeedSchema';
import {
  createStorySeedCollectionExport,
  createStorySeedExport,
  parseStorySeedJson,
} from './storySeedSerialization';
import {
  createStorySeed,
  listStorySeeds,
  resetStorySeedRepository,
  updateStorySeed,
} from './storySeedRepository';
import {
  createStoryAdministrativeMetadata,
  validateStoryAdministrativeMetadata,
} from './storyAdministrativeMetadata';

const intake: IntakeData = {
  creatorPenName: 'Sensei of the Ninth Meridian',
  novelTitle: 'Ashes of the Ninth Meridian',
  mcName: 'Ye Chen',
  genrePath: 'Fate Survival',
  corePremise: 'A prince must survive the seven timelines that say he dies.',
  proseStyle: 'Close-third prose with ledger-like fate entries.',
  storyTags: ['death flags', 'foreknowledge'],
  desiredPlotDirection: 'Escalating court intrigue.',
  destinedEnding: 'The prince survives and severs the court from fate.',
  estimatedArcs: 7,
  worldType: 'Ancient sect world',
  startingLocation: 'Outer sect quarry',
  societyStructure: 'Sect-led feudal hierarchy',
  dangerLevel: 'Relentless',
  generalAtmosphere: 'Ominous and intimate',
  universeOverview: 'A shattered celestial court rules the sects through fate ledgers.',
  majorMysteries: 'Who wrote the fate ledgers?\nWhat killed the Eighth Prince?',
  startingIdentity: 'Crippled young master',
  personality: 'Protective and ruthless',
  mainFlaw: 'Cannot trust allies',
  secretAdvantage: 'Remembers failed timelines',
  startingWeakness: 'Destroyed meridians',
  moralAlignment: 'Chaotic neutral',
  mcBio: 'A fallen heir carrying forbidden memories.',
  customCharacters: [{ id: 'character-1', name: 'Elder Qin' }],
  customFactions: [{ id: 'faction-1', name: 'Heavenly Sword Sect' }],
  startingPowerConcept: 'Qi Condensation',
  powerFlavor: 'Daoist martial arts',
  powerPace: 'Slow-burn advancement',
  knownRanks: 'Qi Condensation > Foundation Establishment',
  uniquePath: 'Fate severing',
  longTermGoal: 'Break the assassination cycle',
  firstMajorConflict: 'The sect tournament',
  mainAntagonistPressure: 'The celestial court',
  romanceLevel: 'Single heroine',
  faceSlappingLevel: 'Low',
  comedyLevel: 'Dry',
  tournamentArcPreference: 'One meaningful arc',
  haremPreference: 'None',
  betrayalLevel: 'Moderate',
  thingsToAvoid: 'Disposable villains',
  mustIncludeElements: 'Timeline consequences',
  hardcoreFateMode: true,
  fatePressure: 'Hardcore',
  makeItWorkInstruction: 'Never erase the cost of changing fate.',
};

const blueprint: WorldBlueprint = {
  title: 'Ashes of the Ninth Meridian',
  logline: 'Seven doomed timelines. One chance to break fate.',
  worldOverview: 'A shattered celestial court rules the sects through fate ledgers.',
  startingLocation: 'Outer sect quarry',
  societyStructure: 'Sect-led feudal hierarchy',
  powerSystemOutline: 'Cultivation advances by severing imposed destinies.',
  mcProfile: 'Ye Chen is a fallen heir with memories of seven failures.',
  majorFactions: ['Heavenly Sword Sect', 'Celestial Court'],
  initialCharacters: ['Elder Qin (Protector)', 'Ninth Prince'],
  majorMysteries: ['Who wrote the fate ledgers?'],
  firstArcPromise: 'The first assassination attempt begins at the tournament.',
  tropeRules: 'Consequences before triumph.',
  styleBible: 'Terse, ominous close-third prose.',
  destinedEnding: 'The prince survives and severs the court from fate.',
  estimatedArcs: 7,
  unresolvedPlotThreads: ['Identify the court infiltrator'],
};

describe('Story Seed creator/story/world contract', () => {
  beforeEach(() => resetStorySeedRepository());

  it('requires Creator and all four Story inputs while accepting an empty World', () => {
    const valid = {
      creator: {},
      story: {
        storyTags: ['fate survival'],
        premise: 'A doomed prince gets one final timeline.',
        genre: 'Fate Survival',
        style: 'Tense close-third prose',
        optional: {},
      },
      world: { optional: {} },
    };
    expect(validateStorySeedInput(valid)).toEqual({ valid: true, errors: [] });

    const invalid = {
      story: { storyTags: [], premise: '', genre: '', style: '', optional: {} },
      world: { optional: {} },
    };
    expect(validateStorySeedInput(invalid)).toEqual({
      valid: false,
      errors: [
        'Creator is required.',
        'Story Tags are required.',
        'Premise is required.',
        'Genre is required.',
        'Style is required.',
      ],
    });
  });

  it('classifies every legacy intake and blueprint field into Creator, Story, or World', () => {
    const seed = createStorySeedInput(intake, blueprint);

    expect(seed.creator).toEqual({ penName: intake.creatorPenName });
    expect(seed.story).toMatchObject({
      storyTags: ['death flags', 'foreknowledge'],
      premise: intake.corePremise,
      genre: intake.genrePath,
      style: intake.proseStyle,
      optional: {
        desiredPlotDirection: intake.desiredPlotDirection,
        dangerLevel: intake.dangerLevel,
        powerPace: intake.powerPace,
        firstMajorConflict: intake.firstMajorConflict,
        tropeRules: blueprint.tropeRules,
        unresolvedPlotThreads: blueprint.unresolvedPlotThreads,
      },
    });
    expect(seed.world.optional).toMatchObject({
      title: blueprint.title,
      worldType: intake.worldType,
      universe: blueprint.worldOverview,
      destinedEnding: blueprint.destinedEnding,
      mainCharacter: { name: intake.mcName, personality: intake.personality },
      abilities: { startingPowerConcept: intake.startingPowerConcept, uniquePath: intake.uniquePath },
      powerSystem: { flavor: intake.powerFlavor, knownRanks: intake.knownRanks, outline: blueprint.powerSystemOutline },
      majorMysteries: ['Who wrote the fate ledgers?', 'What killed the Eighth Prince?'],
    });
    expect(seed.world.optional.additionalCharacters?.map(character => character.name)).toEqual(['Elder Qin', 'Ninth Prince']);
    expect(seed.world.optional.factions?.map(faction => faction.name)).toEqual(['Heavenly Sword Sect', 'Celestial Court']);
  });

  it('falls back to blueprint and intake values for style, universe, and mysteries', () => {
    const { creatorPenName: _creatorPenName, proseStyle: _proseStyle, ...rest } = intake;
    const seed = createStorySeedInput(rest, blueprint);
    expect(seed.creator).toEqual({});
    expect(seed.story.style).toBe(blueprint.styleBible);
    expect(seed.world.optional.universe).toBe(blueprint.worldOverview);

    const { universeOverview: _universeOverview, majorMysteries: _majorMysteries, ...restIntake } = rest;
    const intakeOnly = createStorySeedInput(restIntake);
    expect(intakeOnly.story.style).toBe(restIntake.generalAtmosphere);
    expect(intakeOnly.world.optional.universe).toBeUndefined();
    expect(intakeOnly.world.optional.majorMysteries).toBeUndefined();

    const intakeSourced = createStorySeedInput(intake);
    expect(intakeSourced.world.optional.universe).toBe(intake.universeOverview);
    expect(intakeSourced.world.optional.majorMysteries).toEqual([
      'Who wrote the fate ledgers?',
      'What killed the Eighth Prince?',
    ]);
  });

  it('round-trips the new creator, style, and world fields through the intake view model', () => {
    const seed = createStorySeedInput(intake, blueprint);
    const restored = storySeedToIntake(seed);
    expect(restored.creatorPenName).toBe(intake.creatorPenName);
    expect(restored.proseStyle).toBe(intake.proseStyle);
    expect(restored.universeOverview).toBe(intake.universeOverview);
    expect(restored.majorMysteries).toBe(intake.majorMysteries);
  });

  it('serializes only creator/story/world and round-trips portable files', () => {
    const seed = createStorySeedInput(intake, blueprint);
    const exported = createStorySeedExport(seed);
    expect(exported).toMatchObject({ format: 'seihouse-story-seed', version: 2 });
    expect(exported.seed).toHaveProperty('creator');
    expect(exported.seed).toHaveProperty('story');
    expect(exported.seed).toHaveProperty('world');
    expect(exported.seed).not.toHaveProperty('intake');
    expect(exported.seed).not.toHaveProperty('blueprint');
    expect(JSON.stringify(exported)).not.toContain('character-1');

    const [roundTripped] = parseStorySeedJson(JSON.stringify(exported));
    expect(roundTripped.story.storyTags).toEqual(seed.story.storyTags);
    expect(roundTripped.world.optional.title).toBe(seed.world.optional.title);
    expect(createStorySeedCollectionExport([seed]).seeds).toHaveLength(1);

    const [migrated] = parseStorySeedJson(JSON.stringify({ intake, blueprint }));
    expect(migrated).toMatchObject({
      creator: {},
      story: { storyTags: intake.storyTags, premise: intake.corePremise },
      world: { optional: { title: blueprint.title } },
    });
  });

  it('saves, loads, and updates an account-owned seed record', async () => {
    const seed = createStorySeedInput(intake, blueprint);
    const created = await createStorySeed('creator-1', seed);
    expect(await listStorySeeds('creator-1')).toEqual([created]);
    expect(await listStorySeeds('creator-2')).toEqual([]);

    const changed = {
      ...seed,
      story: { ...seed.story, premise: 'The updated required premise.' },
    };
    const updated = await updateStorySeed('creator-1', created, changed);
    expect((await listStorySeeds('creator-1'))[0].story.premise).toBe('The updated required premise.');
    await expect(updateStorySeed('creator-2', updated, changed)).rejects.toThrow('another account');
  });

  it('keeps the minimal administrative spine separate from Creator / Story / World', () => {
    const metadata = createStoryAdministrativeMetadata({
      storyId: 'story-1',
      creatorId: 'creator-1',
      sourceSeedId: 'seed-1',
      originalLanguage: 'en',
      now: '2026-08-01T00:00:00.000Z',
    });

    expect(metadata).toEqual({
      storyId: 'story-1',
      creatorId: 'creator-1',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      schemaVersion: 1,
      contentVersion: 1,
      storyStatus: 'DRAFT',
      generationStatus: 'QUEUED',
      visibility: 'PRIVATE',
      publishingState: 'UNPUBLISHED',
      originalLanguage: 'en',
      currentLanguage: 'en',
      sourceSeedId: 'seed-1',
      currentChapterId: null,
      coverAssetId: null,
    });
    expect(validateStoryAdministrativeMetadata(metadata)).toEqual({ valid: true, errors: [] });
    expect(createStorySeedInput(intake, blueprint)).not.toHaveProperty('administrative');
  });

  it('places required Story Tags and administrative references in generation requests', () => {
    const seed = createStorySeedInput(intake, blueprint);
    const administrative = createStoryAdministrativeMetadata({
      storyId: 'story-1',
      creatorId: 'creator-1',
      sourceSeedId: 'seed-1',
      originalLanguage: 'en',
    });
    const blueprintRequest = buildBlueprintGenerationPayload(seed);
    const storyRequest = buildInitialStoryGenerationPayload(seed, administrative, blueprint, 10);

    expect(blueprintRequest.storySeed.story.storyTags).toEqual(['death flags', 'foreknowledge']);
    expect(storyRequest.storySeed.story.storyTags).toEqual(['death flags', 'foreknowledge']);
    expect(storyRequest).toMatchObject({
      chapterCount: 10,
      administrative: {
        storyId: 'story-1',
        creatorId: 'creator-1',
        sourceSeedId: 'seed-1',
        currentChapterId: null,
        coverAssetId: null,
      },
    });
    expect(storyRequest.storySeed).not.toHaveProperty('intake');
    expect(storyRequest.storySeed).not.toHaveProperty('administrative');
  });
});
