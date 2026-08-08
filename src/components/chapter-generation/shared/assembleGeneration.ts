/**
 * Orchestrates the ported Light-Novels generation-flow modules in exactly
 * the order Light-Novels `src/server/routes/storyRouter.ts`'s
 * `POST /api/generate-chapter-stream` handler runs them (verified against
 * `main`), against safe local mock data instead of a real Story document.
 *
 * No network call, DB write, R2 upload, credit deduction, queue, or
 * notification happens anywhere in this file — the only "generation" output
 * is the hand-authored mock `ChapterContent` returned by
 * `buildMockFinalOutput`, clearly labeled as such in its stage description.
 *
 * This is the single source of truth the Workshop's Chapter Generation
 * Inspector renders from — see
 * `src/workshop/previews/chapter-generation-flow/ChapterGenerationFlowWorkspace.tsx`.
 */
import type { ChapterContent, ChapterHandoff, StoryBlock } from "./types";
import type { GenerationStage } from "./stageTypes";
import type { MockChapterGenerationScenario } from "./fixtures/mockGenerationData";
import { SCENARIOS } from "./fixtures/mockGenerationData";
import {
  assembleChapterGenerationPacket,
  buildLegacyGenerationMemory,
} from "./packets";

export type ScenarioId = "opening" | "established";

interface AssembledGeneration {
  stages: GenerationStage[];
  finalOutput: ChapterContent;
}

export function assembleChapterGeneration(scenarioId: ScenarioId): AssembledGeneration {
  const scenario = SCENARIOS[scenarioId];
  const packet = assembleChapterGenerationPacket(scenario);
  const {
    storyConstitution,
    livingStoryState,
    chapterMission,
    generationRules,
  } = packet;
  const memory = buildLegacyGenerationMemory(packet);
  const currentChapterNum = chapterMission.number;

  // 1. Mirror storyRouter.ts's thread-aging pass.
  const formattedThreads = memory.unresolvedPlotThreads.map(
    t => generationRules.renderers.threadForRouter(t, currentChapterNum),
  );

  // 2. Mirror storyRouter.ts's baseMemory construction.
  const baseMemory = {
    powerSystem: memory.powerSystem,
    currentPowerStage: memory.currentPowerStage,
    worldRules: memory.worldRules,
    abilities: generationRules.renderers.abilityLedger(memory.abilities),
    unresolvedPlotThreads: formattedThreads,
  };

  // 3. Chapter Contract (Context Engine 2.5) — deterministic, client-built in
  // production before the request is even sent; packet assembly builds it the
  // same way and exposes it as this chapter's mission.
  const chapterContract = chapterMission.contract;

  const lastSummary = generationRules.context.latestHistoryText(livingStoryState.contextBlocks);

  // 4. Real context assembly + token budgeting (prepareGenerationContext ->
  // assembleContext), exactly as storyRouter.ts calls it.
  const preparedContext = generationRules.context.prepareGenerationContext({
    engine: "v2",
    memory,
    baseMemory,
    blocks: livingStoryState.contextBlocks,
    legacyPastSummaries: [],
    fallbackSummary: chapterMission.fallbackSummary,
    threads: formattedThreads,
    worldRules: baseMemory.worldRules,
    pinned: {
      premise: generationRules.renderers.pinnedPremise({
        chapterNumber: currentChapterNum,
        title: chapterMission.title,
        premise: chapterMission.premise,
        genre: storyConstitution.genre,
        corePremise: storyConstitution.corePremise,
      }),
      mcStateCard: generationRules.renderers.mainCharacterState({
        mcName: storyConstitution.mainCharacterName,
        powerSystem: baseMemory.powerSystem,
        currentPowerStage: baseMemory.currentPowerStage,
        abilities: memory.abilities,
        destinedEnding: memory.destinedEnding,
        resolvedPlotThreads: memory.resolvedPlotThreads,
      }),
    },
    chapterContract,
    ranking: {
      mcName: storyConstitution.mainCharacterName,
      lastSummary,
      currentContext: chapterMission.premise || "",
      bonusContexts: [
        memory.unresolvedPlotThreads.map(t => t.description).join(" "),
        storyConstitution.corePremise,
      ],
      anchorText: generationRules.context.anchorTextFromBlocks(livingStoryState.contextBlocks),
    },
  });

  const budgetedContext = preparedContext.budgetedContext!;
  const { memoryJsonStr } = preparedContext;

  // 5. System instruction (fixed) + user prompt (real PROMPTS.chapter.userPrompt).
  const systemInstruction = generationRules.prompts.system;
  const userPrompt = generationRules.prompts.userPrompt(
    chapterMission.number,
    chapterMission.title,
    chapterMission.premise,
    storyConstitution.mainCharacterName,
    storyConstitution.genre,
    storyConstitution.corePremise,
    memoryJsonStr,
    "",
    true,
    storyConstitution.styleBible,
    storyConstitution.tropeRules,
    storyConstitution.storyTags,
    "v2",
  );

  // 6. Glossary rules + chapter writing style + pacing + fate pressure, in the
  // exact append order storyRouter.ts uses.
  const glossaryRules = generationRules.renderers.glossary(storyConstitution.glossaryEntries);
  let finalUserPrompt = generationRules.renderers.writingStyle(
    userPrompt,
    storyConstitution.accessibilityStyle,
  );
  if (glossaryRules) {
    finalUserPrompt = `${glossaryRules}\n\n${finalUserPrompt}`;
  }
  finalUserPrompt += generationRules.renderers.pacing(chapterMission.pacingDirective);
  finalUserPrompt += generationRules.renderers.fatePressure("Balanced");

  // 7. Context manifest — the same real budgeting-outcome summary streamed to
  // the client as the first SSE event in production.
  const contextManifest = generationRules.context.buildContextManifestFromOutcomes({
    route: "generate-chapter-stream",
    chapterNumber: currentChapterNum,
    systemInstruction,
    finalUserPrompt,
    outcomes: budgetedContext.outcomes,
    memoryAndHistoryBudgetTokens: budgetedContext.totalBudgetTokens,
  });

  // ── Stage construction ────────────────────────────────────────────────
  // Locate the exact context-engine blob inside the real (unmodified)
  // userPrompt string so "Genre Rules" / "Chapter Instructions" can show the
  // real surrounding prompt text without duplicating or rewriting it.
  const blobStart = userPrompt.indexOf(memoryJsonStr);
  const beforeBlob = blobStart >= 0 ? userPrompt.slice(0, blobStart).trim() : "";
  const afterBlob = blobStart >= 0 ? userPrompt.slice(blobStart + memoryJsonStr.length).trim() : "";

  const sectionsByKey = (keys: string[]) => budgetedContext.promptSections
    .filter(section => keys.includes(section.key))
    .map(section => section.text)
    .join("\n\n");
  const outcomeTokens = (keys: string[]) => budgetedContext.outcomes
    .filter(outcome => keys.includes(outcome.key))
    .reduce((sum, outcome) => sum + outcome.estimatedTokens, 0);
  const outcomeIncluded = (keys: string[]) => budgetedContext.outcomes
    .some(outcome => keys.includes(outcome.key) && outcome.includedItems.length > 0);

  const styleInstructionAddition = generationRules.renderers.writingStyle(
    "",
    storyConstitution.accessibilityStyle,
  ).trim();
  const chapterInstructionsContent = [
    afterBlob,
    styleInstructionAddition,
    generationRules.renderers.pacing(chapterMission.pacingDirective).trim(),
    generationRules.renderers.fatePressure("Balanced").trim(),
  ].filter(Boolean).join("\n\n");

  const genreRulesContent = [glossaryRules.trim(), beforeBlob].filter(Boolean).join("\n\n");

  const requestEnvelope = `=== SYSTEM MESSAGE (PROMPTS.chapter.system) ===\n${systemInstruction}\n\n=== USER MESSAGE (finalUserPrompt) ===\n${finalUserPrompt}`;

  const finalOutput = buildMockFinalOutput(scenario, contextManifest, chapterContract);

  const stage = (
    key: string,
    name: string,
    description: string,
    content: string,
    format: GenerationStage["format"],
    included: boolean,
    tokenEstimate: number,
  ): GenerationStage => ({
    key,
    name,
    description,
    included,
    tokenEstimate,
    sizeChars: content.length,
    format,
    content,
  });

  const stages: GenerationStage[] = [
    stage(
      "premise",
      "Premise",
      "Chapter number, title, goal, genre/style, and core premise.",
      sectionsByKey(["premise"]),
      "text",
      outcomeIncluded(["premise"]),
      outcomeTokens(["premise"]),
    ),
    stage(
      "story-seed",
      "Story Seed / World Context",
      "Pinned main-character state (power stage, ability ledger, destined ending) plus world rules — never budgeted away.",
      sectionsByKey(["pinnedRules"]),
      "text",
      outcomeIncluded(["pinnedRules"]),
      outcomeTokens(["pinnedRules"]),
    ),
    stage(
      "genre-rules",
      "Genre Rules",
      "Reference glossary guidance plus the genre / story-tag / style-bible / trope-rules STYLE DIRECTIVE block.",
      genreRulesContent,
      "text",
      genreRulesContent.length > 0,
      generationRules.output.estimateTokens(genreRulesContent),
    ),
    stage(
      "current-arc",
      "Current Arc Context",
      "Coarse rolling history of the current story arc (arc summaries).",
      sectionsByKey(["arcSummaries"]),
      "text",
      outcomeIncluded(["arcSummaries"]),
      outcomeTokens(["arcSummaries"]),
    ),
    stage(
      "recent-chapter",
      "Recent Chapter Context",
      "Chapter contract (do-not-repeat canon), immediate continuation anchor, most recent chapter(s), and RAG-recovered older memories.",
      sectionsByKey(["chapterContract", "anchor", "recentChapters", "rag"]),
      "text",
      outcomeIncluded(["chapterContract", "anchor", "recentChapters", "rag"]),
      outcomeTokens(["chapterContract", "anchor", "recentChapters", "rag"]),
    ),
    stage(
      "character-codex",
      "Character / Codex Context",
      "Ranked Codex entity cards (characters, factions, locations, artifacts) plus active unresolved plot threads.",
      sectionsByKey(["entityCards", "threads"]),
      "text",
      outcomeIncluded(["entityCards", "threads"]),
      outcomeTokens(["entityCards", "threads"]),
    ),
    stage(
      "chapter-instructions",
      "Chapter Instructions",
      "Author-context authority note, immediate-continuation rule, chapter length/expansion directives, system-panel & cue-payload instructions, chapter writing style, AI Director pacing, and Fate Pressure directive.",
      chapterInstructionsContent,
      "text",
      chapterInstructionsContent.length > 0,
      generationRules.output.estimateTokens(chapterInstructionsContent),
    ),
    stage(
      "system-prompt",
      "System Prompt Rules",
      "The fixed system instruction — genre-sensitive writing directives, NDJSON output-format spec, and content-safety protocols. Identical for every chapter.",
      systemInstruction,
      "text",
      true,
      generationRules.output.estimateTokens(systemInstruction),
    ),
    stage(
      "final-request",
      "Final Generation Request",
      "The exact system + user messages sent for POST /api/generate-chapter-stream (routing preset \"storyMaker\").",
      requestEnvelope,
      "text",
      true,
      contextManifest.providerInputEstimatedTokens ?? generationRules.output.estimateTokens(requestEnvelope),
    ),
    stage(
      "generated-output",
      "Generated Chapter Output",
      "Mock — not a live model call. The exact ChapterContent shape generation streams back and persists.",
      JSON.stringify(finalOutput, null, 2),
      "json",
      true,
      generationRules.output.estimateTokens(JSON.stringify(finalOutput)),
    ),
  ];

  return { stages, finalOutput };
}

function buildMockFinalOutput(
  scenario: MockChapterGenerationScenario,
  contextManifest: ChapterContent["contextManifest"],
  contract: ChapterContent["contract"],
): ChapterContent {
  const chapterNumber = scenario.currentChapter.number;

  const blocks: StoryBlock[] =
    scenario.id === "opening"
      ? [
          {
            id: "c1-p1",
            type: "paragraph",
            text: "Dust hung gold in the shaft of light through the tomb's broken roof, and Wen Shu had already swept the same corner three times just to avoid touching the altar at its center.",
            metadata: {
              mode: "narration",
              sceneType: "exploration",
              environment: ["tomb", "dust", "broken-stone"],
              emotion: "wary",
              intensity: 0.3,
              tension: 0.25,
            },
          },
          {
            id: "c1-p2",
            type: "dialogue",
            text: "\"You've swept that corner enough for three lifetimes,\" Elder Nan said from the doorway, not unkindly. \"Finish before the incense burns out.\"",
            metadata: { mode: "dialogue", speakerName: "Elder Nan", speakerRole: "authority", emotion: "stern", intensity: 0.4 },
          },
          {
            id: "c1-p3",
            type: "paragraph",
            text: "It was the altar's shadow that gave it away — a seam in the stone too straight to be an accident. Wen Shu's fingers found the manual before his mind caught up to what he was doing.",
            metadata: { mode: "narration", emotion: "startled", intensity: 0.55, tension: 0.5, mysticism: 0.6 },
          },
          {
            id: "c1-p4",
            type: "paragraph",
            text: "A holographic seal flickered faintly across the cover the moment his qi brushed it, dim and cracked with age.",
            metadata: { mode: "narration", intensity: 0.5 },
            system: {
              kind: "status",
              promptType: "codex_update",
              title: "Forbidden Item Discovered",
              rows: [
                { label: "Item", value: "Sealed Manual" },
                { label: "Brand", value: "Pre-sect era, unrecognized" },
              ],
            },
          },
        ]
      : [
          {
            id: "c6-p1",
            type: "paragraph",
            text: "The crack in the seal exhaled a breath that smelled of cold iron, and Mei Lian's grip on Wen Shu's wrist tightened until it hurt.",
            metadata: { mode: "narration", sceneType: "confrontation", environment: ["shrine", "darkness"], emotion: "dread", intensity: 0.7, tension: 0.75, danger: 0.5 },
          },
          {
            id: "c6-p2",
            type: "dialogue",
            text: "\"Whatever that is,\" Mei Lian said, voice level despite the shake in her hand, \"it's older than the seal. Older than the sect.\"",
            metadata: { mode: "dialogue", speakerName: "Mei Lian", speakerRole: "ally", emotion: "controlled fear", intensity: 0.6, tension: 0.7 },
          },
          {
            id: "c6-p3",
            type: "paragraph",
            text: "Wen Shu called on the Ashfall Draw without thinking, and qi tore through his newly-formed meridians like a second breakthrough trying to happen too fast.",
            metadata: { mode: "narration", intensity: 0.85, tension: 0.8, danger: 0.6, mysticism: 0.7 },
          },
          {
            id: "c6-p4",
            type: "paragraph",
            text: "Far above, a bell rang once across Azure Bell Peak — Elder Nan's patrol, closer than either of them had accounted for.",
            metadata: { mode: "narration", intensity: 0.6, tension: 0.85, entities: [{ name: "Elder Nan", type: "character", mention: "reference" }] },
          },
          {
            id: "c6-p5",
            type: "paragraph",
            text: "The Ashfall Draw settled into his meridians instead of scarring them — mastery, not just access, the manual's old pages finally making sense.",
            metadata: { mode: "narration", intensity: 0.5 },
            system: {
              kind: "skill_acquired",
              promptType: "progression",
              title: "Technique Refined",
              rarity: "Rare",
              rows: [
                { label: "Technique", value: "Ashfall Draw" },
                { label: "Mastery", value: "Initial -> Practiced" },
              ],
            },
          },
        ];

  const generatedContent = blocks.map(block => block.text).join("\n\n");

  const handoff: ChapterHandoff =
    scenario.id === "opening"
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
          completedEvents: [
            "Wen Shu found the sealed Ashfall Continuum manual inside the tomb altar.",
          ],
          nextImmediateAction: "Wen Shu must decide whether to read the manual in secret.",
          fingerprints: [
            {
              actionType: "discovery",
              participants: ["Wen Shu"],
              location: "The sealed tomb beneath Azure Bell Peak",
              outcome: "Wen Shu found the sealed Ashfall Continuum manual.",
              chapterNumber,
            },
          ],
        }
      : {
          version: 1,
          chapterNumber,
          endState: {
            location: "The collapsed shrine beneath Azure Bell Peak",
            timeMarker: "moments later, same night",
            charactersPresent: ["Wen Shu", "Mei Lian"],
            mcCondition: "meridians raw but intact, Ashfall Draw newly refined to Practiced",
            openTension: "Elder Nan's patrol bell just rang directly above the shrine.",
          },
          completedEvents: [
            "Something ancient stirred behind the shrine's cracked inner seal.",
            "Wen Shu refined the Ashfall Draw from Initial to Practiced mastery under pressure.",
            "Elder Nan's patrol closed to within earshot of the shrine.",
          ],
          nextImmediateAction: "Wen Shu and Mei Lian must hide or explain themselves before Elder Nan's patrol reaches the shrine entrance.",
          fingerprints: [
            {
              actionType: "training",
              participants: ["Wen Shu"],
              location: "The collapsed shrine beneath Azure Bell Peak",
              outcome: "Ashfall Draw refined from Initial to Practiced mastery.",
              chapterNumber,
            },
            {
              actionType: "other",
              participants: ["Wen Shu", "Mei Lian"],
              location: "The collapsed shrine beneath Azure Bell Peak",
              outcome: "Something ancient stirred behind the cracked inner seal.",
              chapterNumber,
            },
          ],
        };

  const now = Date.now();

  return {
    storyId: "workshop-mock-story-01",
    userId: "workshop-mock-user",
    chapterNumber,
    generatedContent,
    blocks,
    summary: scenario.id === "opening"
      ? "Wen Shu discovers a forbidden cultivation manual hidden inside a sealed tomb altar during punishment duty."
      : "Wen Shu and Mei Lian confront whatever the shrine's cracked seal released, Wen Shu refines the Ashfall Draw under pressure, and Elder Nan's patrol closes in.",
    episodicSummary: scenario.id === "opening"
      ? "The manual is found."
      : "The seal's aftermath, and a closing patrol.",
    statsChangeMessage: scenario.id === "opening" ? "None" : "[Technique Refined: Ashfall Draw — Initial to Practiced.]",
    cuePayload: scenario.id === "opening"
      ? { sceneType: "exploration", environment: ["tomb", "dust"], intensity: 0.3, tension: 0.25, emotion: "wary" }
      : { sceneType: "confrontation", environment: ["shrine", "darkness"], atmosphereCategory: "combat", atmosphereTags: ["shrine", "cracked-seal", "night"], intensity: 0.7, tension: 0.8, danger: 0.55, emotion: "dread", powerShift: 1 },
    syncStatus: "synced",
    revisionId: `workshop-mock-rev-${chapterNumber}`,
    syncRevision: `${now}`,
    updatedAt: new Date(now).toISOString(),
    contextManifest,
    handoff,
    contract,
  };
}
