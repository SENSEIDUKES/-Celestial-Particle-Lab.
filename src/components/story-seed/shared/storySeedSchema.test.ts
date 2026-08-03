import { beforeEach, describe, expect, it } from 'vitest';
import type { IntakeData, WorldBlueprint } from './types';
import {
  applyInferredStoryTags,
  buildBlueprintGenerationPayload,
  buildInitialStoryGenerationPayload,
  createStorySeedInput,
  normalizeStorySeedInput,
  storySeedToIntake,
  validateStorySeedDraft,
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
  novelTitle: 'Ashes of the Ninth Meridian',
  mcName: 'Ye Chen',
  genrePath: 'Xianxia',
  corePremise: 'A prince must survive the seven timelines that say he dies.',
  proseStyle: 'chinese',
  storyTags: ['death flags', 'foreknowledge'],
  desiredPlotDirection: 'Escalating court intrigue.',
  destinedEnding: 'The prince survives and severs the court from fate.',
  estimatedArcs: 7,
  worldType: 'Ancient sect world',
  startingLocation: 'Outer sect quarry',
  societyStructure: 'Sect-led feudal hierarchy',
  dangerLevel: 'Relentless',
  generalAtmosphere: 'Ominous and intimate',
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
  styleBible: 'korean',
  destinedEnding: 'The prince survives and severs the court from fate.',
  estimatedArcs: 7,
  unresolvedPlotThreads: ['Identify the court infiltrator'],
};

describe('Story Seed creator/story/world contract', () => {
  beforeEach(() => resetStorySeedRepository());

  it('lets a draft save with no creative data at all', () => {
    const emptyDraft = createStorySeedInput({});
    expect(validateStorySeedDraft(emptyDraft)).toEqual({ valid: true, errors: [] });
    expect(emptyDraft.story).toMatchObject({ storyTags: [], premise: '', genre: '', style: '' });
  });

  it('requires only Style, Genre, and Premise for generation, in that order', () => {
    const generationReady = {
      creator: {},
      story: {
        storyTags: [],
        premise: 'A doomed prince gets one final timeline.',
        genre: 'Xianxia',
        style: 'korean',
        optional: {},
      },
      world: { optional: {} },
    };
    // Empty Story Tags and an empty World are both valid.
    expect(validateStorySeedInput(generationReady)).toEqual({ valid: true, errors: [] });

    const empty = {
      story: { storyTags: [], premise: '', genre: '', style: '', optional: {} },
      world: { optional: {} },
    };
    expect(validateStorySeedInput(empty)).toEqual({
      valid: false,
      errors: [
        'Creator is required.',
        'Style is required.',
        'Genre is required.',
        'Premise is required.',
      ],
    });
  });

  it('accepts only the three novel traditions as Style', () => {
    const withStyle = (style: string) => ({
      creator: {},
      story: { storyTags: [], premise: 'A premise.', genre: 'Xianxia', style, optional: {} },
      world: { optional: {} },
    });
    for (const tradition of ['chinese', 'korean', 'japanese']) {
      expect(validateStorySeedInput(withStyle(tradition)).valid).toBe(true);
      expect(normalizeStorySeedInput(withStyle(tradition)).story.style).toBe(tradition);
    }
    // Labels normalize to the stable value; freeform prose never counts.
    expect(normalizeStorySeedInput(withStyle('Japanese')).story.style).toBe('japanese');
    expect(validateStorySeedInput(withStyle('Lush, poetic narration')).errors).toEqual(['Style is required.']);
    expect(normalizeStorySeedInput(withStyle('Lush, poetic narration')).story.style).toBe('');
  });

  it('infers Story Tags from Premise, Genre, and Style when they are left empty', () => {
    const untagged = createStorySeedInput({ ...intake, storyTags: [] });
    expect(untagged.story.storyTags).toEqual([]);

    const inferred = applyInferredStoryTags(untagged).story.storyTags;
    expect(inferred.length).toBeGreaterThan(0);
    // Genre tags plus fate ingredients read out of the premise — fate tags
    // survive even though Fate Survival is no longer a genre.
    expect(inferred).toContain('cultivation realms');
    expect(inferred).toContain('destined death');

    // The inferred set reaches both generation entry points.
    expect(buildBlueprintGenerationPayload(untagged).storySeed.story.storyTags).toEqual(inferred);
    const administrative = createStoryAdministrativeMetadata({
      storyId: 'story-1',
      creatorId: 'creator-1',
      sourceSeedId: 'seed-1',
      originalLanguage: 'en',
    });
    expect(
      buildInitialStoryGenerationPayload(untagged, administrative, blueprint, 10).storySeed.story.storyTags,
    ).toEqual(inferred);
  });

  it('preserves manually chosen Story Tags untouched', () => {
    const seed = createStorySeedInput(intake, blueprint);
    expect(seed.story.storyTags).toEqual(['death flags', 'foreknowledge']);
    expect(applyInferredStoryTags(seed).story.storyTags).toEqual(['death flags', 'foreknowledge']);
    expect(buildBlueprintGenerationPayload(seed).storySeed.story.storyTags)
      .toEqual(['death flags', 'foreknowledge']);
  });

  it('never fills Style from a hidden default', () => {
    const { proseStyle: _proseStyle, ...styleless } = intake;
    expect(createStorySeedInput(styleless).story.style).toBe('');
    expect(validateStorySeedInput(createStorySeedInput(styleless)).errors).toEqual(['Style is required.']);
    // A reused blueprint carries a tradition over; legacy prose text does not.
    expect(createStorySeedInput(styleless, blueprint).story.style).toBe('korean');
    expect(
      createStorySeedInput(styleless, { ...blueprint, styleBible: 'Terse, ominous close-third prose.' }).story.style,
    ).toBe('');
  });

  it('classifies every legacy intake and blueprint field into Creator, Story, or World', () => {
    const seed = createStorySeedInput(intake, blueprint);

    expect(seed.creator).toEqual({});
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
      majorMysteries: blueprint.majorMysteries,
    });
    expect(seed.world.optional.additionalCharacters?.map(character => character.name)).toEqual(['Elder Qin', 'Ninth Prince']);
    expect(seed.world.optional.factions?.map(faction => faction.name)).toEqual(['Heavenly Sword Sect', 'Celestial Court']);
  });

  it('round-trips Style and the World families through the intake view model', () => {
    const seed = createStorySeedInput(intake, blueprint);
    const restored = storySeedToIntake(seed);
    expect(restored.proseStyle).toBe(intake.proseStyle);
    expect(restored.genrePath).toBe(intake.genrePath);
    expect(restored.corePremise).toBe(intake.corePremise);
    expect(restored.storyTags).toEqual(intake.storyTags);
    expect(restored.worldType).toBe(intake.worldType);
    expect(restored.customFactions?.map(faction => faction.name)).toContain('Heavenly Sword Sect');
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

  it('persists an incomplete draft and reloads it', async () => {
    const draft = createStorySeedInput({ corePremise: 'Only the premise so far.' });
    const saved = await createStorySeed('creator-1', draft);
    expect(saved.story).toMatchObject({ premise: 'Only the premise so far.', genre: '', style: '', storyTags: [] });

    const [reloaded] = await listStorySeeds('creator-1');
    expect(reloaded.story.premise).toBe('Only the premise so far.');
    expect(reloaded.world.optional).toEqual({});
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

  it('places the final Story Tags and administrative references in generation requests', () => {
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
