import { describe, expect, it } from "vitest";
import { CHAPTER_PROMPTS } from "../lib/chapterPrompts";
import {
  anchorTextFromBlocks,
  formatMainCharacterState,
  latestHistoryText,
} from "../lib/generationContext";
import {
  buildGenerationRules,
  formatThreadForRouter,
} from "./generationRules";

describe("Generation Rules packet", () => {
  it("references the existing prompt and renderer owners instead of retyping them", () => {
    const rules = buildGenerationRules();

    expect(rules.prompts.system).toBe(CHAPTER_PROMPTS.system);
    expect(rules.prompts.userPrompt).toBe(CHAPTER_PROMPTS.userPrompt);
    expect(rules.renderers.mainCharacterState).toBe(formatMainCharacterState);
    expect(rules.context.latestHistoryText).toBe(latestHistoryText);
    expect(rules.context.anchorTextFromBlocks).toBe(anchorTextFromBlocks);
    expect(rules.context.budgetDefaults.totalBudgetTokens).toBe(24_000);
  });

  it("keeps the pinned premise template aligned with the ported prompt block", () => {
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

  it("keeps thread aging in the permanent generation-rule package", () => {
    expect(formatThreadForRouter({ description: "Find the seal.", originChapter: 4 }, 6))
      .toBe("Find the seal. (Thread open for 2 chapters — pay it off or deepen it!)");
    expect(formatThreadForRouter({ description: "Open the manual.", originChapter: 6 }, 6))
      .toBe("Open the manual.");
  });
});
