import { describe, expect, it } from "vitest";
import { CHAPTER_PROMPTS } from "../lib/chapterPrompts";
import { getFatePressureBlock } from "../lib/fatePressureBlocks";
import {
  anchorTextFromBlocks,
  formatMainCharacterState,
  latestHistoryText,
} from "../lib/generationContext";
import type { ScenePathSelection } from "../lib/sceneRhythm";
import {
  buildGenerationRules,
  formatThreadForRouter,
  nextSceneDirectionBlock,
  pacingBlock,
} from "./generationRules";

describe("Generation Rules packet", () => {
  it("references the existing prompt and renderer owners instead of retyping them", () => {
    const rules = buildGenerationRules();

    expect(rules.prompts.system).toBe(CHAPTER_PROMPTS.system);
    expect(rules.prompts.userPrompt).toBe(CHAPTER_PROMPTS.userPrompt);
    expect(rules.renderers.fatePressure("Balanced")).toBe(getFatePressureBlock("Balanced"));
    expect(rules.renderers.mainCharacterState).toBe(formatMainCharacterState);
    expect(rules.context.latestHistoryText).toBe(latestHistoryText);
    expect(rules.context.anchorTextFromBlocks).toBe(anchorTextFromBlocks);
    expect(rules.context.budgetDefaults.totalBudgetTokens).toBe(24_000);
  });

  it("keeps the shared pacing wrapper output unchanged", () => {
    expect(pacingBlock("Keep it tense.")).toBe(`

=========================================
AI DIRECTOR PACING INSTRUCTION
=========================================
Keep it tense.
=========================================`);
    expect(pacingBlock("")).toBe("");
  });

  it("keeps the pinned premise template identical to the orchestrators' original block", () => {
    const rules = buildGenerationRules();

    expect(rules.renderers.pinnedPremise({
      chapterNumber: 6,
      title: "What the Seal Let Out",
      premise: "Contain what escaped.",
      genre: "Xianxia",
      corePremise: "A forbidden manual wakes.",
    })).toBe([
      "Chapter 6: What the Seal Let Out",
      "Goal: Contain what escaped.",
      "Genre/style: Xianxia",
      "Core premise: A forbidden manual wakes.",
    ].join("\n"));
  });

  it("keeps thread aging and next-scene wrappers behavior-identical", () => {
    expect(formatThreadForRouter({ description: "Find the seal.", originChapter: 4 }, 6))
      .toBe("Find the seal. (Thread open for 2 chapters — pay it off or deepen it!)");
    expect(formatThreadForRouter({ description: "Open the manual.", originChapter: 6 }, 6))
      .toBe("Open the manual.");

    const selection: ScenePathSelection = {
      type: "conflict",
      anchor: "The patrol closes in.",
      weights: { worldBuilding: 1, conflict: 3, progression: 1 },
      blocked: [],
      reason: "Highest Hardcore weight wins.",
    };
    expect(nextSceneDirectionBlock(selection)).toBe(`

=========================================
NEXT SCENE DIRECTION (selected: CONFLICT)
=========================================
Anchor: "The patrol closes in."
Use this as a concrete forward direction for where this chapter's scene(s) should head. Do not simply recreate the previous chapter's scene type or beat.
=========================================`);
  });
});
