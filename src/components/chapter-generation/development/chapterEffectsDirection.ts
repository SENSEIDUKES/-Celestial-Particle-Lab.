/**
 * Development-only Workshop projection of the existing Chapter prompt's
 * media/effects-related instructions. It deliberately reads from the ported
 * production prompt instead of introducing a second set of direction rules.
 */

interface InstructionBoundary {
  start: string;
  end?: string;
}

/** Extract one complete prompt block between stable neighboring instructions. */
function extractInstructionBlock(source: string, boundary: InstructionBoundary): string {
  const startIndex = source.indexOf(boundary.start);
  if (startIndex < 0) return "";

  if (!boundary.end) return source.slice(startIndex).trim();

  const endIndex = source.indexOf(boundary.end, startIndex + boundary.start.length);
  if (endIndex < 0) return "";

  return source.slice(startIndex, endIndex).trim();
}

/** Render a labeled Workshop section only when its source block was found. */
function section(name: string, instruction: string): string {
  return instruction ? `${name}\n${instruction}` : "";
}

/**
 * Group the complete existing media/effects prompt blocks for inspection.
 * This reads prompt text only; it does not alter the prompt or direct media.
 */
export function buildChapterEffectsDirection(
  systemInstruction: string,
  finalChapterInstructions: string,
): string {
  const sections = [
    "CHAPTER EFFECTS DIRECTION",
    "Existing chapter-generation instructions consolidated for Workshop inspection. This view does not select tracks, sounds, voices, or media assets.",
    section(
      "NARRATION AND DIALOGUE METADATA",
      extractInstructionBlock(systemInstruction, {
        start: "OUTPUT FORMAT TARGET:",
        end: "You can include a \"beastEvent\" object inside the block \"metadata\"",
      }),
    ),
    section(
      "BEAST SOUND CUES",
      extractInstructionBlock(systemInstruction, {
        start: "You can include a \"beastEvent\" object inside the block \"metadata\"",
        end: "You can include a \"worldCard\" object on the block",
      }),
    ),
    section(
      "WORLD CARD AUDIO AND VISUAL CUES",
      extractInstructionBlock(systemInstruction, {
        start: "You can include a \"worldCard\" object on the block",
        end: "For any Celestial Library system moment",
      }),
    ),
    section(
      "SYSTEM PANEL VISUAL CUES",
      extractInstructionBlock(systemInstruction, {
        start: "For any Celestial Library system moment",
        end: "For each block, list all notable codex entities referenced",
      }),
    ),
    section(
      "SCENE MUSIC DIRECTION",
      extractInstructionBlock(systemInstruction, {
        start: "Additionally, emit a per-scene 'music' object",
        end: "ATMOSPHERIC AUDIO METADATA:",
      }),
    ),
    section(
      "ATMOSPHERE DIRECTION",
      extractInstructionBlock(systemInstruction, {
        start: "ATMOSPHERIC AUDIO METADATA:",
        end: "Example:",
      }),
    ),
    section(
      "NARRATIVE CUE PAYLOAD",
      extractInstructionBlock(finalChapterInstructions, {
        start: "Also allow narrative cue payloads to carry normalized story metadata.",
      }),
    ),
  ].filter(Boolean);

  return sections.join("\n\n");
}
