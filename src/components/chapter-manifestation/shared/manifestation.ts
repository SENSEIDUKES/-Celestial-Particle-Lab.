/**
 * Aura Veil manifestation modes — the shared contract behind the veil's
 * active manifestation zone.
 *
 * One shared manifestation shell (Versa presence, aura + ambient atmosphere,
 * status/progress presentation, journey scrubber, responsive layout) hosts
 * exactly two manifestation modes:
 *
 *   1. Narrative manifestation — story and narrative-generation operations.
 *      Uses the narrative active zone: the manifestation chamber with its
 *      system-selected omen scenes.
 *   2. Media manifestation — standalone media-generation operations (outside
 *      the Reader Chamber and Codex). Uses the media active zone: an
 *      agnostic celestial scroll reveal (sealed → unsealing → revealed)
 *      rather than narrative scenes.
 *
 * Only the active manifestation zone and the operation-specific language
 * change between the modes; the shell is identical.
 *
 * EXPLICIT EXCLUSIONS — never route these through the Aura Veil modes:
 * Reader Chamber manifestation, Codex manifestation, and Narration. Those
 * systems already have (or will have) their own dedicated manifestation
 * logic. `AURA_VEIL_EXCLUDED_SYSTEMS` names them so future callers can
 * recognize the boundary instead of adding them here.
 */

export type ManifestationMode = 'narrative' | 'media';

/** Story and narrative-generation operations routed through narrative mode. */
export const NARRATIVE_OPERATIONS = [
  'blueprint',     // World Blueprint
  'initial-arc',   // Initial Arc
  'steer',         // Steering
  'alter-fate',    // Alter Fate
  'chapter',       // Chapter
] as const;
export type NarrativeOperation = (typeof NARRATIVE_OPERATIONS)[number];

/**
 * Standalone media-generation operations routed through media mode.
 * Future standalone media asset types join this list (and `MediaKind` below)
 * — that is the intended extension point of the whole taxonomy.
 */
export const MEDIA_OPERATIONS = [
  'cover',         // Cover Art
  'image',         // Image
  'audio',         // Audio
  'visual',        // Visual / Motion
] as const;
export type MediaOperation = (typeof MEDIA_OPERATIONS)[number];

/**
 * Systems with their own dedicated manifestation logic. They must NOT be
 * routed through the Aura Veil's narrative or media modes.
 */
export const AURA_VEIL_EXCLUDED_SYSTEMS = [
  'reader-chamber',
  'codex',
  'narration',
] as const;

/** The asset family a media operation is forming. */
export type MediaKind = 'cover-art' | 'image' | 'audio' | 'visual-motion';

/** Short display label per media kind (operation-specific language). */
export const MEDIA_KIND_LABEL: Record<MediaKind, string> = {
  'cover-art': 'Cover Art',
  image: 'Image',
  audio: 'Audio',
  'visual-motion': 'Visual / Motion',
};

/**
 * Media reveal progression inside the media active zone:
 *   sealed    — the celestial scroll is closed, its seal intact
 *   unsealing — generation in flight: the seal breaks, the scroll parts
 *   revealed  — the scroll hangs open with the finished asset inside
 */
export type MediaRevealState = 'sealed' | 'unsealing' | 'revealed';

/** A finished media asset the scroll can reveal. */
export interface RevealedMediaAsset {
  src: string;
  alt: string;
}

/**
 * What the shell's active manifestation zone should render. Carried on the
 * LoadingTaskCard so the veil needs no operation knowledge beyond the card.
 *
 * - narrative: `sceneId` names an omen scene; omit it and the system
 *   selects one (seeded per operation) from the narrative zone's registry.
 * - media: `mediaKind` + `reveal` drive the scroll reveal; `asset` is the
 *   produced media once available.
 */
export type ManifestationSpec =
  | {
      mode: 'narrative';
      sceneId?: string;
    }
  | {
      mode: 'media';
      mediaKind: MediaKind;
      reveal: MediaRevealState;
      asset?: RevealedMediaAsset | null;
    };

/** The narrative variant of the spec (narrative zone props derive from it). */
export type NarrativeManifestation = Extract<ManifestationSpec, { mode: 'narrative' }>;
/** The media variant of the spec (media zone props derive from it). */
export type MediaManifestation = Extract<ManifestationSpec, { mode: 'media' }>;

/**
 * Resolve an operation id to its manifestation mode. Narrative is the
 * default: unknown or missing ids resolve to narrative so the shell always
 * has a zone to render. The excluded systems above are not operations and
 * should never reach this resolver.
 */
export function manifestationModeForOperation(
  operationId: string | null | undefined,
): ManifestationMode {
  return (MEDIA_OPERATIONS as readonly string[]).includes(operationId ?? '')
    ? 'media'
    : 'narrative';
}

/** Resolve a media operation id to its asset family (defaults to 'image'). */
export function mediaKindForOperation(
  operationId: string | null | undefined,
): MediaKind {
  switch (operationId) {
    case 'cover':
      return 'cover-art';
    case 'audio':
      return 'audio';
    case 'visual':
      return 'visual-motion';
    default:
      return 'image';
  }
}

/**
 * Build the ManifestationSpec for an operation. Callers may pass overrides
 * (an explicit omen scene, or a media reveal state / finished asset);
 * everything else resolves from the taxonomy.
 */
export function buildManifestationSpec(
  operationId: string | null | undefined,
  options?: {
    sceneId?: string;
    reveal?: MediaRevealState;
    asset?: RevealedMediaAsset | null;
  },
): ManifestationSpec {
  if (manifestationModeForOperation(operationId) === 'media') {
    return {
      mode: 'media',
      mediaKind: mediaKindForOperation(operationId),
      reveal: options?.reveal ?? (options?.asset ? 'revealed' : 'unsealing'),
      asset: options?.asset ?? null,
    };
  }
  return { mode: 'narrative', sceneId: options?.sceneId };
}

/**
 * Operation-specific language: the short atmospheric status lines Versa
 * cycles through while the veil is open. Each mode owns its set — narrative
 * speaks of chapters and continuity, media of pigments and unsealing.
 */
export const NARRATIVE_STATUS_LINES = [
  'Cooking the chapter',
  'Forging continuity',
  'Weaving celestial threads',
  'Condensing spiritual essence',
  'Consulting the Codex',
  'Binding narrative threads',
];

export const MEDIA_STATUS_LINES = [
  'Gathering celestial pigments',
  'Unsealing the vision',
  'Binding starlight into form',
  'Condensing ethereal ink',
  'Polishing the revealed image',
  'Sealing the vision in gold',
];

/** Tracker detail line for a media operation, by reveal progression. */
export function mediaTrackerDetail(reveal: MediaRevealState): string {
  switch (reveal) {
    case 'sealed':
      return 'Celestial scroll sealed';
    case 'revealed':
      return 'Manifestation Complete';
    default:
      return 'Unsealing the celestial scroll';
  }
}
