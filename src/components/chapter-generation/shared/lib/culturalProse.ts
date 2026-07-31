/**
 * Cultural Prose Style catalog — ported from the approved research at
 * `LIBRARY CORE/LIBRARY/INFO/SEN - EAST ASIAN PROSE .docx` (extracted
 * 2026-07-31). The six styles, their trait bullets, and the example labels
 * below are copied verbatim from that document; nothing here is invented.
 *
 * The document organizes six leaf styles under three traditions, each
 * tradition contributing shared "general" traits plus two style-specific
 * trait sets:
 *   Chinese cultivation  -> Classical worldbuilding, Modern progression
 *   Japanese light novels -> Character comedy, Serious fantasy
 *   Korean web novels     -> Dungeon power fantasy, Romantic drama
 *
 * This is a Workshop/Development-only addition — no production code path
 * reads from this file yet. It's written to be easy to lift into
 * Light-Novels `src/server/` once approved (pure, no Workshop-only concerns).
 */

export type CulturalProseStyleId =
  | "chinese-classical-worldbuilding"
  | "chinese-modern-progression"
  | "japanese-character-comedy"
  | "japanese-serious-fantasy"
  | "korean-dungeon-power-fantasy"
  | "korean-romantic-drama";

export type CulturalProseTradition =
  | "Chinese cultivation"
  | "Japanese light novels"
  | "Korean web novels";

export interface CulturalProseStyle {
  id: CulturalProseStyleId;
  label: string;
  tradition: CulturalProseTradition;
  subStyle: string;
  /** General traits shared by every style under this tradition, verbatim from the doc. */
  traditionTraits: string[];
  /** Traits specific to this leaf style, verbatim from the doc. */
  styleTraits: string[];
  /** The doc's own numbered example label, for traceability back to the source. */
  exampleLabel: string;
  /** A short, verbatim excerpt of the doc's worked example for this style (not the full passage). */
  exampleExcerpt: string;
}

export const CULTURAL_PROSE_STYLES: Record<CulturalProseStyleId, CulturalProseStyle> = {
  "chinese-classical-worldbuilding": {
    id: "chinese-classical-worldbuilding",
    label: "Chinese Classical — Worldbuilding",
    tradition: "Chinese cultivation",
    subStyle: "Classical worldbuilding",
    traditionTraits: [],
    styleTraits: [
      "Larger, older-feeling worlds",
      "Longer and more flowing sentence structures",
      "Formal narration and dialogue",
      "Classical sayings, philosophical language, historical allusions, and cultural concepts",
      "Worldbuilding through sect history, ancient places, forgotten inheritances, cosmic cycles, and lore",
      "The individual scene is framed as one small event within a much greater history",
    ],
    exampleLabel: "1. Chinese Classical — Worldbuilding",
    exampleExcerpt:
      "The mist did not move like weather. It hung in the valley the way old grief hangs in a house nobody has sold — patient, familiar, unwilling to leave.",
  },
  "chinese-modern-progression": {
    id: "chinese-modern-progression",
    label: "Chinese Modern — Progression",
    tradition: "Chinese cultivation",
    subStyle: "Modern progression",
    traditionTraits: [],
    styleTraits: [
      "Faster, more protagonist-centered prose",
      "Shorter and more forceful sentences",
      "Social conflict built around status, reputation, hierarchy, and face",
      "Breakthroughs, hidden strength, public reversals, and witnesses who understand the significance",
      "Worldbuilding delivered through power systems, rankings, conflict, and reaction rather than broad historical narration",
    ],
    exampleLabel: "2. Chinese Modern — Progression",
    exampleExcerpt:
      "\"You want this?\" Chen turned the pill between two fingers, unhurried, the way a man decides whether a stray is worth feeding. \"You'd have to be worth something first.\"",
  },
  "japanese-character-comedy": {
    id: "japanese-character-comedy",
    label: "Japanese — Character Comedy",
    tradition: "Japanese light novels",
    subStyle: "Character comedy",
    traditionTraits: [
      "First-person or very close third-person perspective",
      "Heavy use of internal narration",
      "Dialogue doing much of the story work",
      "World information introduced through what characters see, discuss, misunderstand, or react to",
      "Shorter, spoken-feeling sentences",
      "Large events filtered through immediate personal concerns",
    ],
    styleTraits: [
      "Self-aware internal narration",
      "Contrast between what the protagonist thinks, says, and does",
      "Personality clashes, misunderstanding, quick dialogue, and reaction timing",
    ],
    exampleLabel: "3. Japanese — Character Comedy",
    exampleExcerpt:
      "For the record, I asked for none of this. A quiet plot of land, some cabbages, a life boring enough that my name would never appear in a sentence next to the word \"legendary\" — that was the whole plan.",
  },
  "japanese-serious-fantasy": {
    id: "japanese-serious-fantasy",
    label: "Japanese — Serious Fantasy",
    tradition: "Japanese light novels",
    subStyle: "Serious fantasy",
    traditionTraits: [
      "First-person or very close third-person perspective",
      "Heavy use of internal narration",
      "Dialogue doing much of the story work",
      "World information introduced through what characters see, discuss, misunderstand, or react to",
      "Shorter, spoken-feeling sentences",
      "Large events filtered through immediate personal concerns",
    ],
    styleTraits: [
      "Intimate character perspective",
      "Atmospheric but still accessible prose",
      "Personal emotions carrying more weight than abstract world history",
      "Quiet dialogue, pauses, memories, and unresolved history",
    ],
    exampleLabel: "4. Japanese — Serious Fantasy",
    exampleExcerpt:
      "The rain in the Forgotten Woods did not fall so much as drift, unwilling to commit to landing. It soaked through everything regardless.",
  },
  "korean-dungeon-power-fantasy": {
    id: "korean-dungeon-power-fantasy",
    label: "Korean — Dungeon Power Fantasy",
    tradition: "Korean web novels",
    subStyle: "Dungeon power fantasy",
    traditionTraits: [
      "Clear, efficient sentences",
      "Short paragraphs",
      "Persistent forward movement",
      "Chapters designed to create immediate continuation pressure",
      "Progress that is easy to understand and feel",
    ],
    styleTraits: [
      "Tactical internal narration",
      "Threat assessment, resources, rewards, rankings, abilities, and system information",
      "Direct dialogue",
      "Clear progression",
      "A detached or analytical perspective during danger",
    ],
    exampleLabel: "5. Korean — Dungeon Power Fantasy",
    exampleExcerpt:
      "I didn't need the little blue warning at the corner of my vision to tell me we weren't supposed to be here. I already knew. I closed it anyway, out of habit more than need.",
  },
  "korean-romantic-drama": {
    id: "korean-romantic-drama",
    label: "Korean — Romantic Drama",
    tradition: "Korean web novels",
    subStyle: "Romantic drama",
    traditionTraits: [
      "Clear, efficient sentences",
      "Short paragraphs",
      "Persistent forward movement",
      "Chapters designed to create immediate continuation pressure",
      "Progress that is easy to understand and feel",
    ],
    styleTraits: [
      "Close perspective",
      "Attention to pauses, expressions, memories, status, and unspoken feelings",
      "Dialogue carrying subtext",
      "Progress expressed through relationship changes instead of power levels",
    ],
    exampleLabel: "6. Korean — Romantic Drama",
    exampleExcerpt:
      "The elevator opened onto a room quieter than anything we'd spent the last twelve hours clearing.",
  },
};

export const CULTURAL_PROSE_STYLE_IDS = Object.keys(CULTURAL_PROSE_STYLES) as CulturalProseStyleId[];

export type CulturalProseStyleSource = "story-setting" | "workshop-override" | "fallback";

export interface CulturalProseSelection {
  style?: CulturalProseStyle;
  source: CulturalProseStyleSource;
}

/**
 * Renders the dedicated CULTURAL PROSE STYLE instruction block. Kept as its
 * own clearly-delimited, headed block (matching the existing STYLE
 * DIRECTIVE / FATE PRESSURE block conventions in `chapterPrompts.ts` /
 * `storyRouter.ts`) specifically so it is never merged into or mistaken for
 * genre/story-tag wording.
 */
export function renderCulturalProseInstruction(style: CulturalProseStyle): string {
  const traits = [...style.traditionTraits, ...style.styleTraits];
  return `=========================================
CULTURAL PROSE STYLE: ${style.label}
=========================================
Apply this prose voice to narrative cadence, dialogue style, description density, emotional expression, exposition/world-building delivery, humor or restraint, chapter pacing, and how scenes and the chapter itself end:
${traits.map(trait => `- ${trait}`).join("\n")}
=========================================`;
}

const FALLBACK_NOTE =
  "No cultural prose style is set for this story — generation falls back to the genre/style-bible directive alone; no CULTURAL PROSE STYLE block is added to the prompt.";

/**
 * Resolves which style (if any) applies, and why — the "chosen style, exact
 * instructions, source, and fallback" the Workshop needs to show.
 */
export function resolveCulturalProseSelection(
  styleId: CulturalProseStyleId | undefined,
  source: CulturalProseStyleSource,
): CulturalProseSelection {
  if (!styleId) return { style: undefined, source: "fallback" };
  return { style: CULTURAL_PROSE_STYLES[styleId], source };
}

export function describeCulturalProseSelection(selection: CulturalProseSelection): string {
  if (!selection.style) {
    return `Selected style: none\nSource: ${selection.source}\n\n${FALLBACK_NOTE}`;
  }
  const sourceLabel: Record<CulturalProseStyleSource, string> = {
    "story-setting": "Story setting (this story's configured cultural prose style)",
    "workshop-override": "Workshop override (selector forced this style for testing)",
    fallback: "Fallback",
  };
  return `Selected style: ${selection.style.label} (${selection.style.tradition} — ${selection.style.subStyle})
Source: ${sourceLabel[selection.source]}
Fallback behavior when unset: ${FALLBACK_NOTE}

--- INSTRUCTION SENT TO GENERATION ---
${renderCulturalProseInstruction(selection.style)}

--- SOURCE REFERENCE (SEN - EAST ASIAN PROSE.docx, ${selection.style.exampleLabel}) ---
"${selection.style.exampleExcerpt}"`;
}
