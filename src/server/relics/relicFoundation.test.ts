import { describe, expect, it } from 'vitest';
import {
  InMemoryRelicRepository,
  MAX_RELIC_QI_REWARD,
  RelicEvaluationService,
  RelicEvaluatorRegistry,
  RelicValidationError,
  discloseRelicCondition,
  type CreateRelicTemplateCommand,
  type RelicAchievementEvaluator,
} from './index';

const templateDefinition = (): CreateRelicTemplateCommand => ({
  id: 'template-hidden-path',
  key: 'hidden-path',
  status: 'active',
  name: 'Footprints Beyond the Veil',
  description: 'Complete the assigned hidden path in this story.',
  rarity: 'Mythic',
  condition: {
    evaluatorKey: 'test.chapter-count',
    evaluatorVersion: 1,
    hidden: true,
    parameters: { requiredChapters: 3 },
  },
  rewards: {
    title: {
      key: 'veil-walker',
      title: 'Veil Walker',
      description: 'Found a path the heavens concealed.',
    },
    qi: 75,
    cosmetics: [{
      key: 'veil-profile-aura',
      kind: 'profile-aura',
      label: 'Veil Aura',
      metadata: { palette: 'moonlit-jade', intensity: 'subtle' },
    }],
  },
});

const makeRepository = () => {
  let nextId = 0;
  let nextTime = 0;
  return new InMemoryRelicRepository({
    idFactory: kind => `${kind}-${++nextId}`,
    now: () => new Date(Date.UTC(2026, 7, 4, 12, 0, nextTime++)).toISOString(),
  });
};

describe('Relic v3 backend foundation', () => {
  it('supports hidden conditions and bounded title, Qi, and cosmetic rewards', async () => {
    const repository = makeRepository();
    const template = await repository.createTemplate(templateDefinition());

    expect(template.rarity).toBe('Mythic');
    expect(template.rewards.title?.title).toBe('Veil Walker');
    expect(template.rewards.qi).toBe(75);
    expect(template.rewards.cosmetics[0].metadata).toEqual({
      palette: 'moonlit-jade',
      intensity: 'subtle',
    });
    expect(discloseRelicCondition(template.condition, false)).toEqual({ hidden: true });
    expect(discloseRelicCondition(template.condition, true)).toMatchObject({
      hidden: false,
      evaluatorKey: 'test.chapter-count',
      parameters: { requiredChapters: 3 },
    });

    await expect(repository.createTemplate({
      ...templateDefinition(),
      id: 'template-excessive-qi',
      key: 'excessive-qi',
      rewards: { ...templateDefinition().rewards, qi: MAX_RELIC_QI_REWARD + 1 },
    })).rejects.toBeInstanceOf(RelicValidationError);
  });

  it('snapshots a reusable template independently for each story', async () => {
    const repository = makeRepository();
    const template = await repository.createTemplate(templateDefinition());
    const first = await repository.assignToStory({
      ownerId: 'creator-1',
      storyId: 'story-1',
      templateId: template.id,
      progressTarget: 3,
      progressUnit: 'chapters',
    });
    const repeatedAssignment = await repository.assignToStory({
      ownerId: 'creator-1',
      storyId: 'story-1',
      templateId: template.id,
    });
    expect(repeatedAssignment.id).toBe(first.id);

    await repository.updateTemplate({
      templateId: template.id,
      expectedVersion: 1,
      definition: {
        status: 'active',
        name: 'A Revised Veiled Path',
        description: template.description,
        rarity: template.rarity,
        condition: template.condition,
        rewards: { ...templateDefinition().rewards, qi: 100 },
      },
    });

    const second = await repository.assignToStory({
      ownerId: 'creator-1',
      storyId: 'story-2',
      templateId: template.id,
    });
    expect(first.achievement).toMatchObject({ templateVersion: 1, name: 'Footprints Beyond the Veil' });
    expect(first.achievement.rewards.qi).toBe(75);
    expect(second.achievement).toMatchObject({ templateVersion: 2, name: 'A Revised Veiled Path' });
    expect(second.achievement.rewards.qi).toBe(100);
  });

  it('keeps evaluation modular and earns only once per achievement per story', async () => {
    const repository = makeRepository();
    const template = await repository.createTemplate(templateDefinition());
    const storyOne = await repository.assignToStory({
      ownerId: 'creator-1',
      storyId: 'story-1',
      templateId: template.id,
      progressTarget: 3,
      progressUnit: 'chapters',
    });

    const evaluator: RelicAchievementEvaluator = {
      key: 'test.chapter-count',
      version: 1,
      evaluate: ({ assignment, observation }) => {
        const increment = Number(observation.facts.increment ?? 0);
        const current = Math.min(assignment.progress.target, assignment.progress.current + increment);
        if (current < assignment.progress.target) {
          return {
            kind: 'progress',
            current,
            target: assignment.progress.target,
            unit: assignment.progress.unit,
            metadata: { lastObservationId: observation.id },
          };
        }
        return {
          kind: 'complete',
          current,
          target: assignment.progress.target,
          unit: assignment.progress.unit,
          metadata: { lastObservationId: observation.id },
          evidence: {
            sourceType: observation.type,
            sourceId: observation.id,
            facts: { completedAtChapter: observation.facts.chapterNumber ?? null },
          },
        };
      },
    };
    const registry = new RelicEvaluatorRegistry();
    registry.register(evaluator);
    const service = new RelicEvaluationService(repository, registry);

    const progress = await service.evaluate({
      ownerId: 'creator-1',
      storyId: 'story-1',
      assignmentId: storyOne.id,
      observation: {
        type: 'chapter-sealed',
        id: 'chapter-1',
        occurredAt: '2026-08-04T13:00:00.000Z',
        facts: { increment: 1, chapterNumber: 1 },
      },
    });
    expect(progress).toMatchObject({
      kind: 'updated',
      assignment: { status: 'in_progress', progress: { current: 1, target: 3 } },
      earnedRelic: null,
    });

    const completed = await service.evaluate({
      ownerId: 'creator-1',
      storyId: 'story-1',
      assignmentId: storyOne.id,
      observation: {
        type: 'chapter-sealed',
        id: 'chapter-3',
        occurredAt: '2026-08-04T13:02:00.000Z',
        facts: { increment: 2, chapterNumber: 3 },
      },
    });
    expect(completed).toMatchObject({
      kind: 'updated',
      assignment: { status: 'earned', progress: { current: 3, target: 3 } },
      earningCreated: true,
      earnedRelic: {
        storyId: 'story-1',
        achievement: { templateKey: 'hidden-path', rarity: 'Mythic' },
        completionEvidence: [{
          evaluatorKey: 'test.chapter-count',
          evaluatorVersion: 1,
          sourceType: 'chapter-sealed',
          sourceId: 'chapter-3',
          facts: { completedAtChapter: 3 },
        }],
      },
    });

    const retry = await service.evaluate({
      ownerId: 'creator-1',
      storyId: 'story-1',
      assignmentId: storyOne.id,
      observation: {
        type: 'chapter-sealed',
        id: 'chapter-3-retry',
        occurredAt: '2026-08-04T13:03:00.000Z',
        facts: { increment: 1, chapterNumber: 3 },
      },
    });
    expect(retry).toMatchObject({ kind: 'updated', earningCreated: false });
    expect(await repository.listEarnedRelics('creator-1', 'story-1')).toHaveLength(1);

    const storyTwo = await repository.assignToStory({
      ownerId: 'creator-1',
      storyId: 'story-2',
      templateId: template.id,
      progressTarget: 1,
    });
    await service.evaluate({
      ownerId: 'creator-1',
      storyId: 'story-2',
      assignmentId: storyTwo.id,
      observation: {
        type: 'chapter-sealed',
        id: 'story-2-chapter-1',
        occurredAt: '2026-08-04T14:00:00.000Z',
        facts: { increment: 1, chapterNumber: 1 },
      },
    });
    expect(await repository.listEarnedRelics('creator-1')).toHaveLength(2);
  });

  it('keeps story assignment access owner-scoped', async () => {
    const repository = makeRepository();
    const template = await repository.createTemplate(templateDefinition());
    const assignment = await repository.assignToStory({
      ownerId: 'creator-1',
      storyId: 'story-1',
      templateId: template.id,
    });

    expect(await repository.getStoryAssignment('creator-2', 'story-1', assignment.id)).toBeNull();
    await expect(repository.assignToStory({
      ownerId: 'creator-2',
      storyId: 'story-1',
      templateId: template.id,
    })).rejects.toThrow('scoped to another owner');
    await expect(repository.applyEvaluation({
      ownerId: 'creator-2',
      storyId: 'story-1',
      assignmentId: assignment.id,
      progress: { current: 1, target: 1, metadata: {} },
      evaluatedAt: '2026-08-04T15:00:00.000Z',
    })).rejects.toThrow('was not found');
  });
});
