import { describe, expect, it } from "vitest";
import { assembleChapterGeneration, type ScenarioId } from "../assembleGeneration";
import {
  assembleChapterGenerationDev,
  type CulturalProseOverride,
} from "../assembleGenerationDev";
import baselineJson from "../fixtures/generationBehaviorBaseline.json";
import {
  ESTABLISHED_SCENARIO,
  RHYTHM_SCENARIOS,
} from "../fixtures/mockGenerationData";
import { buildChapterContract } from "../lib/chapterHandoff";
import type { ChapterGenerationPackageId } from "./types";
import {
  assembleChapterGenerationPacket,
  buildLegacyGenerationMemory,
} from "./assembly";

type BaselineCapture = {
  stageCount: number;
  stageKeys: string[];
  stagesHash: string;
  finalOutputHash: string;
};

const baseline = baselineJson as {
  reference: Record<string, BaselineCapture>;
  development: Record<string, BaselineCapture>;
};

const EXPECTED_TRACE_IDS = [
  "story-identity",
  "style-bible",
  "trope-rules",
  "story-style",
  "cultural-prose-setting",
  "accessibility-style-setting",
  "fate-survival-settings",
  "permanent-world-rules",
  "power-system-definition",
  "destined-ending",
  "glossary-guidance-data",
  "arc-chapter-position",
  "current-power-stage",
  "ability-ledger",
  "active-threads-data",
  "resolved-threads",
  "codex-characters",
  "codex-factions",
  "codex-locations",
  "codex-artifacts",
  "previous-ending-anchor",
  "recent-chapter-blocks",
  "rag-memories",
  "arc-summaries",
  "previous-handoff",
  "recent-fingerprints",
  "carried-scene-anchors",
  "recent-scene-rhythm",
  "chapter-number-title-premise",
  "chapter-contract-objective",
  "chapter-required-opening",
  "chapter-starting-state",
  "chapter-do-not-repeat",
  "chapter-completion-criteria",
  "pacing-directive",
  "next-scene-direction",
  "fallback-opening-summary",
  "fixed-system-prompt",
  "user-prompt-template",
  "pinned-premise-template",
  "main-character-state-renderer",
  "history-anchor-selection",
  "style-directive-template",
  "author-context-authority",
  "immediate-continuation-rule",
  "chapter-length-expansion-directives",
  "ndjson-output-structure",
  "story-block-metadata-format",
  "system-event-format",
  "world-card-format",
  "music-atmosphere-cue-format",
  "beast-event-format",
  "content-safety-protocols",
  "anti-drift-continuity",
  "narrative-surface-hygiene",
  "glossary-block-renderer",
  "writing-style-renderer",
  "cultural-prose-renderer",
  "fate-pressure-renderer",
  "pacing-block-renderer",
  "next-scene-block-renderer",
  "thread-aging-renderer",
  "context-budgeting-rules",
  "context-manifest-envelope",
  "response-cleanup-rules",
] as const;

const EXPECTED_FLAG_IDS = [
  "fixture-fate-pressure-field",
  "chapter-writing-style-ownership",
  "fate-pressure-vocabulary-bridge",
  "story-style-cultural-prose-bridge",
  "workshop-inspection-only-modules",
  "story-administrative-metadata",
  "legacy-context-engine-v1-prompt-branch",
  "seed-world-rules-bridge",
  "seed-glossary-bridge",
] as const;

const normalizeText = (value: string) => value
  .replace(/"generatedAt":\s*"[^"]+"/g, '"generatedAt": "<generatedAt>"')
  .replace(/"syncRevision":\s*"[^"]+"/g, '"syncRevision": "<syncRevision>"')
  .replace(/"updatedAt":\s*"[^"]+"/g, '"updatedAt": "<updatedAt>"');

const normalizeFinalOutput = (value: unknown) => JSON.parse(normalizeText(JSON.stringify(value)));
const hash = (value: unknown) => {
  const text = JSON.stringify(value);
  let first = 0x811c9dc5;
  let second = 0x01000193;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ (code + (index & 0xff)), 0x85ebca6b) >>> 0;
  }
  return `${first.toString(16).padStart(8, "0")}${second.toString(16).padStart(8, "0")}`;
};

const captureAssembly = (result: { stages: {
  key: string;
  name: string;
  description: string;
  included: boolean;
  tokenEstimate: number;
  sizeChars: number;
  format: string;
  content: string;
}[]; finalOutput: unknown }): BaselineCapture => ({
  stageCount: result.stages.length,
  stageKeys: result.stages.map(stage => stage.key),
  stagesHash: hash(result.stages.map(stage => ({
    key: stage.key,
    name: stage.name,
    description: stage.description,
    included: stage.included,
    tokenEstimate: stage.tokenEstimate,
    sizeChars: stage.sizeChars,
    format: stage.format,
    content: normalizeText(stage.content),
  }))),
  finalOutputHash: hash(normalizeFinalOutput(result.finalOutput)),
});

describe("Chapter Generation packet assembly", () => {
  it("assembles all four packages from the existing scenario", () => {
    const packet = assembleChapterGenerationPacket(ESTABLISHED_SCENARIO, {
      recentSceneTypes: ["worldBuilding", "conflict", "progression"],
      fatePressureTier: "Balanced",
    });

    expect(packet.storyConstitution.mainCharacterName).toBe("Wen Shu");
    expect(packet.livingStoryState.position.display).toBe("Arc 1 — Chapter 6/100");
    expect(packet.chapterMission).toMatchObject({
      number: 6,
      title: "What the Seal Let Out",
      premise: ESTABLISHED_SCENARIO.currentChapter.premise,
      pacingDirective: ESTABLISHED_SCENARIO.pacingDirective,
    });
    expect(packet.chapterMission.contract).toEqual(buildChapterContract({
      chapterNumber: 6,
      premise: ESTABLISHED_SCENARIO.currentChapter.premise,
      previousHandoff: ESTABLISHED_SCENARIO.previousHandoff,
      recentFingerprints: ESTABLISHED_SCENARIO.recentFingerprints,
    }));
    expect(packet.chapterMission.selectedScenePath).toBeDefined();
    expect(packet.generationRules.prompts.system).toContain("OUTPUT FORMAT TARGET");
    expect(buildLegacyGenerationMemory(packet)).toEqual(ESTABLISHED_SCENARIO.memory);
  });

  it("traces every tracked instruction exactly once into a valid package", () => {
    const packet = assembleChapterGenerationPacket(ESTABLISHED_SCENARIO);
    const validPackages: ChapterGenerationPackageId[] = [
      "storyConstitution",
      "livingStoryState",
      "chapterMission",
      "generationRules",
    ];
    const ids = packet.trace.map(entry => entry.id);

    expect(packet.trace).toHaveLength(65);
    expect(new Set(ids).size).toBe(ids.length);
    packet.trace.forEach(entry => {
      expect(validPackages).toContain(entry.packageId);
      if (entry.rendererPackageId) expect(entry.rendererPackageId).toBe("generationRules");
    });

    expect([...ids].sort()).toEqual([...EXPECTED_TRACE_IDS].sort());
  });

  it("retains unresolved or foreign items as explicit flags", () => {
    const packet = assembleChapterGenerationPacket(ESTABLISHED_SCENARIO);
    const flagIds = packet.flags.map(flag => flag.id);
    const flags = Object.fromEntries(packet.flags.map(flag => [flag.id, flag]));

    expect(packet.flags).toHaveLength(9);
    expect(new Set(flagIds).size).toBe(flagIds.length);
    expect([...flagIds].sort()).toEqual([...EXPECTED_FLAG_IDS].sort());
    expect(flags["fixture-fate-pressure-field"]?.severity).toBe("dead-field");
    expect(flags["chapter-writing-style-ownership"]?.severity).toBe("needs-owner-decision");
    expect(flags["fate-pressure-vocabulary-bridge"]?.severity).toBe("needs-owner-decision");
    expect(flags["story-style-cultural-prose-bridge"]?.severity).toBe("needs-owner-decision");
    expect(flags["workshop-inspection-only-modules"]?.severity).toBe("out-of-scope");
    expect(flags["legacy-context-engine-v1-prompt-branch"]?.severity).toBe("dead-field");
    expect(flags["seed-world-rules-bridge"]?.severity).toBe("needs-owner-decision");
    expect(flags["seed-glossary-bridge"]?.severity).toBe("needs-owner-decision");
  });
});

describe("Chapter Generation behavior preservation", () => {
  it("matches every Reference scenario to its pre-refactor normalized behavior hashes", () => {
    (Object.entries(baseline.reference) as [ScenarioId, BaselineCapture][]).forEach(
      ([scenarioId, expected]) => {
        expect(captureAssembly(assembleChapterGeneration(scenarioId))).toEqual(expected);
      },
    );
  });

  it("matches every Development scenario/rhythm/prose combination to its normalized behavior hashes", () => {
    const scenarioIds: ScenarioId[] = ["opening", "established"];
    const proseOverrides: CulturalProseOverride[] = [
      "story-default",
      "none",
      "chinese-modern-progression",
    ];

    scenarioIds.forEach(scenarioId => {
      RHYTHM_SCENARIOS.forEach(rhythmScenario => {
        proseOverrides.forEach(proseOverride => {
          const key = `${scenarioId}/${rhythmScenario.id}/${proseOverride}`;
          expect(
            captureAssembly(assembleChapterGenerationDev(scenarioId, rhythmScenario.id, proseOverride)),
            key,
          ).toEqual(baseline.development[key]);
        });
      });
    });
  });
});
