import assert from "node:assert/strict";
import { CHAPTER_PROMPTS } from "../src/components/chapter-generation/shared/lib/chapterPrompts.ts";
import { buildChapterEffectRules } from "../src/components/chapter-generation/shared/pipeline/chapterEffectRules.ts";

const finalChapterInstructions = CHAPTER_PROMPTS.userPrompt(
  6,
  "The Cracked Shrine",
  "Continue from the previous chapter.",
  "Wen Shu",
  "Xianxia",
  "A buried inheritance awakens.",
  "WORKSHOP_MEMORY_SENTINEL",
  "",
  true,
  "",
  "",
  ["cultivation"],
  "v2",
);

const rules = buildChapterEffectRules(
  CHAPTER_PROMPTS.system,
  finalChapterInstructions,
);

const representativeDetails = [
  ["narration and dialogue metadata", "OUTPUT FORMAT TARGET:", "DO NOT output direct voice IDs."],
  ["beast sound cues", "BEAST SOUND CUES", "Use this sparingly and only on significant narrative beats."],
  ["World Card audio and visual cues", "WORLD CARD AUDIO AND VISUAL CUES", "matching is handled by the reader."],
  ["system-panel visual cues", "SYSTEM PANEL VISUAL CUES", "DOOM MANIFESTED"],
  ["scene music", "SCENE MUSIC DIRECTION", '"boss-fight"'],
  ["atmosphere", "ATMOSPHERE DIRECTION", "never infer rain merely because characters are travelling."],
  ["narrative cue payloads", "NARRATIVE CUE PAYLOAD", "DO NOT generate summary or memory updates"],
] as const;

for (const [category, openingDetail, laterDetail] of representativeDetails) {
  assert.ok(rules.includes(openingDetail), `${category} is missing its opening instruction.`);
  assert.ok(rules.includes(laterDetail), `${category} is missing a representative later detail.`);
}

console.log("The Chapter Packet contains complete permanent rules for all seven effect categories.");
