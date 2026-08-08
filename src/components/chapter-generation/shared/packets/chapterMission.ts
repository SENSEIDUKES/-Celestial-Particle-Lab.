/**
 * Chapter Mission — instructions that apply only to the chapter currently
 * being generated. Nothing in this package is permanent story canon and
 * nothing here changes the generator's permanent prompt rules.
 */
import type { MockChapterGenerationScenario } from "../fixtures/mockGenerationData";
import { buildChapterContract } from "../lib/chapterHandoff";
import {
  selectNextScenePath,
  type FatePressureTier,
  type ScenePathSelection,
} from "../lib/sceneRhythm";
import type { ChapterContract } from "../types";
import type { LivingStoryState } from "./livingStoryState";

export const FIRST_CHAPTER_FALLBACK_SUMMARY =
  "This is the very first chapter of the story arc! Set the scene dramatically.";

export interface ChapterMission {
  number: number;
  title: string;
  premise: string;
  fallbackSummary: string;
  contract?: ChapterContract;
  /** Temporary director/user direction for this chapter only. */
  pacingDirective: string;
  /** Development-only selected anchor, when enough rhythm state exists. */
  selectedScenePath?: ScenePathSelection;
}

export interface ChapterMissionOptions {
  fatePressureTier?: FatePressureTier;
}

export function chapterMissionFromScenario(
  scenario: MockChapterGenerationScenario,
  livingState: LivingStoryState,
  options: ChapterMissionOptions = {},
): ChapterMission {
  const contract = buildChapterContract({
    chapterNumber: scenario.currentChapter.number,
    premise: scenario.currentChapter.premise,
    previousHandoff: livingState.previousHandoff,
    recentFingerprints: livingState.recentFingerprints,
  });

  return {
    number: scenario.currentChapter.number,
    title: scenario.currentChapter.title,
    premise: scenario.currentChapter.premise,
    fallbackSummary: FIRST_CHAPTER_FALLBACK_SUMMARY,
    contract,
    pacingDirective: scenario.pacingDirective,
    selectedScenePath: options.fatePressureTier && livingState.scene.carriedAnchors
      ? selectNextScenePath(
          options.fatePressureTier,
          livingState.scene.recentSceneTypes,
          livingState.scene.carriedAnchors,
        )
      : undefined,
  };
}
