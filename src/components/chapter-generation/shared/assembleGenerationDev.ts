/** Development adapter for the shared four-stage Chapter Generation pipeline. */
import type { ScenarioId } from "./assembleGeneration";
import { RHYTHM_SCENARIOS, SCENARIOS } from "./fixtures/mockGenerationData";
import type { SceneType } from "./lib/sceneRhythm";
import { assembleChapterGenerationPacket } from "./packets";
import {
  assembleChapterPacket,
  buildWorkshopChapterPlan,
  buildWorkshopProcessingResult,
  runChapterPipeline,
  type ChapterPipelineRun,
  type CulturalProseOverride,
} from "./pipeline";
import type { ChapterContent, ChapterHandoff, StoryBlock } from "./types";

export type { CulturalProseOverride } from "./pipeline";

export function assembleChapterGenerationDev(
  scenarioId: ScenarioId,
  rhythmScenarioId: string,
  proseOverride: CulturalProseOverride,
): ChapterPipelineRun {
  const scenario = SCENARIOS[scenarioId];
  const rhythmScenario = RHYTHM_SCENARIOS.find(candidate =>
    candidate.id === rhythmScenarioId) ?? RHYTHM_SCENARIOS[0];
  const chapterPacket = assembleChapterPacket(
    assembleChapterGenerationPacket(scenario, {
      recentSceneTypes: rhythmScenario.recentSceneTypes,
    }),
    { culturalProseOverride: proseOverride },
  );

  return runChapterPipeline({
    chapterPacket,
    planningSignals: {
      fatePressureTier: rhythmScenario.fatePressure,
    },
    model: {
      planChapter: buildWorkshopChapterPlan,
      manifestChapter: ({ chapterPlan }) => buildMockManifestedChapterDev({
        scenario,
        sceneTypeUsed: chapterPlan.selectedScenePath?.type ?? "worldBuilding",
      }),
      processResult: modelInput => buildWorkshopProcessingResult(
        modelInput,
        buildMockProcessingHandoffDev(
          scenario,
          modelInput.chapterPlan.selectedScenePath?.type ?? "worldBuilding",
        ),
      ),
      repairChapter: ({ manifestedChapter }) => manifestedChapter,
    },
  });
}

function buildMockManifestedChapterDev(input: {
  scenario: (typeof SCENARIOS)[ScenarioId];
  sceneTypeUsed: SceneType;
}): ChapterContent {
  const { scenario, sceneTypeUsed } = input;
  const chapterNumber = scenario.currentChapter.number;
  const blocks: StoryBlock[] = scenario.id === "opening"
    ? [
        {
          id: "c1-dev-p1",
          type: "paragraph",
          text: "Dust hung gold in the shaft of light through the tomb's broken roof, and Wen Shu had already swept the same corner three times just to avoid touching the altar at its center.",
          metadata: { mode: "narration", sceneType: "exploration", emotion: "wary", intensity: 0.3, tension: 0.25 },
        },
        {
          id: "c1-dev-p2",
          type: "paragraph",
          text: "It was the altar's shadow that gave it away — a seam in the stone too straight to be an accident. Wen Shu's fingers found the manual before his mind caught up to what he was doing.",
          metadata: { mode: "narration", emotion: "startled", intensity: 0.55, tension: 0.5, mysticism: 0.6 },
        },
      ]
    : [
        {
          id: "c6-dev-p1",
          type: "paragraph",
          text: `Directed toward a ${sceneTypeUsed} beat: the crack in the seal exhaled a breath that smelled of cold iron, and Mei Lian's grip on Wen Shu's wrist tightened until it hurt.`,
          metadata: { mode: "narration", sceneType: "confrontation", emotion: "dread", intensity: 0.7, tension: 0.75, danger: 0.5 },
        },
        {
          id: "c6-dev-p2",
          type: "dialogue",
          text: "\"Whatever that is,\" Mei Lian said, voice level despite the shake in her hand, \"it's older than the seal. Older than the sect.\"",
          metadata: { mode: "dialogue", speakerName: "Mei Lian", speakerRole: "ally", emotion: "controlled fear", intensity: 0.6, tension: 0.7 },
        },
      ];
  const generatedContent = blocks.map(block => block.text).join("\n\n");
  const now = Date.now();

  return {
    storyId: "workshop-mock-story-01",
    userId: "workshop-mock-user",
    chapterNumber,
    generatedContent,
    blocks,
    summary: scenario.id === "opening"
      ? "Wen Shu discovers a forbidden cultivation manual hidden inside a sealed tomb altar during punishment duty."
      : `Wen Shu and Mei Lian face the shrine's aftermath, directed by a ${sceneTypeUsed} anchor, as Elder Nan's patrol closes in.`,
    statsChangeMessage: "None",
    cuePayload: scenario.id === "opening"
      ? { sceneType: "exploration", environment: ["tomb", "dust"], intensity: 0.3, tension: 0.25, emotion: "wary" }
      : { sceneType: "confrontation", environment: ["shrine", "darkness"], intensity: 0.7, tension: 0.8, danger: 0.55, emotion: "dread" },
    syncStatus: "synced",
    revisionId: `workshop-mock-dev-rev-${chapterNumber}`,
    syncRevision: `${now}`,
    updatedAt: new Date(now).toISOString(),
  };
}

/** Deterministic stand-in for the structured Stage 4 processing response. */
function buildMockProcessingHandoffDev(
  scenario: (typeof SCENARIOS)[ScenarioId],
  sceneTypeUsed: SceneType,
): ChapterHandoff {
  const chapterNumber = scenario.currentChapter.number;
  return scenario.id === "opening"
    ? {
        version: 1,
        chapterNumber,
        endState: {
          location: "The sealed tomb beneath Azure Bell Peak",
          timeMarker: "dusk, same day",
          charactersPresent: ["Wen Shu", "Elder Nan"],
          mcCondition: "shaken, manual hidden inside his robes",
          openTension: "Wen Shu now possesses a forbidden item Elder Nan doesn't know about.",
        },
        completedEvents: ["Wen Shu found the sealed Ashfall Continuum manual inside the tomb altar."],
        nextImmediateAction: "Wen Shu must decide whether to read the manual in secret.",
        fingerprints: [{
          actionType: "discovery",
          participants: ["Wen Shu"],
          location: "The sealed tomb beneath Azure Bell Peak",
          outcome: "Wen Shu found the sealed Ashfall Continuum manual.",
          chapterNumber,
        }],
      }
    : {
        version: 1,
        chapterNumber,
        endState: {
          location: "The collapsed shrine beneath Azure Bell Peak",
          timeMarker: "moments later, same night",
          charactersPresent: ["Wen Shu", "Mei Lian"],
          mcCondition: "meridians raw but intact",
          openTension: "Elder Nan's patrol bell just rang directly above the shrine.",
        },
        completedEvents: [`Something ancient stirred behind the shrine's cracked inner seal (${sceneTypeUsed} beat).`],
        nextImmediateAction: "Wen Shu and Mei Lian must hide or explain themselves before Elder Nan's patrol reaches the shrine entrance.",
        fingerprints: [{
          actionType: "other",
          participants: ["Wen Shu", "Mei Lian"],
          location: "The collapsed shrine beneath Azure Bell Peak",
          outcome: "Something ancient stirred behind the cracked inner seal.",
          chapterNumber,
        }],
      };
}
