export type PreviewCategory = 'intake' | 'blueprint' | 'library' | 'auth';

export const PREVIEW_CATEGORIES: { id: PreviewCategory; label: string }[] = [
  { id: 'intake', label: 'Intake' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'library', label: 'Library' },
  { id: 'auth', label: 'Auth' },
];

export type PreviewState =
  | 'empty-intake'
  | 'filled-intake'
  | 'generating-blueprint'
  | 'import-panel-open'
  | 'blueprint-review'
  | 'blueprint-generating-story'
  | 'library-empty'
  | 'library-populated'
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
   * gate, Seed Library panel hidden — matches almost every production
   * deployment). Set `false` to reach the auth-gated screen or show the
   * account-only Seed Library panel, both hidden whenever `true`.
   */
  localOnlyMode?: boolean;
  /** Populate the mock seed library for this scenario. */
  seedLibrary?: 'empty' | 'populated';
  /**
   * A real production interaction the Workshop drives after mount, by
   * clicking the actual rendered control (never a shortcut into internal
   * state) — same approach as `reader-chamber`'s `clickInChamber`.
   */
  uiAction?: 'fill-intake' | 'open-import-panel' | 'use-first-seed';
}

export const scenarios: PreviewScenario[] = [
  {
    id: 'empty-intake',
    label: 'Empty intake form',
    category: 'intake',
  },
  {
    id: 'filled-intake',
    label: 'Filled intake (core, world, MC, power, plot, +1 character, +1 faction)',
    category: 'intake',
    uiAction: 'fill-intake',
  },
  {
    id: 'generating-blueprint',
    label: 'Generating blueprint (spinner)',
    category: 'intake',
    isGenerating: true,
  },
  {
    id: 'import-panel-open',
    label: 'Import World Seed panel open',
    category: 'intake',
    uiAction: 'open-import-panel',
  },
  {
    id: 'blueprint-review',
    label: 'World Blueprint review',
    category: 'blueprint',
    signedIn: true,
    localOnlyMode: false,
    seedLibrary: 'populated',
    uiAction: 'use-first-seed',
  },
  {
    id: 'blueprint-generating-story',
    label: 'Blueprint review — starting story (VERSA)',
    category: 'blueprint',
    signedIn: true,
    localOnlyMode: false,
    seedLibrary: 'populated',
    uiAction: 'use-first-seed',
    isGenerating: true,
    activeAgentId: 'versa',
  },
  {
    id: 'library-empty',
    label: 'Seed library — empty',
    category: 'library',
    signedIn: true,
    localOnlyMode: false,
    seedLibrary: 'empty',
  },
  {
    id: 'library-populated',
    label: 'Seed library — 2 saved seeds',
    category: 'library',
    signedIn: true,
    localOnlyMode: false,
    seedLibrary: 'populated',
  },
  {
    id: 'auth-gated',
    label: 'Signed out — "Sync Spirit" auth gate',
    category: 'auth',
    signedIn: false,
    localOnlyMode: false,
  },
];

export const scenariosInCategory = (category: PreviewCategory) =>
  scenarios.filter(scenario => scenario.category === category);
