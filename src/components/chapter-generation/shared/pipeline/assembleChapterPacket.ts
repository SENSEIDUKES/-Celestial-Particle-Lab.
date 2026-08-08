import type { CulturalProseStyleId } from "../lib/culturalProse";
import { resolveCulturalProseSelection } from "../lib/culturalProse";
import {
  assemblePacketContext,
  type ChapterGenerationPacket,
} from "../packets";
import { buildChapterEffectRules } from "./chapterEffectRules";
import type { ChapterPacket } from "./types";

export type CulturalProseOverride = CulturalProseStyleId | "story-default" | "none";

export interface AssembleChapterPacketOptions {
  culturalProseOverride?: CulturalProseOverride;
}

/** Stage 1: pure code assembly. This function never crosses a model boundary. */
export function assembleChapterPacket(
  contracts: ChapterGenerationPacket,
  options: AssembleChapterPacketOptions = {},
): ChapterPacket {
  const {
    storyConstitution,
    livingStoryState,
    chapterMission,
    generationRules,
  } = contracts;
  const {
    fatePressureTier: _unmappedFatePressureTier,
    ...packetStoryConstitution
  } = storyConstitution;
  const context = assemblePacketContext(contracts);
  const proseOverride = options.culturalProseOverride ?? "story-default";
  const resolvedStyleId = proseOverride === "story-default"
    ? storyConstitution.culturalProseStyleId
    : proseOverride === "none" ? undefined : proseOverride;
  const proseSource = proseOverride === "story-default"
    ? (storyConstitution.culturalProseStyleId ? "story-setting" as const : "fallback" as const)
    : proseOverride === "none" ? "fallback" as const : "workshop-override" as const;
  const proseSelection = resolveCulturalProseSelection(resolvedStyleId, proseSource);
  const culturalProseInstruction = proseSelection.style
    ? generationRules.renderers.culturalProse(proseSelection.style)
    : "";
  const glossaryInstruction = generationRules.renderers
    .glossary(storyConstitution.glossaryEntries)
    .trim();
  const accessibilityInstruction = generationRules.renderers
    .writingStyle("", storyConstitution.accessibilityStyle)
    .trim();
  const effectRules = buildChapterEffectRules(
    context.systemInstruction,
    context.baseUserPrompt,
  );
  const permanentWritingInstructions = [
    "=== PERMANENT SYSTEM AND FORMAT RULES ===",
    context.systemInstruction,
    glossaryInstruction,
    accessibilityInstruction,
    culturalProseInstruction,
    effectRules,
  ].filter(Boolean).join("\n\n");
  const modelVisibleContext = [
    "=== ARC / CHAPTER POSITION ===",
    livingStoryState.position.display,
    "=== RELEVANT STORY AND CHAPTER CONTEXT ===",
    context.baseUserPrompt,
  ].join("\n\n");
  const providerPrompt = [
    modelVisibleContext,
    glossaryInstruction,
    accessibilityInstruction,
    culturalProseInstruction,
  ].filter(Boolean).join("\n\n");
  const contextManifest = generationRules.context.buildContextManifestFromOutcomes({
    route: "generate-chapter-stream",
    chapterNumber: chapterMission.number,
    systemInstruction: context.systemInstruction,
    finalUserPrompt: providerPrompt,
    outcomes: context.budgetedContext.outcomes,
    memoryAndHistoryBudgetTokens: context.budgetedContext.totalBudgetTokens,
  });

  return {
    version: 1,
    storyConstitution: packetStoryConstitution,
    livingStoryState,
    chapterMission,
    generationRules: {
      systemInstruction: context.systemInstruction,
      baseUserPrompt: context.baseUserPrompt,
      permanentWritingInstructions,
      effectRules,
    },
    existingAnchors: livingStoryState.scene.carriedAnchors,
    relevantContext: {
      assembledText: context.memoryJsonStr,
      sections: context.budgetedContext.promptSections.map(section => ({
        key: section.key,
        text: section.text,
        estimatedTokens: generationRules.output.estimateTokens(section.text),
      })),
    },
    culturalProse: {
      source: proseSelection.source,
      styleId: proseSelection.style?.id,
      label: proseSelection.style?.label,
      instruction: culturalProseInstruction,
    },
    arcChapterPosition: livingStoryState.position,
    modelVisibleContext,
    contextManifest,
  };
}
