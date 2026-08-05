import { beforeEach, describe, expect, it } from 'vitest';
import type { WorldBlueprint } from './types';
import {
  applyInferredStoryTags,
  buildBlueprintGenerationPayload,
  buildInitialStoryGenerationPayload,
  createEmptyStorySeedInput,
  normalizeStorySeedInput,
  validateStorySeedDraft,
  validateStorySeedInput,
  type StorySeedInput,
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

const completeSeed = (): StorySeedInput => ({
  creator: {},
  story: {
    required: {
      storyTags: ['death flags', 'foreknowledge'],
      premise: 'A prince must survive the seven timelines that say he dies.',
      genre: 'Xianxia',
      style: 'chinese',
    },
    optional: {
      plotAndTropeSettings: {
        faceSlap: 'low',
        plotArmor: 'high',
        recognition: 'medium',
        longTermGoal: 'Break the assassination cycle',
        firstMajorConflict: 'The sect tournament',
        mainAntagonistPressure: 'The celestial court',
      },
      additionalStoryDirection: 'Escalating court intrigue.',
      makeItWorkInstruction: 'The weakest bloodline is secretly the only one heaven fears.',
    },
  },
  world: {
    required: {},
    optional: {
      worldIdentity: {
        title: 'Ashes of the Ninth Meridian',
        worldType: 'Ancient sect world',
        societyStructure: 'Sect-led feudal hierarchy',
        startingLocation: 'Outer sect quarry',
      },
      worldFoundations: {
        mainCharacter: { name: 'Ye Chen', personality: 'Protective and ruthless' },
        additionalCharacters: [{ id: 'character-1', name: 'Elder Qin' }],
        factions: [{ id: 'faction-1', name: 'Heavenly Sword Sect' }],
        abilities: { startingPowerConcept: 'Qi Condensation', uniquePath: 'Fate severing' },
        powerSystem: { flavor: 'Daoist martial arts', knownRanks: 'Qi Condensation > Foundation' },
        destinedEnding: 'The prince survives and severs the court from fate.',
      },
    },
  },
});

const administrative = () => createStoryAdministrativeMetadata({
  storyId: 'story-1',
  creatorId: 'creator-1',
  sourceSeedId: 'seed-1',
  originalLanguage: 'en',
});

describe('Story Seed creator/story/world contract', () => {
  beforeEach(() => resetStorySeedRepository());

  it('exposes exactly the approved hierarchy and nothing else', () => {
    const seed = normalizeStorySeedInput(completeSeed());

    expect(Object.keys(seed).sort()).toEqual(['creator', 'story', 'world']);
    expect(Object.keys(seed.story).sort()).toEqual(['optional', 'required']);
    expect(Object.keys(seed.world).sort()).toEqual(['optional', 'required']);
    expect(Object.keys(seed.story.required).sort()).toEqual(['genre', 'premise', 'storyTags', 'style']);
    expect(Object.keys(seed.story.optional).sort()).toEqual([
      'additionalStoryDirection',
      'makeItWorkInstruction',
      'plotAndTropeSettings',
    ]);
    expect(seed.story.optional.plotAndTropeSettings).toMatchObject({
      faceSlap: 'low',
      plotArmor: 'high',
      recognition: 'medium',
    });
    expect(Object.keys(seed.world.optional).sort()).toEqual(['worldFoundations', 'worldIdentity']);
    // World has no required creator inputs, but the family still exists.
    expect(seed.world.required).toEqual({});
  });

  it('lets a draft save with no creative data at all, and with an empty World', () => {
    const empty = createEmptyStorySeedInput();
    expect(validateStorySeedDraft(empty)).toEqual({ valid: true, errors: [] });
    expect(empty.story.required).toEqual({ storyTags: [], premise: '', genre: '', style: '' });
    expect(empty.story.optional.plotAndTropeSettings).toEqual({
      faceSlap: 'medium',
      plotArmor: 'medium',
      recognition: 'medium',
    });
    expect(empty.story.optional.makeItWorkInstruction).toBeUndefined();
    expect(empty.world).toEqual({ required: {}, optional: { worldIdentity: {}, worldFoundations: {} } });

    // A generation-ready Story with a completely empty World is valid.
    const worldless: StorySeedInput = {
      ...empty,
      story: {
        required: {
          storyTags: ['death flags'],
          premise: 'A doomed prince gets one final timeline.',
          genre: 'Xianxia',
          style: 'korean',
        },
        optional: { plotAndTropeSettings: {} },
      },
    };
    expect(validateStorySeedInput(worldless)).toEqual({ valid: true, errors: [] });
    expect(buildBlueprintGenerationPayload(worldless).storySeed.world.optional).toEqual({
      worldIdentity: {},
      worldFoundations: {},
    });
  });

  it('treats Story Tags, Premise, Genre, and Style as the required Story inputs', () => {
    expect(validateStorySeedInput(createEmptyStorySeedInput())).toEqual({
      valid: false,
      errors: [
        'Style is required.',
        'Genre is required.',
        'Premise is required.',
        'Story Tags are required.',
      ],
    });
  });

  it('accepts only the three novel traditions as Style', () => {
    const withStyle = (style: string): unknown => ({
      ...completeSeed(),
      story: { ...completeSeed().story, required: { ...completeSeed().story.required, style } },
    });
    for (const tradition of ['chinese', 'korean', 'japanese']) {
      expect(validateStorySeedInput(withStyle(tradition)).valid).toBe(true);
      expect(normalizeStorySeedInput(withStyle(tradition)).story.required.style).toBe(tradition);
    }
    // Labels normalize to the stable value; freeform prose never counts.
    expect(normalizeStorySeedInput(withStyle('Japanese')).story.required.style).toBe('japanese');
    expect(validateStorySeedInput(withStyle('Lush, poetic narration')).errors).toEqual(['Style is required.']);
    expect(normalizeStorySeedInput(withStyle('Lush, poetic narration')).story.required.style).toBe('');
  });

  it('normalizes missing and legacy story-sauce values to medium', () => {
    const missing = normalizeStorySeedInput({
      ...completeSeed(),
      story: {
        ...completeSeed().story,
        optional: { plotAndTropeSettings: {} },
      },
    });
    expect(missing.story.optional.plotAndTropeSettings).toEqual({
      faceSlap: 'medium',
      plotArmor: 'medium',
      recognition: 'medium',
    });

    const legacy = normalizeStorySeedInput({
      ...completeSeed(),
      story: {
        ...completeSeed().story,
        optional: {
          plotAndTropeSettings: {
            faceSlap: 'HIGH',
            plotArmor: 'extreme',
            recognition: null,
          },
        },
      },
    });
    expect(legacy.story.optional.plotAndTropeSettings).toEqual({
      faceSlap: 'high',
      plotArmor: 'medium',
      recognition: 'medium',
    });
  });

  it('keeps Make It Work optional and normalizes missing or blank values to empty', () => {
    const missing = normalizeStorySeedInput({
      ...completeSeed(),
      story: {
        ...completeSeed().story,
        optional: { plotAndTropeSettings: {} },
      },
    });
    expect(missing.story.optional.makeItWorkInstruction).toBeUndefined();
    expect(validateStorySeedInput(missing)).toEqual({ valid: true, errors: [] });

    const blank = normalizeStorySeedInput({
      ...completeSeed(),
      story: {
        ...completeSeed().story,
        optional: {
          ...completeSeed().story.optional,
          makeItWorkInstruction: '   ',
        },
      },
    });
    expect(blank.story.optional.makeItWorkInstruction).toBeUndefined();
    expect(validateStorySeedInput(blank)).toEqual({ valid: true, errors: [] });
  });

  it('infers Story Tags from Premise, Genre, and Style so they never block generation', () => {
    const untagged = normalizeStorySeedInput({
      ...completeSeed(),
      story: { ...completeSeed().story, required: { ...completeSeed().story.required, storyTags: [] } },
    });
    expect(untagged.story.required.storyTags).toEqual([]);

    const inferred = applyInferredStoryTags(untagged).story.required.storyTags;
    expect(inferred.length).toBeGreaterThan(0);
    expect(inferred).toContain('cultivation realms');
    expect(inferred).toContain('destined death');

    // The inferred set reaches both generation entry points despite Story Tags
    // being a required field.
    expect(buildBlueprintGenerationPayload(untagged).storySeed.story.required.storyTags).toEqual(inferred);
    expect(
      buildInitialStoryGenerationPayload(untagged, administrative(), blueprint, 10)
        .storySeed.story.required.storyTags,
    ).toEqual(inferred);
  });

  it('preserves manually chosen Story Tags untouched', () => {
    const seed = completeSeed();
    expect(applyInferredStoryTags(seed).story.required.storyTags).toEqual(['death flags', 'foreknowledge']);
    expect(buildBlueprintGenerationPayload(seed).storySeed.story.required.storyTags)
      .toEqual(['death flags', 'foreknowledge']);
  });

  it('drops Fate Survival controls, experience dials, and Blueprint output', () => {
    const seed = normalizeStorySeedInput({
      ...completeSeed(),
      story: {
        required: { ...completeSeed().story.required, hardcoreFateMode: true, fatePressure: 'Hardcore' },
        optional: {
          ...completeSeed().story.optional,
          hardcoreFateMode: true,
          fatePressure: 'Hardcore',
          romanceLevel: 'Single heroine',
          faceSlappingLevel: 'High',
          comedyLevel: 'Dry',
          haremPreference: 'None',
          betrayalLevel: 'Moderate',
          dangerLevel: 'Relentless',
          generalAtmosphere: 'Ominous',
          powerPace: 'Slow burn',
          logline: blueprint.logline,
          firstArcPromise: blueprint.firstArcPromise,
          tropeRules: blueprint.tropeRules,
          unresolvedPlotThreads: blueprint.unresolvedPlotThreads,
          estimatedArcs: 7,
        },
      },
      world: {
        required: {},
        optional: {
          worldIdentity: { ...completeSeed().world.optional.worldIdentity, universe: blueprint.worldOverview },
          worldFoundations: {
            ...completeSeed().world.optional.worldFoundations,
            majorMysteries: blueprint.majorMysteries,
          },
        },
      },
    });

    const serialized = JSON.stringify(seed);
    for (const removed of [
      'hardcoreFateMode', 'fatePressure', 'romanceLevel', 'faceSlappingLevel', 'comedyLevel',
      'haremPreference', 'betrayalLevel', 'dangerLevel', 'generalAtmosphere', 'powerPace',
      'logline', 'firstArcPromise', 'tropeRules', 'unresolvedPlotThreads', 'estimatedArcs',
      'universe', 'majorMysteries',
    ]) {
      expect(serialized).not.toContain(removed);
    }
  });

  it('serializes only creator/story/world and round-trips portable files', () => {
    const seed = completeSeed();
    const exported = createStorySeedExport(seed);
    expect(exported).toMatchObject({ format: 'seihouse-story-seed', version: 3 });
    expect(Object.keys(exported.seed).sort()).toEqual(['creator', 'story', 'world']);
    expect(exported.seed).not.toHaveProperty('intake');
    expect(exported.seed).not.toHaveProperty('blueprint');
    // Local entity ids never leave the account.
    expect(JSON.stringify(exported)).not.toContain('character-1');

    const [roundTripped] = parseStorySeedJson(JSON.stringify(exported));
    expect(roundTripped.story.required).toEqual(seed.story.required);
    expect(roundTripped.story.optional.plotAndTropeSettings)
      .toEqual(seed.story.optional.plotAndTropeSettings);
    expect(roundTripped.story.optional.makeItWorkInstruction)
      .toBe('The weakest bloodline is secretly the only one heaven fears.');
    expect(roundTripped.world.optional.worldIdentity).toEqual(seed.world.optional.worldIdentity);
    expect(createStorySeedCollectionExport([seed]).seeds).toHaveLength(1);
  });

  it('imports a pre-hierarchy file through the isolated legacy adapter', () => {
    const legacy = {
      intake: {
        novelTitle: 'Ashes of the Ninth Meridian',
        mcName: 'Ye Chen',
        genrePath: 'Xianxia',
        corePremise: 'A prince must survive the seven timelines that say he dies.',
        proseStyle: 'chinese',
        storyTags: ['death flags'],
        desiredPlotDirection: 'Escalating court intrigue.',
        makeItWorkInstruction: 'Never erase the cost of changing fate.',
        longTermGoal: 'Break the assassination cycle',
        worldType: 'Ancient sect world',
        startingPowerConcept: 'Qi Condensation',
        powerFlavor: 'Daoist martial arts',
        customFactions: [{ id: 'faction-1', name: 'Heavenly Sword Sect' }],
        destinedEnding: 'The prince survives.',
        // Everything below must be dropped on the way in.
        hardcoreFateMode: true,
        fatePressure: 'Hardcore',
        romanceLevel: 'Single heroine',
        dangerLevel: 'Relentless',
      },
      blueprint,
    };

    const [migrated] = parseStorySeedJson(JSON.stringify(legacy));
    expect(migrated.story.required).toEqual({
      storyTags: ['death flags'],
      premise: 'A prince must survive the seven timelines that say he dies.',
      genre: 'Xianxia',
      style: 'chinese',
    });
    // General direction consolidates, while Make It Work keeps its own path.
    expect(migrated.story.optional.additionalStoryDirection)
      .toBe('Escalating court intrigue.');
    expect(migrated.story.optional.makeItWorkInstruction)
      .toBe('Never erase the cost of changing fate.');
    expect(migrated.story.optional.plotAndTropeSettings).toEqual({
      longTermGoal: 'Break the assassination cycle',
      faceSlap: 'medium',
      plotArmor: 'medium',
      recognition: 'medium',
    });
    expect(migrated.world.optional.worldIdentity.title).toBe('Ashes of the Ninth Meridian');
    expect(migrated.world.optional.worldFoundations.mainCharacter).toEqual({ name: 'Ye Chen' });
    expect(migrated.world.optional.worldFoundations.factions?.[0].name).toBe('Heavenly Sword Sect');
    expect(JSON.stringify(migrated)).not.toContain('fatePressure');
    expect(JSON.stringify(migrated)).not.toContain('Relentless');
  });

  it('persists an incomplete draft and reloads it', async () => {
    const draft: StorySeedInput = {
      ...createEmptyStorySeedInput(),
      story: {
        required: { storyTags: [], premise: 'Only the premise so far.', genre: '', style: '' },
        optional: { plotAndTropeSettings: {} },
      },
    };
    const saved = await createStorySeed('creator-1', draft);
    expect(saved.seed.story.required).toEqual({
      storyTags: [], premise: 'Only the premise so far.', genre: '', style: '',
    });

    const [reloaded] = await listStorySeeds('creator-1');
    expect(reloaded.seed.story.required.premise).toBe('Only the premise so far.');
    expect(reloaded.seed.story.optional.plotAndTropeSettings).toEqual({
      faceSlap: 'medium',
      plotArmor: 'medium',
      recognition: 'medium',
    });
    expect(reloaded.seed.world.optional).toEqual({ worldIdentity: {}, worldFoundations: {} });
  });

  it('saves, loads, and updates an account-owned record without touching the seed families', async () => {
    const seed = completeSeed();
    const created = await createStorySeed('creator-1', seed);
    expect(await listStorySeeds('creator-1')).toEqual([created]);
    expect(created.seed.story.optional.plotAndTropeSettings).toMatchObject({
      faceSlap: 'low',
      plotArmor: 'high',
      recognition: 'medium',
    });
    expect(created.seed.story.optional.makeItWorkInstruction)
      .toBe('The weakest bloodline is secretly the only one heaven fears.');
    expect(await listStorySeeds('creator-2')).toEqual([]);

    // Account metadata lives on the record, never inside creator/story/world.
    expect(Object.keys(created.seed).sort()).toEqual(['creator', 'story', 'world']);
    expect(created).toMatchObject({ id: expect.any(String), userId: 'creator-1', schemaVersion: 3 });

    const changed: StorySeedInput = {
      ...seed,
      story: { ...seed.story, required: { ...seed.story.required, premise: 'The updated required premise.' } },
    };
    const updated = await updateStorySeed('creator-1', created, changed);
    expect((await listStorySeeds('creator-1'))[0].seed.story.required.premise)
      .toBe('The updated required premise.');
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
    expect(completeSeed()).not.toHaveProperty('administrative');
  });

  it('hands generation payload builders the canonical structure', () => {
    const seed = completeSeed();
    const blueprintRequest = buildBlueprintGenerationPayload(seed);
    const storyRequest = buildInitialStoryGenerationPayload(seed, administrative(), blueprint, 10);

    for (const request of [blueprintRequest, storyRequest]) {
      expect(Object.keys(request.storySeed).sort()).toEqual(['creator', 'story', 'world']);
      expect(request.storySeed.story.required.storyTags).toEqual(['death flags', 'foreknowledge']);
      expect(request.storySeed.story.optional.plotAndTropeSettings).toMatchObject({
        faceSlap: 'low',
        plotArmor: 'high',
        recognition: 'medium',
      });
      expect(request.storySeed.story.optional.makeItWorkInstruction)
        .toBe('The weakest bloodline is secretly the only one heaven fears.');
      expect(request.storySeed).not.toHaveProperty('intake');
      expect(request.storySeed).not.toHaveProperty('administrative');
    }
    expect(storyRequest).toMatchObject({
      chapterCount: 10,
      administrative: { storyId: 'story-1', creatorId: 'creator-1', sourceSeedId: 'seed-1' },
    });
  });
});
