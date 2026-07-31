/**
 * Development-only chapter-generation orchestrator. Everything in
 * `assembleGeneration.ts` (used by the `reference/` pane) mirrors today's
 * real Light-Novels `storyRouter.ts` flow and is left completely untouched
 * by this file — per the Workshop replica rules, the reference copy stays a
 * faithful, locked comparison point.
 *
 * This file is the first (skeleton) implementation of two NOT-YET-IN-
 * PRODUCTION systems, built only inside the Workshop's `development/` pane:
 *
 *   1. Cultural Prose Styles   (`lib/culturalProse.ts`)
 *   2. Scene Ending Anchors + Scene Rhythm Tracker (`lib/sceneRhythm.ts`)
 *
 * It reuses the same real (ported) context-assembly modules as the
 * reference flow (`generationContext.ts`, `contextBudgeter.ts`,
 * `contextManifest.ts`, `chapterPrompts.ts`, etc.) — only the prompt
 * assembly around them, and the exposed stage list, differ, per the design
 * brief's explicit Development flow.
 *
 * No network/DB/LLM call happens here either — see `assembleGeneration.ts`'s
 * header comment; the same safety guarantees apply.
 */
import type { ChapterContent, ChapterHandoff, StoryBlock } from "./types";
import type { GenerationStage } from "./stageTypes";
import type { ScenarioId } from "./assembleGeneration";
import { SCENARIOS, RHYTHM_SCENARIOS } from "./fixtures/mockGenerationData";
import { CHAPTER_PROMPTS } from "./lib/chapterPrompts";
import {
  anchorTextFromBlocks,
  formatMainCharacterState,
  latestHistoryText,
  prepareGenerationContext,
} from "./lib/generationContext";
import { buildContextManifestFromOutcomes } from "./lib/contextManifest";
import { estimateTokens, formatAbilityLedgerForPrompt } from "./lib/helpers";
import { appendChapterWritingStyleInstruction } from "./lib/chapterWritingStyle";
import { formatGlossaryForPrompt } from "./lib/glossaryFormatter";
import { buildChapterContract } from "./lib/chapterHandoff";
import { buildChapterEffectsDirection } from "../development/chapterEffectsDirection";
import { getFatePressureBlock } from "./lib/fatePressureBlocks";
import {
  CulturalProseStyleId,
  describeCulturalProseSelection,
  renderCulturalProseInstruction,
  resolveCulturalProseSelection,
} from "./lib/culturalProse";
import {
  appendSceneType,
  deriveSceneAnchors,
  SceneAnchors,
  SceneType,
  ScenePathSelection,
  selectNextScenePath,
} from "./lib/sceneRhythm";

/** `'story-default'` reads the story's own setting; `'none'` forces the fallback. */
export type CulturalProseOverride = CulturalProseStyleId | "story-default" | "none";

export interface ChapterGenerationDevOutput extends ChapterContent {
  culturalProseStyle?: {
    id: CulturalProseStyleId;
    label: string;
    source: "story-setting" | "workshop-override" | "fallback";
  };
  sceneRhythm: {
    /** History as it existed BEFORE this chapter (the Scene Rhythm Tracker's input). */
    incomingSceneTypes: SceneType[];
    /** History AFTER appending this chapter's `sceneTypeUsed` — what would persist. */
    updatedSceneTypes: SceneType[];
    fatePressure: string;
  };
  selectedScenePath?: {
    type: SceneType;
    anchor: string;
    reason: string;
  };
  nextSceneAnchors: SceneAnchors;
  sceneTypeUsed: SceneType;
}

interface AssembledGenerationDev {
  stages: GenerationStage[];
  finalOutput: ChapterGenerationDevOutput;
}

const pacingBlock = (pacingDirective: string) => pacingDirective
  ? `

=========================================
AI DIRECTOR PACING INSTRUCTION
=========================================
${pacingDirective}
=========================================`
  : "";

const nextSceneDirectionBlock = (selection: ScenePathSelection | undefined) => selection
  ? `

=========================================
NEXT SCENE DIRECTION (selected: ${selection.type.toUpperCase()})
=========================================
Anchor: "${selection.anchor}"
Use this as a concrete forward direction for where this chapter's scene(s) should head. Do not simply recreate the previous chapter's scene type or beat.
=========================================`
  : "";

const formatThreadForRouter = (thread: { description: string; originChapter: number }, currentChapterNum: number) => {
  const age = currentChapterNum - thread.originChapter;
  return age >= 1
    ? `${thread.description} (Thread open for ${age} chapter${age > 1 ? "s" : ""} — pay it off or deepen it!)`
    : thread.description;
};

export function assembleChapterGenerationDev(
  scenarioId: ScenarioId,
  rhythmScenarioId: string,
  proseOverride: CulturalProseOverride,
): AssembledGenerationDev {
  const scenario = SCENARIOS[scenarioId];
  const rhythmScenario = RHYTHM_SCENARIOS.find(r => r.id === rhythmScenarioId) ?? RHYTHM_SCENARIOS[0];
  const { mcName, genre, storyTags, customPremise, styleBible, tropeRules, memory, currentChapter, contextBlocks } = scenario;
  const currentChapterNum = currentChapter.number;

  // ── Same base context assembly as the reference flow (unchanged pipeline) ──
  const formattedThreads = memory.unresolvedPlotThreads.map(t => formatThreadForRouter(t, currentChapterNum));
  const baseMemory = {
    powerSystem: memory.powerSystem,
    currentPowerStage: memory.currentPowerStage,
    worldRules: memory.worldRules,
    abilities: formatAbilityLedgerForPrompt(memory.abilities),
    unresolvedPlotThreads: formattedThreads,
  };
  const chapterContract = buildChapterContract({
    chapterNumber: currentChapterNum,
    premise: currentChapter.premise,
    previousHandoff: scenario.previousHandoff,
    recentFingerprints: scenario.recentFingerprints,
  });
  const lastSummary = latestHistoryText(contextBlocks);
  const preparedContext = prepareGenerationContext({
    engine: "v2",
    memory,
    baseMemory,
    blocks: contextBlocks,
    legacyPastSummaries: [],
    fallbackSummary: "This is the very first chapter of the story arc! Set the scene dramatically.",
    threads: formattedThreads,
    worldRules: baseMemory.worldRules,
    pinned: {
      premise: [
        `Chapter ${currentChapterNum}: ${currentChapter.title || ""}`,
        `Goal: ${currentChapter.premise || ""}`,
        genre ? `Genre/style: ${genre}` : "",
        customPremise ? `Core premise: ${customPremise}` : "",
      ].filter(Boolean).join("\n"),
      mcStateCard: formatMainCharacterState({
        mcName,
        powerSystem: baseMemory.powerSystem,
        currentPowerStage: baseMemory.currentPowerStage,
        abilities: memory.abilities,
        destinedEnding: memory.destinedEnding,
        resolvedPlotThreads: memory.resolvedPlotThreads,
      }),
    },
    chapterContract,
    ranking: {
      mcName,
      lastSummary,
      currentContext: currentChapter.premise || "",
      bonusContexts: [memory.unresolvedPlotThreads.map(t => t.description).join(" "), customPremise],
      anchorText: anchorTextFromBlocks(contextBlocks),
    },
  });
  const budgetedContext = preparedContext.budgetedContext!;
  const { memoryJsonStr } = preparedContext;

  const systemInstruction = CHAPTER_PROMPTS.system;
  const userPrompt = CHAPTER_PROMPTS.userPrompt(
    currentChapter.number, currentChapter.title, currentChapter.premise,
    mcName, genre, customPremise, memoryJsonStr, "", true,
    styleBible, tropeRules, storyTags, "v2",
  );

  // ── New: Cultural Prose Style resolution ────────────────────────────────
  const resolvedStyleId = proseOverride === "story-default"
    ? scenario.culturalProseStyleId
    : proseOverride === "none" ? undefined : proseOverride;
  const proseSource = proseOverride === "story-default"
    ? (scenario.culturalProseStyleId ? "story-setting" as const : "fallback" as const)
    : proseOverride === "none" ? "fallback" as const : "workshop-override" as const;
  const proseSelection = resolveCulturalProseSelection(resolvedStyleId, proseSource);
  const proseBlock = proseSelection.style ? `\n\n${renderCulturalProseInstruction(proseSelection.style)}` : "";

  // ── New: Scene Ending Anchors carried IN from the previous chapter ──────
  const availableAnchors = scenario.previousHandoff
    ? deriveSceneAnchors({ handoff: scenario.previousHandoff, worldBuildingSeed: scenario.worldBuildingSeed })
    : undefined;

  // ── New: Scene Rhythm Tracker picks one of the available anchors ───────
  const selection = availableAnchors
    ? selectNextScenePath(rhythmScenario.fatePressure, rhythmScenario.recentSceneTypes, availableAnchors)
    : undefined;
  const sceneTypeUsed: SceneType = selection?.type ?? "worldBuilding";

  // ── Assemble the real final prompt, in storyRouter.ts's append order plus
  // the two new blocks (prose style right after chapter-writing-style,
  // next-scene direction last — both additive, neither touches existing text) ──
  const glossaryRules = formatGlossaryForPrompt(scenario.glossaryEntries);
  let finalUserPrompt = appendChapterWritingStyleInstruction(userPrompt, scenario.chapterWritingStyle);
  if (glossaryRules) {
    finalUserPrompt = `${glossaryRules}\n\n${finalUserPrompt}`;
  }
  finalUserPrompt += proseBlock;
  finalUserPrompt += pacingBlock(scenario.pacingDirective);
  finalUserPrompt += getFatePressureBlock(rhythmScenario.fatePressure);
  finalUserPrompt += nextSceneDirectionBlock(selection);

  const contextManifest = buildContextManifestFromOutcomes({
    route: "generate-chapter-stream",
    chapterNumber: currentChapterNum,
    systemInstruction,
    finalUserPrompt,
    outcomes: budgetedContext.outcomes,
    memoryAndHistoryBudgetTokens: budgetedContext.totalBudgetTokens,
  });

  // ── Stage construction (the Development flow) ──────────────────────────
  const blobStart = userPrompt.indexOf(memoryJsonStr);
  const beforeBlob = blobStart >= 0 ? userPrompt.slice(0, blobStart).trim() : "";
  const afterBlob = blobStart >= 0 ? userPrompt.slice(blobStart + memoryJsonStr.length).trim() : "";

  const sectionsByKey = (keys: string[]) => budgetedContext.promptSections
    .filter(section => keys.includes(section.key))
    .map(section => section.text)
    .join("\n\n");
  const genreRulesContent = [glossaryRules.trim(), beforeBlob].filter(Boolean).join("\n\n");
  const allContextSections = sectionsByKey([
    "premise", "pinnedRules", "chapterContract", "anchor", "recentChapters", "entityCards", "threads", "rag", "arcSummaries",
  ]);
  const storyContextContent = [genreRulesContent, allContextSections].filter(Boolean).join("\n\n");

  const styleInstructionAddition = appendChapterWritingStyleInstruction("", scenario.chapterWritingStyle).trim();
  const chapterEffectsDirectionContent = buildChapterEffectsDirection(systemInstruction, afterBlob);
  const finalInstructionsContent = [
    afterBlob,
    styleInstructionAddition,
    proseBlock.trim(),
    pacingBlock(scenario.pacingDirective).trim(),
    getFatePressureBlock(rhythmScenario.fatePressure).trim(),
    nextSceneDirectionBlock(selection).trim(),
    chapterEffectsDirectionContent,
  ].filter(Boolean).join("\n\n");

  const finalOutput = buildMockFinalOutputDev({
    scenario,
    rhythmScenario,
    contextManifest,
    contract: chapterContract,
    proseSelection,
    availableAnchors,
    selection,
    sceneTypeUsed,
  });

  const stage = (
    key: string,
    name: string,
    description: string,
    content: string,
    format: GenerationStage["format"],
    included: boolean,
    tokenEstimate: number,
  ): GenerationStage => ({ key, name, description, included, tokenEstimate, sizeChars: content.length, format, content });

  const stages: GenerationStage[] = [
    stage(
      "story-context",
      "Story and chapter context",
      "Premise, pinned main-character state / world rules, genre & glossary rules, current arc, recent chapters, and Codex/thread context — the real assembled context, same source data as the Reference flow.",
      storyContextContent,
      "text",
      storyContextContent.trim().length > 0,
      estimateTokens(storyContextContent),
    ),
    stage(
      "cultural-prose",
      "Cultural Prose Style",
      "The chosen style, the exact instruction block sent into generation, the source that selected it, and the fallback used when unset.",
      describeCulturalProseSelection(proseSelection),
      "text",
      Boolean(proseSelection.style),
      estimateTokens(proseBlock),
    ),
    stage(
      "fate-pressure",
      "Fate Pressure",
      `This story's active Fate Pressure tier (from the selected rhythm scenario: "${rhythmScenario.label}") and the exact directive block it appends.`,
      getFatePressureBlock(rhythmScenario.fatePressure).trim(),
      "text",
      true,
      estimateTokens(getFatePressureBlock(rhythmScenario.fatePressure)),
    ),
    stage(
      "scene-rhythm",
      "Recent Scene Rhythm",
      "The Scene Rhythm Tracker's input: recent scene-type history and the active Fate Pressure tier that together weight the next selection.",
      JSON.stringify({
        fatePressure: rhythmScenario.fatePressure,
        recentSceneTypes: rhythmScenario.recentSceneTypes,
        windowSize: 4,
      }, null, 2),
      "json",
      rhythmScenario.recentSceneTypes.length > 0,
      estimateTokens(JSON.stringify(rhythmScenario.recentSceneTypes)),
    ),
    stage(
      "available-anchors",
      "Available Scene Ending Anchors",
      "The three next-scene candidates carried in from the previous chapter's generation (worldBuilding / conflict / progression), specific to this story's current state.",
      availableAnchors
        ? JSON.stringify(availableAnchors, null, 2)
        : JSON.stringify({ available: false, reason: "No previous chapter handoff — this is the first chapter of the story, so there are no carried-over anchors yet." }, null, 2),
      "json",
      Boolean(availableAnchors),
      estimateTokens(JSON.stringify(availableAnchors ?? {})),
    ),
    stage(
      "selected-path",
      "Selected Next-Scene Path",
      "The Scene Rhythm Tracker's chosen anchor for this chapter, and why — the concrete directional anchor fed into Final Chapter Instructions.",
      selection
        ? JSON.stringify({ type: selection.type, anchor: selection.anchor, reason: selection.reason, weights: selection.weights, blocked: selection.blocked }, null, 2)
        : JSON.stringify({ selected: false, reason: "No anchors were available to select from; this chapter opens without a directional carry-over." }, null, 2),
      "json",
      Boolean(selection),
      estimateTokens(JSON.stringify(selection ?? {})),
    ),
    stage(
      "chapter-effects-direction",
      "Chapter Effects Direction",
      "Existing scene music, atmosphere, audio cue, World Card, narration/dialogue metadata, and visual-cue instructions collected from the current chapter prompt. This inspection step does not select tracks, sounds, voices, or media assets.",
      chapterEffectsDirectionContent,
      "text",
      chapterEffectsDirectionContent.trim().length > 0,
      estimateTokens(chapterEffectsDirectionContent),
    ),
    stage(
      "final-instructions",
      "Final Chapter Instructions",
      "Author-context authority, continuation rule, length/expansion directives, chapter writing style, Cultural Prose Style, AI Director pacing, Fate Pressure, Next Scene Direction, and the consolidated Chapter Effects Direction — everything assembled after the context blob.",
      finalInstructionsContent,
      "text",
      true,
      estimateTokens(finalInstructionsContent),
    ),
    stage(
      "generated-output",
      "Generated Chapter Output",
      "Mock — not a live model call. The ChapterContent shape generation streams back, extended with the new Cultural Prose / Scene Rhythm fields this system adds.",
      JSON.stringify(finalOutput, null, 2),
      "json",
      true,
      estimateTokens(JSON.stringify(finalOutput)),
    ),
    stage(
      "next-anchors",
      "Newly generated anchors for the following chapter",
      "Three fresh next-scene candidates derived from THIS chapter's own handoff, ready to feed the next chapter's Available Scene Ending Anchors step.",
      JSON.stringify(finalOutput.nextSceneAnchors, null, 2),
      "json",
      true,
      estimateTokens(JSON.stringify(finalOutput.nextSceneAnchors)),
    ),
  ];

  return { stages, finalOutput };
}

function buildMockFinalOutputDev(input: {
  scenario: (typeof SCENARIOS)[ScenarioId];
  rhythmScenario: (typeof RHYTHM_SCENARIOS)[number];
  contextManifest: ChapterContent["contextManifest"];
  contract: ChapterContent["contract"];
  proseSelection: ReturnType<typeof resolveCulturalProseSelection>;
  availableAnchors: SceneAnchors | undefined;
  selection: ScenePathSelection | undefined;
  sceneTypeUsed: SceneType;
}): ChapterGenerationDevOutput {
  const { scenario, rhythmScenario, contextManifest, contract, proseSelection, selection, sceneTypeUsed } = input;
  const chapterNumber = scenario.currentChapter.number;

  // Same two-story mock prose as the reference flow's fixture (kept short
  // here — the reference flow already demonstrates full block/system-panel
  // fidelity). The prose itself does not yet dynamically rewrite per
  // selected scene type; `sceneTypeUsed` records which anchor directed this
  // (mocked) generation so the Scene Rhythm Tracker has something real to
  // persist and react to on the next call — a deliberate skeleton-level
  // simplification, safe to refine once real generation is wired in.
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

  const handoff: ChapterHandoff = scenario.id === "opening"
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

  const nextSceneAnchors = deriveSceneAnchors({ handoff, worldBuildingSeed: scenario.worldBuildingSeed });
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
    contextManifest,
    handoff,
    contract,
    culturalProseStyle: proseSelection.style
      ? { id: proseSelection.style.id, label: proseSelection.style.label, source: proseSelection.source }
      : undefined,
    sceneRhythm: {
      incomingSceneTypes: rhythmScenario.recentSceneTypes,
      updatedSceneTypes: appendSceneType(rhythmScenario.recentSceneTypes, sceneTypeUsed),
      fatePressure: rhythmScenario.fatePressure,
    },
    selectedScenePath: selection
      ? { type: selection.type, anchor: selection.anchor, reason: selection.reason }
      : undefined,
    nextSceneAnchors,
    sceneTypeUsed,
  };
}
