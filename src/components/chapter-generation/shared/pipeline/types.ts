import type { GenerationStage } from "../stageTypes";
import type {
  ChapterContent,
  ChapterHandoff,
  ContextManifest,
} from "../types";
import type { ChapterMission } from "../packets/chapterMission";
import type { LivingStoryState } from "../packets/livingStoryState";
import type { StoryConstitution } from "../packets/storyConstitution";
import type {
  FatePressureTier,
  SceneAnchors,
  ScenePathSelection,
  SceneType,
} from "../lib/sceneRhythm";

export type ChapterPipelineStageKey =
  | "assemble-chapter-packet"
  | "plan-chapter"
  | "manifest-chapter"
  | "process-result";

export type ChapterModelCallKind = "plan" | "manifest" | "process" | "repair";

export interface ChapterPacketCulturalProse {
  source: "story-setting" | "workshop-override" | "fallback";
  styleId?: string;
  label?: string;
  instruction: string;
}

export interface ChapterPacketGenerationRules {
  systemInstruction: string;
  baseUserPrompt: string;
  permanentWritingInstructions: string;
  effectRules: string;
}

export interface ChapterPacketContextSection {
  key: string;
  text: string;
  estimatedTokens: number;
}

/** Serializable, model-visible packet assembled without a model call. */
export interface ChapterPacket {
  version: 1;
  /** The unresolved legacy FatePressureTier bridge is intentionally excluded. */
  storyConstitution: Omit<StoryConstitution, "fatePressureTier">;
  livingStoryState: LivingStoryState;
  chapterMission: ChapterMission;
  generationRules: ChapterPacketGenerationRules;
  existingAnchors?: SceneAnchors;
  relevantContext: {
    assembledText: string;
    sections: ChapterPacketContextSection[];
  };
  culturalProse: ChapterPacketCulturalProse;
  arcChapterPosition: LivingStoryState["position"];
  modelVisibleContext: string;
  contextManifest: ContextManifest;
}

export interface ChapterPlanningSignals {
  /** Workshop/adapter signal; separate from canonical Story Seed Fate Survival. */
  fatePressureTier?: FatePressureTier;
}

export interface ChapterFateDecision {
  configured: boolean;
  applies: boolean;
  visibility: "full" | "partial" | "none";
  pressure: "heaven" | "immortal" | "mortal";
  approach: string;
}

export type ChapterEffectKind =
  | "narration-metadata"
  | "beast-sound"
  | "world-card"
  | "system-panel"
  | "scene-music"
  | "atmosphere"
  | "narrative-cue";

export interface ChapterEffectSelection {
  kind: ChapterEffectKind;
  intent: string;
  required: boolean;
}

export interface ChapterPlan {
  version: 1;
  chapterNumber: number;
  arcChapterPosition: string;
  rhythmResponse: {
    recentSceneTypes: SceneType[];
    selectedPressureTier: FatePressureTier;
    direction: string;
  };
  selectedScenePath?: ScenePathSelection;
  fateSurvival: ChapterFateDecision;
  effects: ChapterEffectSelection[];
  sceneProgression: Array<{
    order: number;
    purpose: string;
    pacing: string;
  }>;
  pacing: {
    directive: string;
    shape: string;
  };
  intendedEnding: string;
  nextChapterHandoffTarget: string;
}

export interface ChapterProcessingFinding {
  severity: "info" | "warning" | "serious";
  code: string;
  message: string;
}

export interface ChapterProcessingResult {
  version: 1;
  newAnchors?: SceneAnchors;
  characterChanges: string[];
  worldStateChanges: string[];
  threads: {
    completed: string[];
    changed: string[];
    unresolved: Array<{ description: string; originChapter: number }>;
  };
  missionCompletion: {
    completed: boolean;
    evidence: string;
  };
  continuityFindings: ChapterProcessingFinding[];
  repetitionFindings: ChapterProcessingFinding[];
  nextChapterHandoff: ChapterHandoff;
  proposedLivingStoryState: LivingStoryState;
  repairRecommended: boolean;
}

export interface PlanChapterInput {
  chapterPacket: ChapterPacket;
  planningSignals: ChapterPlanningSignals;
}

export interface ManifestChapterInput {
  chapterPacket: ChapterPacket;
  chapterPlan: ChapterPlan;
  consolidatedPermanentInstructions: string;
}

export interface ProcessChapterInput {
  chapterPacket: ChapterPacket;
  chapterPlan: ChapterPlan;
  manifestedChapter: ChapterContent;
}

export interface RepairChapterInput extends ProcessChapterInput {
  processingResult: ChapterProcessingResult;
}

/** Provider boundary: three normal calls and one optional repair call. */
export interface ChapterGenerationModelCalls {
  planChapter(input: PlanChapterInput): ChapterPlan;
  manifestChapter(input: ManifestChapterInput): ChapterContent;
  processResult(input: ProcessChapterInput): ChapterProcessingResult;
  repairChapter?(input: RepairChapterInput): ChapterContent;
}

export interface ChapterPipelineRun {
  stages: GenerationStage[];
  finalOutput: ChapterContent;
  chapterPacket: ChapterPacket;
  chapterPlan: ChapterPlan;
  manifestedChapter: ChapterContent;
  processingResult: ChapterProcessingResult;
  modelCalls: ChapterModelCallKind[];
  repairApplied: boolean;
}
