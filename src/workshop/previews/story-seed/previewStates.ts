import type { MockStoryRef } from '../../../components/story-seed/shared/stubs';

export type PreviewCategory = 'intake' | 'blueprint' | 'story-bank' | 'auth';

export const PREVIEW_CATEGORIES: { id: PreviewCategory; label: string }[] = [
  { id: 'intake', label: 'Creation Workspace' },
  { id: 'blueprint', label: 'Blueprint Review' },
  { id: 'story-bank', label: 'Story Bank' },
  { id: 'auth', label: 'Sign In' },
];

export type PreviewState =
  | 'empty-intake'
  | 'filled-intake'
  | 'generating-blueprint'
  | 'blueprint-generation-error'
  | 'story-bank-import-open'
  | 'blueprint-review'
  | 'blueprint-generating-story'
  | 'story-bank-empty'
  | 'story-bank-populated'
  | 'story-bank-loading'
  | 'story-bank-load-error'
  | 'auth-gated';

export interface PreviewScenario {
  id: PreviewState;
  label: string;
  category: PreviewCategory;
  /** Passed straight through as `CreationModal`'s `isGenerating` prop. */
  isGenerating?: boolean;
  /** Drives the store's `activeAgentId` (the VERSA icon/label swap). */
  activeAgentId?: string | null;
  /** Whether the mock account is "signed in" for this scenario. */
  signedIn?: boolean;
  /**
   * Mirrors production's `LOCAL_ONLY_MODE`. Defaults to `true` (no auth
   * gate — matches almost every production deployment). Set `false` to reach
   * the auth-gated screen, or together with `signedIn` to browse the mock
   * account's Story Bank (the populated fixtures belong to that account).
   */
  localOnlyMode?: boolean;
  /** Populate the mock Story Bank for this scenario. */
  storyBank?: 'empty' | 'populated' | 'loading' | 'error';
  /** Passed through as CreationModal's external error state. */
  error?: string;
  /**
   * Mock manifested stories linked back to their seeds by `sourceSeedId`, so
   * Story Bank cards can show the "Novel Manifested" state.
   */
  stories?: MockStoryRef[];
  /**
   * A real production interaction the Workshop drives after mount, by
   * clicking the actual rendered control (never a shortcut into internal
   * state) — same approach as `reader-chamber`'s `clickInChamber`.
   */
  uiAction?: 'fill-intake' | 'open-import-panel' | 'use-first-seed' | 'open-story-bank';
}

export const scenarios: PreviewScenario[] = [
  {
    id: 'empty-intake',
    label: 'Empty creation workspace (Origin active)',
    category: 'intake',
  },
  {
    id: 'filled-intake',
    label: 'Filled workspace (origin, ARC, world, characters, faction)',
    category: 'intake',
    uiAction: 'fill-intake',
  },
  {
    id: 'generating-blueprint',
    label: 'Generating blueprint (spinner)',
    category: 'intake',
    isGenerating: true,
    uiAction: 'fill-intake',
  },
  {
    id: 'blueprint-generation-error',
    label: 'Blueprint generation error',
    category: 'intake',
    error: 'The World Blueprint could not be generated. Please try again.',
  },
  {
    id: 'blueprint-review',
    label: 'World Blueprint review',
    category: 'blueprint',
    signedIn: true,
    localOnlyMode: false,
    storyBank: 'populated',
    uiAction: 'use-first-seed',
  },
  {
    id: 'blueprint-generating-story',
    label: 'Blueprint review — starting story (VERSA)',
    category: 'blueprint',
    signedIn: true,
    localOnlyMode: false,
    storyBank: 'populated',
    uiAction: 'use-first-seed',
    isGenerating: true,
    activeAgentId: 'versa',
  },
  {
    id: 'story-bank-empty',
    label: 'Story Bank — empty',
    category: 'story-bank',
    signedIn: true,
    localOnlyMode: false,
    storyBank: 'empty',
    uiAction: 'open-story-bank',
  },
  {
    id: 'story-bank-populated',
    label: 'Story Bank — 2 saved seeds (one manifested)',
    category: 'story-bank',
    signedIn: true,
    localOnlyMode: false,
    storyBank: 'populated',
    stories: [{ id: 'preview-story-1', sourceSeedId: 'preview-seed-1', genre: 'Xianxia' }],
    uiAction: 'open-story-bank',
  },
  {
    id: 'story-bank-loading',
    label: 'Story Bank — loading',
    category: 'story-bank',
    signedIn: true,
    localOnlyMode: false,
    storyBank: 'loading',
    uiAction: 'open-story-bank',
  },
  {
    id: 'story-bank-load-error',
    label: 'Story Bank — load error with retry',
    category: 'story-bank',
    signedIn: true,
    localOnlyMode: false,
    storyBank: 'error',
    uiAction: 'open-story-bank',
  },
  {
    id: 'story-bank-import-open',
    label: 'Story Bank — import panel open',
    category: 'story-bank',
    uiAction: 'open-import-panel',
  },
  {
    id: 'auth-gated',
    label: 'Signed out — "Your Destiny Awaits" auth gate',
    category: 'auth',
    signedIn: false,
    localOnlyMode: false,
  },
];

export const scenariosInCategory = (category: PreviewCategory) =>
  scenarios.filter(scenario => scenario.category === category);
