/**
 * Development-only Workshop projection of the existing Chapter prompt's
 * media/effects-related instructions. It deliberately reads from the ported
 * production prompt instead of introducing a second set of direction rules.
 */

function findInstruction(source: string, startsWith: string): string {
  return source
    .split("\n")
    .find((line) => line.trimStart().startsWith(startsWith))
    ?.trim() ?? "";
}

function section(name: string, instruction: string): string {
  return instruction ? `${name}\n${instruction}` : "";
}

export function buildChapterEffectsDirection(
  systemInstruction: string,
  finalChapterInstructions: string,
): string {
  const sections = [
    "CHAPTER EFFECTS DIRECTION",
    "Existing chapter-generation instructions consolidated for Workshop inspection. This view does not select tracks, sounds, voices, or media assets.",
    section(
      "NARRATION AND DIALOGUE METADATA",
      [
        findInstruction(systemInstruction, "You MUST output strictly the chapter text structured as NDJSON"),
        findInstruction(systemInstruction, "For dialogue blocks, the \"metadata\" must contain"),
      ].filter(Boolean).join("\n"),
    ),
    section(
      "BEAST SOUND CUES",
      findInstruction(systemInstruction, "You can include a \"beastEvent\" object inside the block \"metadata\""),
    ),
    section(
      "WORLD CARD AUDIO AND VISUAL CUES",
      findInstruction(systemInstruction, "You can include a \"worldCard\" object on the block"),
    ),
    section(
      "SYSTEM PANEL VISUAL CUES",
      findInstruction(systemInstruction, "For any Celestial Library system moment"),
    ),
    section(
      "SCENE MUSIC DIRECTION",
      findInstruction(systemInstruction, "Additionally, emit a per-scene 'music' object"),
    ),
    section(
      "ATMOSPHERE DIRECTION",
      findInstruction(systemInstruction, "ATMOSPHERIC AUDIO METADATA:"),
    ),
    section(
      "NARRATIVE CUE PAYLOAD",
      findInstruction(finalChapterInstructions, "Also allow narrative cue payloads to carry normalized story metadata."),
    ),
  ].filter(Boolean);

  return sections.join("\n\n");
}
