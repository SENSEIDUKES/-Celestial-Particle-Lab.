import assert from "node:assert/strict";
import { buildChapterEffectsDirection } from "../src/components/chapter-generation/development/chapterEffectsDirection.ts";
import { CHAPTER_PROMPTS } from "../src/components/chapter-generation/shared/lib/chapterPrompts.ts";

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

const direction = buildChapterEffectsDirection(CHAPTER_PROMPTS.system, finalChapterInstructions);

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
  assert.ok(direction.includes(openingDetail), `${category} is missing its opening instruction.`);
  assert.ok(direction.includes(laterDetail), `${category} is missing a representative later detail.`);
}

console.log("Chapter Effects Direction contains complete representative details for all seven effect categories.");
