/**
 * Shared vocabulary for the Chapter Generation 1.0 information packages.
 *
 * The four packages are an internal organization boundary only: they group
 * the data and rules the existing orchestrators already use without changing
 * prompt text, prompt order, stage output, or the Workshop UI.
 */

export type ChapterGenerationPackageId =
  | "storyConstitution"
  | "livingStoryState"
  | "chapterMission"
  | "generationRules";

/**
 * Internal arc-local chapter position. The current Workshop stories use a
 * 100-chapter arc unless a future story contract supplies a different size.
 */
export interface ArcChapterPosition {
  arcNumber: number;
  chapterInArc: number;
  chaptersInArc: number;
  /** Example: "Arc 1 — Chapter 1/100". */
  display: string;
}

/** Traceability for one existing generation input or instruction. */
export interface ChapterInstructionTrace {
  id: string;
  packageId: ChapterGenerationPackageId;
  source: string;
  description: string;
  /**
   * Set when data lives in one package but a permanent Generation Rules
   * renderer turns it into prompt text (for example, glossary data versus
   * the glossary block wrapper).
   */
  rendererPackageId?: ChapterGenerationPackageId;
}

/** Something intentionally retained but not forced into a package. */
export interface ChapterPackageFlag {
  id: string;
  severity: "needs-owner-decision" | "dead-field" | "out-of-scope";
  source: string;
  message: string;
}
