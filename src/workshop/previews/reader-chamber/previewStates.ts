import type { CinematicScrollStateName } from '../../../components/reader-chamber/shared/stubs';

export type PreviewState =
  | 'reading'
  | 'preferences-open'
  | 'bookmarks-open'
  | 'alter-fate-open'
  | 'continuity-warning'
  | 'generating'
  | 'translating'
  | 'fullscreen'
  | 'death-scene'
  | 'empty-chapter'
  | 'auto-scroll-paused';

/**
 * `uiAction` names a real in-chamber control the simulator clicks after the
 * chamber remounts, so every state exercises the production interaction path
 * instead of faking it with Workshop-only props.
 */
export type PreviewUiAction = 'preferences' | 'bookmarks' | 'alter-fate' | 'seal';

export interface PreviewScenario {
  id: PreviewState;
  label: string;
  /** Chapter the chamber opens on for this state. */
  chapter: number;
  isGenerating?: boolean;
  isTranslating?: boolean;
  isReaderFullscreen?: boolean;
  cinematicScrollState?: CinematicScrollStateName;
  uiAction?: PreviewUiAction;
}

export const scenarios: PreviewScenario[] = [
  { id: 'reading', label: 'Reading (rich blocks chapter)', chapter: 1 },
  { id: 'preferences-open', label: 'Reader Settings open', chapter: 1, uiAction: 'preferences' },
  { id: 'bookmarks-open', label: 'Chronicle Anchors open', chapter: 1, uiAction: 'bookmarks' },
  { id: 'alter-fate-open', label: 'Alter Fate panel open', chapter: 1, uiAction: 'alter-fate' },
  { id: 'continuity-warning', label: 'Continuity Guard warning (Seal flow)', chapter: 1, uiAction: 'seal' },
  { id: 'generating', label: 'Generating chapter (skeleton)', chapter: 4, isGenerating: true },
  { id: 'translating', label: 'Translating (Heavenly Dao spinner)', chapter: 1, isTranslating: true },
  { id: 'fullscreen', label: 'Fullscreen reading', chapter: 1, isReaderFullscreen: true },
  { id: 'death-scene', label: 'Death / critical scene (sealed ch. 3)', chapter: 3 },
  { id: 'empty-chapter', label: 'Unmanifested Segment (empty ch. 4)', chapter: 4 },
  { id: 'auto-scroll-paused', label: 'Auto-scroll paused (resume pill)', chapter: 1, cinematicScrollState: 'yielded' },
];

export const READER_THEMES = ['void', 'crimson', 'abyss', 'sepia', 'emerald'] as const;
export type ReaderTheme = (typeof READER_THEMES)[number];

export const PARTICLE_INTENSITIES = ['off', 'low', 'default', 'high'] as const;
export type ParticleIntensity = (typeof PARTICLE_INTENSITIES)[number];
