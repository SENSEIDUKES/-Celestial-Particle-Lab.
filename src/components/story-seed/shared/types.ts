/**
 * Types genuinely shared by both Story Seed forks.
 *
 * The Story Seed contract itself is **not** here — it lives in
 * `storySeedSchema.ts`. The frozen Phase-1 flat intake contract that the
 * locked `reference/` replica still speaks lives in `referenceIntake.ts`.
 */

/** Generated blueprint output. Produced from a Story Seed; never stored inside one. */
export interface WorldBlueprint {
  title: string;
  logline: string;
  worldOverview: string;
  startingLocation: string;
  societyStructure: string;
  powerSystemOutline: string;
  mcProfile: string;
  majorFactions: string[];
  initialCharacters: string[];
  majorMysteries: string[];
  firstArcPromise: string;
  tropeRules: string;
  styleBible: string;
  destinedEnding?: string;
  estimatedArcs: number;
  unresolvedPlotThreads: string[];
}

/**
 * Minimal alias-bearing entry shape for `codexContext.ts`'s collision helper.
 * Production's `NamedCodexEntry` extends the full `BaseCodexEntry` (Codex
 * system, excluded from this replica) — only `aliases`/`id`/`name` are used
 * by the seed forms, so the Workshop shape is intentionally narrower.
 */
export interface NamedCodexEntry {
  id?: string;
  name?: string;
  aliases?: string[];
}
