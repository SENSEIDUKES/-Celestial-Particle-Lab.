import { AGENTS } from '../../../lib/agents';
import {
  buildManifestationSpec,
  type ManifestationSpec,
  type MediaRevealState,
  type RevealedMediaAsset,
} from './manifestation';

/**
 * LoadingTaskCard — the single interchangeable format every loading
 * presentation in the Workshop consumes. Any operation (AI generation,
 * retrieval, background jobs) normalizes its live information into this
 * shape, and either visual mode (primary veil or compact indicator) can
 * render it without knowing where it came from.
 */

export interface LoadingPhase {
  id: string;
  label: string;
}

export type LoadingTaskIcon =
  | { kind: 'image'; src: string; alt: string };

export interface LoadingTaskCard {
  /** Display name of the operation or agent, e.g. 'VERSA'. */
  operationName: string;
  /** Stable phase marker shown for the whole operation, e.g. 'Chapter 4 Manifestation'. Empty string hides the phase marker. */
  operationTitle: string;
  /** Emblem or glyph representing the operation. */
  icon: LoadingTaskIcon;
  /** Short live status line — the only text allowed to rotate while running. */
  status: string;
  /** Longer atmospheric description of the current phase. Empty string hides the phrase block. */
  description: string;
  /** 0–100 deterministic progress, or null for an indeterminate sweep. */
  progress: number | null;
  /** Known phases of the operation and which one is active. */
  phases: LoadingPhase[];
  activePhaseId: string | null;

  /** Persistent tracker line that never fades, e.g. 'Chapter 4'. */
  trackerTitle: string;
  /** Live tracker detail, e.g. '12 passages formed'. */
  trackerDetail: string;
  /** Optional explanatory note under the tracker. */
  trackerNote: string | null;
  /** Seconds remaining estimate, when known. */
  estimatedSecondsRemaining: number | null;

  /** Compact-mode copy. */
  compactTitle: string;
  compactBody: string;
  compactStatus: string;

  /** Presentation routing and accent. */
  agentId: 'versa' | 'scout';
  colorClass: string;
  /** Where the operation prefers to render; 'compact' for short/background tasks. */
  preferredMode: 'primary' | 'compact';

  /**
   * Aura Veil manifestation spec — which manifestation mode (narrative /
   * media) and active zone the primary veil renders, resolved from the
   * operation via the taxonomy in shared/manifestation.ts. Reader Chamber,
   * Codex, and Narration manifestations never appear here; they own their
   * dedicated manifestation logic elsewhere.
   */
  manifestation: ManifestationSpec;
}

/** Inputs the AILoadingVeil adapter resolves before building the card. */
export interface AILoadingTaskInput {
  generationPhase: string | null;
  generationProgressMessage: string | null;
  estimatedSecondsRemaining: number | null;
  activeAgentId: 'versa' | 'scout' | null;
  streamingBlocksCount: number;
  generatingChapterNum: number | null;
  /** Resolved live status line (rotating quote or progress message). */
  statusQuote: string;
  /** Resolved 0–100 progress, or null for indeterminate. */
  progress: number | null;
  /**
   * Optional Aura Veil overrides: an explicit narrative omen scene, or the
   * media reveal progression / finished asset. Omit for the taxonomy
   * defaults (system-selected omen scene; unsealing scroll).
   */
  omenSceneId?: string;
  mediaReveal?: MediaRevealState;
  mediaAsset?: RevealedMediaAsset | null;
}

/** Known AI generation phases, in narrative order. */
export const AI_PHASES: LoadingPhase[] = [
  { id: 'blueprint', label: 'Aetherial Mapping' },
  { id: 'initial-arc', label: 'Scripture Initiation' },
  { id: 'steer', label: 'Sovereign Shift' },
  { id: 'alter-fate', label: 'Fate Alteration' },
  { id: 'cover', label: 'Cover Reforging' },
  { id: 'image', label: 'Image Manifestation' },
  { id: 'audio', label: 'Audio Manifestation' },
  { id: 'visual', label: 'Motion Manifestation' },
  { id: 'chapter', label: 'Chapter Manifestation' },
];

/** Atmospheric phrases shown inside the primary veil card, per phase. */
export const AI_PHASE_PHRASES: Record<string, string> = {
  blueprint: 'Establishing foundational laws, power limitations, and planetary properties.',
  'initial-arc': 'Transcribing the grand volume ledger, compiling chapter milestones and character templates.',
  steer: 'Merging your custom instructions with fate timelines to trigger the subsequent 10 chapters.',
  'alter-fate': 'Rebinding the threads of fate around your chosen divergence.',
  cover: 'Translating core premise variables into bespoke high-fidelity digital art.',
  image: 'Condensing celestial pigments into a standalone vision.',
  audio: 'Weaving ethereal resonance into a standalone soundscape.',
  visual: 'Binding light and motion into a living tableau.',
  chapter: 'Celestial threads are being woven into narrative form.',
};

/**
 * Normalize the AILoadingVeil generation signals into a LoadingTaskCard.
 * Preserves every piece of information the original veils received —
 * phase copy, chapter tracker, passages count, and time estimates.
 */
export function buildAILoadingTaskCard(input: AILoadingTaskInput): LoadingTaskCard {
  const agent = input.activeAgentId === 'scout' ? AGENTS.SCOUT : AGENTS.VERSA;
  const isChapter = input.generationPhase === 'chapter';
  const chapterNum = input.generatingChapterNum;
  const passages = input.streamingBlocksCount;
  const phaseId = input.generationPhase;

  return {
    operationName: agent.name,
    operationTitle: !phaseId
      ? 'Consciousness Sync'
      : isChapter
        ? `Chapter ${chapterNum || ''} Manifestation`
        : AI_PHASES.find(p => p.id === phaseId)?.label ?? 'Celestial Engine',
    icon: { kind: 'image', src: agent.logoUrl, alt: agent.name },
    status: input.statusQuote,
    description: phaseId
      ? (AI_PHASE_PHRASES[phaseId] ?? 'Interfacing with the SEIHouse deep narrative engine.')
      : 'Interfacing with the SEIHouse deep narrative engine.',
    progress: input.progress,
    phases: AI_PHASES,
    activePhaseId: phaseId,
    trackerTitle: isChapter ? `Chapter ${chapterNum || ''}` : 'Celestial Engine',
    trackerDetail: isChapter
      ? (passages > 0 ? `${passages} passages formed` : 'Initiating Cosmic Channel')
      : 'Spiritual matrix forming',
    trackerNote: isChapter ? 'The chapter is revealed once its continuity is verified.' : null,
    estimatedSecondsRemaining: input.estimatedSecondsRemaining,
    compactTitle: isChapter ? `Forging Chapter ${chapterNum || ''}` : 'Celestial Engine',
    compactBody: isChapter
      ? `Chapter ${chapterNum || ''} is generating.`
      : 'Engine is forging spiritual matrix.',
    compactStatus: input.generationProgressMessage || 'Manifesting spiritual matrices...',
    agentId: agent.id,
    colorClass: agent.colorClass,
    // Scout and other short retrieval tasks never block the screen.
    preferredMode: agent.id === 'scout' ? 'compact' : 'primary',
    // Aura Veil manifestation spec — mode and active zone resolved from the
    // operation id via the shared taxonomy.
    manifestation: buildManifestationSpec(phaseId, {
      sceneId: input.omenSceneId,
      reveal: input.mediaReveal,
      asset: input.mediaAsset,
    }),
  };
}
