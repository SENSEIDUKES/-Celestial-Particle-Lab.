/**
 * Story Seed replica types — a portable subset of Light-Novels `src/types.ts`
 * (verified there at lines ~1026-1143 on `main`). Production `src/types.ts`
 * remains authoritative; this file is Workshop-only and never transferred
 * back (same precedent as `reader-chamber/shared/types.ts`).
 */

export interface IntakeCharacter {
  id: string;
  name: string;
  aliases?: string[];
  age?: string;
  skinTone?: string;
  eyeColor?: string;
  powerType?: string;
  rankLevel?: string;
  role?: string;
  connectionToMC?: string;
  bio?: string;
}

export interface IntakeFaction {
  id: string;
  name: string;
  aliases?: string[];
  role?: string;
  powerLevel?: string;
  alignment?: string;
  connectionToMC?: string;
  description?: string;
}

export interface IntakeData {
  // Creator (Phase 2 — the creator family's first user-facing field)
  creatorPenName?: string;

  // 1. Core Seed
  novelTitle?: string;
  mcName?: string;
  genrePath?: string;
  corePremise?: string;
  proseStyle?: string;
  desiredPlotDirection?: string;
  storyTags?: string[];
  destinedEnding?: string;
  estimatedArcs?: number;

  // 2. World Setting
  worldType?: string;
  startingLocation?: string;
  societyStructure?: string;
  dangerLevel?: string;
  generalAtmosphere?: string;
  /** Wider reality beyond the starting region (Phase 2 — feeds world.optional.universe). */
  universeOverview?: string;
  /** One mystery per line (Phase 2 — feeds world.optional.majorMysteries). */
  majorMysteries?: string;

  // 3. Main Character Setup
  startingIdentity?: string;
  personality?: string;
  mainFlaw?: string;
  secretAdvantage?: string;
  startingWeakness?: string;
  moralAlignment?: string;
  mcBio?: string;

  // 3.5. Character Intake
  customCharacters?: IntakeCharacter[];

  // 3.8. Faction Intake
  customFactions?: IntakeFaction[];

  // 4. Power System Seed
  startingPowerConcept?: string;
  powerFlavor?: string;
  powerPace?: string;
  knownRanks?: string;
  uniquePath?: string;

  // 5. Plot & Trope Control
  longTermGoal?: string;
  firstMajorConflict?: string;
  mainAntagonistPressure?: string;
  romanceLevel?: string;
  faceSlappingLevel?: string;
  comedyLevel?: string;
  tournamentArcPreference?: string;
  haremPreference?: string;
  betrayalLevel?: string;
  thingsToAvoid?: string;
  mustIncludeElements?: string;
  hardcoreFateMode?: boolean;
  fatePressure?: 'Relaxed' | 'Balanced' | 'Hardcore' | 'Dao Master';

  // 6. Make it Work (Absolute Custom Rule)
  makeItWorkInstruction?: string;
}

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

/** The complete, reusable inputs required to generate a story from a seed. */
export interface StorySeedPayload {
  intake: IntakeData;
  blueprint: WorldBlueprint;
}

/** Private account-owned seed metadata. Internal fields are never exported. */
export interface StorySeed extends StorySeedPayload {
  schemaVersion: 1;
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Minimal alias-bearing entry shape for `codexContext.ts`'s collision helper.
 * Production's `NamedCodexEntry` extends the full `BaseCodexEntry` (Codex
 * system, excluded from this replica) — only `aliases`/`id`/`name` are used
 * by the intake forms, so the Workshop shape is intentionally narrower.
 */
export interface NamedCodexEntry {
  id?: string;
  name?: string;
  aliases?: string[];
}
